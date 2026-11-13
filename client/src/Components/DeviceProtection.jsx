import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { registerDevice, checkDeviceAuthorization } from '../Redux/Slices/DeviceManagementSlice';
import { generateDeviceFingerprint, generateDeviceName, getDeviceType, getBrowserInfo, getOperatingSystem } from '../utils/deviceFingerprint';
import { FaDesktop, FaMobile, FaTabletAlt, FaExclamationTriangle, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const DeviceProtection = ({ children }) => {
    const dispatch = useDispatch();
    const { isLoggedIn, role } = useSelector((state) => state.auth);
    const { currentDevice, loading, error } = useSelector((state) => state.deviceManagement);
    
    const [deviceStatus, setDeviceStatus] = useState('checking'); // checking, authorized, unauthorized, registering
    const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
        // Device checking is now handled during login, so always allow access
        setDeviceStatus('authorized');
        
        // Commented out device checking since it's now handled during login
        // if (isLoggedIn && role !== 'ADMIN') {
        //     initializeDeviceProtection();
        // } else if (!isLoggedIn) {
        //     setDeviceStatus('authorized'); // Allow access for non-logged in users
        // } else if (role === 'ADMIN') {
        //     setDeviceStatus('authorized'); // Skip device check for admins
        // }
    }, [isLoggedIn, role]);

    const initializeDeviceProtection = async () => {
        try {
            setDeviceStatus('checking');
            
            // Generate device fingerprint and info
            const fingerprint = generateDeviceFingerprint();
            const deviceType = getDeviceType();
            const browserInfo = getBrowserInfo();
            const os = getOperatingSystem();
            const deviceName = generateDeviceName();

            const deviceData = {
                platform: deviceType,
                screenResolution: fingerprint.screenResolution,
                timezone: fingerprint.timezone,
                userAgent: fingerprint.userAgent,
                additionalInfo: {
                    browser: browserInfo.browser,
                    browserVersion: browserInfo.version,
                    os: os,
                    language: fingerprint.language,
                    colorDepth: fingerprint.colorDepth,
                    touchSupport: fingerprint.touchSupport
                }
            };

            setDeviceInfo({
                ...deviceData,
                deviceName,
                deviceType
            });

            // First, try to check if device is already authorized
            try {
                await dispatch(checkDeviceAuthorization(deviceData)).unwrap();

                setDeviceStatus('authorized');
            } catch (checkError) {

                // If device check fails, try to register the device
                await registerNewDevice(deviceData);
            }
        } catch (error) {

            if (error.message?.includes('DEVICE_LIMIT_EXCEEDED') || error.message?.includes('الحد الأقصى')) {
                setDeviceStatus('unauthorized');
            } else {
                // For other errors, allow access but log the error

                setDeviceStatus('authorized');
            }
        }
    };

    const registerNewDevice = async (deviceData) => {
        try {
            setDeviceStatus('registering');

            const result = await dispatch(registerDevice(deviceData)).unwrap();

            setDeviceStatus('authorized');
            toast.success('تم تسجيل الجهاز بنجاح في المنصة');
        } catch (registerError) {

            const errorMessage = registerError?.message || registerError || '';
            if (errorMessage.includes('DEVICE_LIMIT_EXCEEDED') || errorMessage.includes('الحد الأقصى')) {

                setDeviceStatus('unauthorized');
            } else {
                // For other errors, allow access with warning to avoid blocking logged-in users

                setDeviceStatus('authorized');
                toast.error('تحذير: لم يتم تسجيل الجهاز بشكل صحيح، لكن يمكنك المتابعة');
            }
        }
    };

    const getDeviceIcon = () => {
        if (!deviceInfo) return <FaDesktop />;
        
        switch (deviceInfo.deviceType) {
            case 'Mobile':
                return <FaMobile className="text-green-500" size={48} />;
            case 'Tablet':
                return <FaTabletAlt className="text-green-500" size={48} />;
            default:
                return <FaDesktop className="text-gray-500" size={48} />;
        }
    };

    const handleContactAdmin = () => {
        toast.info('يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة المصرحة');
    };

    const handleRetry = () => {
        initializeDeviceProtection();
    };

    // Show loading state
    if (deviceStatus === 'checking' || deviceStatus === 'registering') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8">
                    <FaSpinner className="animate-spin text-green-500 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {deviceStatus === 'checking' ? 'جاري التحقق من الجهاز...' : 'جاري تسجيل الجهاز...'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {deviceStatus === 'checking' 
                            ? 'نتحقق من صلاحية هذا الجهاز للوصول للمنصة'
                            : 'نقوم بتسجيل الجهاز في قائمة الأجهزة المصرحة'
                        }
                    </p>
                    {deviceInfo && (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="flex items-center justify-center mb-2">
                                {getDeviceIcon()}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {deviceInfo.deviceName}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Show unauthorized state
    if (deviceStatus === 'unauthorized') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
                <div className="text-center p-8 max-w-md mx-auto">
                    <FaExclamationTriangle className="text-green-500 mx-auto mb-4" size={64} />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        جهاز غير مصرح
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        لقد تم الوصول للحد الأقصى من الأجهزة المسموح لها بالوصول لحسابك. 
                        يمكنك الوصول للمنصة من جهازين فقط كحد أقصى.
                    </p>
                    
                    {deviceInfo && (
                        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                معلومات الجهاز الحالي:
                            </h3>
                            <div className="flex items-center justify-center mb-2">
                                {getDeviceIcon()}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {deviceInfo.deviceName}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleContactAdmin}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                        >
                            التواصل مع الإدارة
                        </button>
                        <button
                            onClick={handleRetry}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
                        >
                            إعادة المحاولة
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-red-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                            💡 نصائح للحل:
                        </h4>
                        <ul className="text-sm text-green-800 dark:text-green-300 text-right space-y-1">
                            <li>• تواصل مع الإدارة لإعادة تعيين أجهزتك</li>
                            <li>• تأكد من تسجيل الخروج من الأجهزة الأخرى</li>
                            <li>• استخدم نفس الجهاز الذي سجلت منه سابقاً</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Show authorized state (render children)
    if (deviceStatus === 'authorized') {
        return children;
    }

    // Fallback
    return children;
};

export default DeviceProtection; 