import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import {
    getWalletBalance,
    rechargeWallet,
    getTransactionHistory,
    validateRechargeCode,
    clearWalletError,
    rechargeWithFawaterk
} from "../../Redux/Slices/WalletSlice";
import { getPaymentServices } from "../../Redux/Slices/WhatsAppServiceSlice";
import { formatCairoDate } from "../../utils/timezone";
import {
    FaWallet,
    FaCreditCard,
    FaHistory,
    FaPlus,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaWhatsapp,
    FaClock,
    FaMobileAlt,
    FaStore
} from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";

export default function Wallet() {
    const dispatch = useDispatch();
    const location = useLocation(); // Hook to access URL params
    const navigate = useNavigate();
    const { data: user } = useSelector((state) => state.auth);

    const [showAmount, setShowAmount] = useState(false);
    const [activeTab, setActiveTab] = useState("balance");
    const [rechargeForm, setRechargeForm] = useState({ code: "", amount: "" });
    const [selectedMethod, setSelectedMethod] = useState("code");
    const [fawaterkAmount, setFawaterkAmount] = useState("");
    const [paymentResult, setPaymentResult] = useState(null);

    const [walletNumber, setWalletNumber] = useState("");

    // Initialize wallet number with user's phone number if available
    useEffect(() => {
        if (user?.phoneNumber) {
            setWalletNumber(user.phoneNumber);
        }
    }, [user]);

    const {
        balance = 0,
        transactions = [],
        loading,
        error,
        rechargeError,
        rechargeLoading,
        codeValidation
    } = useSelector((state) => state.wallet);

    const { services: whatsappServices } = useSelector((state) => state.whatsappService);

    // Handle Payment Redirects
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        // Check for 'payment' (old) or 'status' (new backend)
        const paymentStatus = queryParams.get("payment") || queryParams.get("status");

        if (paymentStatus === "success") {
            toast.success("تمت عملية الدفع بنجاح! جاري تحديث الرصيد...");
            dispatch(getWalletBalance());
            dispatch(getTransactionHistory());
            // Re-fetch balance after delays to account for webhook processing time
            const timer1 = setTimeout(() => {
                dispatch(getWalletBalance());
                dispatch(getTransactionHistory());
            }, 3000);
            const timer2 = setTimeout(() => {
                dispatch(getWalletBalance());
                dispatch(getTransactionHistory());
            }, 7000);
            // Clear the query param
            navigate("/wallet", { replace: true });
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else if (paymentStatus === "failed") {
            toast.error("فشلت عملية الدفع. يرجى المحاولة مرة أخرى.");
            navigate("/wallet", { replace: true });
        } else if (paymentStatus === "pending") {
            toast("عملية الدفع قيد المعالجة...", { icon: "⏳" });
            navigate("/wallet", { replace: true });
        }
    }, [location.search, dispatch, navigate]);

    useEffect(() => {
        if (user) {
            dispatch(getWalletBalance());
            dispatch(getTransactionHistory());
            dispatch(getPaymentServices());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearWalletError());
        }
        if (rechargeError) {
            toast.error(rechargeError);
            dispatch(clearWalletError());
        }
    }, [error, rechargeError, dispatch]);

    const handleRechargeFormChange = (e) => {
        const { name, value } = e.target;
        setRechargeForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCodeValidation = async (code) => {
        if (code.length >= 6) {
            await dispatch(validateRechargeCode({ code }));
        }
    };

    const handleRecharge = async (e) => {
        e.preventDefault();

        if (selectedMethod === 'code') {
            if (!rechargeForm.code) {
                toast.error("يرجى إدخال كود الشحن");
                return;
            }

            try {
                await dispatch(rechargeWallet({
                    code: rechargeForm.code,
                    amount: 0 // Amount is determined by code on backend/validation
                })).unwrap();

                toast.success("تم شحن المحفظة بنجاح!");
                setRechargeForm({ code: "", amount: "" });
                dispatch(getWalletBalance());
            } catch (error) {
                // Error handled in useEffect
            }
        } else {
            // Fawaterk Payment
            if (!fawaterkAmount || parseFloat(fawaterkAmount) < 10) {
                toast.error("أقل مبلغ للشحن هو 10 جنيه");
                return;
            }

            let methodId;
            if (selectedMethod === 'visa') methodId = 2;
            else if (selectedMethod === 'fawry') methodId = 3;
            else if (selectedMethod === 'wallet') methodId = 4;

            if (selectedMethod === 'wallet' && !walletNumber) {
                toast.error("يرجى إدخال رقم المحفظة");
                return;
            }

            try {
                const result = await dispatch(rechargeWithFawaterk({
                    amount: parseFloat(fawaterkAmount),
                    paymentMethodId: methodId,
                    phoneNumber: selectedMethod === 'wallet' ? walletNumber : undefined
                })).unwrap();

                if (result.success && result.data) {
                    const paymentData = result.data.payment_data;

                    if (paymentData && paymentData.error) {
                        let errorMessage = paymentData.error;
                        if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes("unavailable")) {
                            errorMessage = "عذراً، خدمة المحفظة الإلكترونية غير متاحة حالياً، يرجى المحاولة مرة أخرى لاحقاً";
                        }
                        toast.error(errorMessage);
                        return;
                    }

                    if (selectedMethod === 'visa' && paymentData.redirectTo) {
                        window.location.href = paymentData.redirectTo;
                    } else if (selectedMethod === 'fawry' && paymentData.fawryCode) {
                        setPaymentResult({
                            type: 'fawry',
                            code: paymentData.fawryCode,
                            expireDate: paymentData.expireDate
                        });
                        toast.success("تم إنشاء كود الدفع بنجاح");
                    } else if (selectedMethod === 'wallet' && paymentData.meezaReference) {
                        setPaymentResult({
                            type: 'wallet',
                            reference: paymentData.meezaReference,
                            qr: paymentData.meezaQrCode // If available
                        });
                        toast.success("تم إنشاء طلب الدفع بنجاح"); // Likely need redirect for wallet too? Docs say redirect: false for Meeza/Wallet usually
                    } else if (paymentData.redirectTo) {
                        window.location.href = paymentData.redirectTo;
                    }
                }
            } catch (error) {
                console.error("Payment Error", error);
            }
        }
    };

    const formatDate = (dateString) => {
        return formatCairoDate(dateString, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'recharge':
                return <FaArrowUp className="text-green-500" />;
            case 'purchase':
                return <FaArrowDown className="text-green-500" />;
            case 'refund':
                return <FaArrowUp className="text-green-500" />;
            default:
                return <FaMoneyBillWave className="text-gray-500" />;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'recharge':
                return 'text-green-600 bg-red-50 dark:bg-green-900/20';
            case 'purchase':
                return 'text-green-600 bg-red-50 dark:bg-green-900/20';
            case 'refund':
                return 'text-green-600 bg-red-50 dark:bg-green-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
        }
    };

    const getTransactionTypeText = (type) => {
        switch (type) {
            case 'recharge':
                return 'شحن';
            case 'purchase':
                return 'شراء';
            case 'refund':
                return 'استرداد';
            default:
                return 'معاملة';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'مكتمل';
            case 'pending':
                return 'قيد الانتظار';
            case 'failed':
                return 'فشل';
            default:
                return status;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <FaWallet className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            محفظتي
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            إدارة رصيدك وعرض سجل المعاملات
                        </p>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    الرصيد الحالي
                                </h2>
                                <div className="flex items-center space-x-reverse space-x-2">
                                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        {showAmount ? `${balance.toFixed(2)} جنيه` : "**** جنيه"}
                                    </span>
                                    <button
                                        onClick={() => setShowAmount(!showAmount)}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {showAmount ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    إجمالي المعاملات
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {transactions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-reverse space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab("balance")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "balance"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            <FaCreditCard className="inline ml-2" />
                            شحن المحفظة
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "history"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            <FaHistory className="inline ml-2" />
                            سجل المعاملات
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        {activeTab === "balance" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    شحن محفظتك
                                </h3>

                                {/* Payment Method Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        اختر طريقة الدفع
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <button
                                            onClick={() => setSelectedMethod('code')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedMethod === 'code'
                                                ? 'border-green-500 bg-red-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                                                }`}
                                        >
                                            <FaStore className="text-2xl" />
                                            <span className="font-medium text-sm">كود شحن</span>
                                        </button>

                                        <button
                                            onClick={() => setSelectedMethod('visa')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedMethod === 'visa'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                                                }`}
                                        >
                                            <FaCreditCard className="text-2xl" />
                                            <span className="font-medium text-sm">فيزا / ماستركارد</span>
                                        </button>

                                        <button
                                            onClick={() => setSelectedMethod('wallet')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedMethod === 'wallet'
                                                ? 'border-green-500 bg-red-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                                                }`}
                                        >
                                            <FaMobileAlt className="text-2xl" />
                                            <span className="font-medium text-sm">محفظة إلكترونية</span>
                                        </button>

                                        <button
                                            onClick={() => setSelectedMethod('fawry')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedMethod === 'fawry'
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800'
                                                }`}
                                        >
                                            <span className="text-2xl font-bold">Fawry</span>
                                            <span className="font-medium text-sm">فوري</span>
                                        </button>
                                    </div>
                                </div>

                                {/* How to recharge instructions - Shown only when 'Code' is selected */}
                                {selectedMethod === 'code' && (
                                    <div className="bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                                        <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                                            كيفية الشحن:
                                        </h4>
                                        <ul className="space-y-2 text-green-800 dark:text-green-200">
                                            <li className="flex items-start">
                                                <span className="text-green-600 dark:text-green-400 ml-2">•</span>
                                                تواصل معنا على واتساب: <strong>01035448853</strong> للحصول على كود شحن
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-600 dark:text-green-400 ml-2">•</span>
                                                اشتر كود شحن من البائعين المعتمدين
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-600 dark:text-green-400 ml-2">•</span>
                                                أدخل الكود والمبلغ في النموذج أعلاه
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-600 dark:text-green-400 ml-2">•</span>
                                                سيتم إضافة المبلغ إلى محفظتك فوراً
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-600 dark:text-green-400 ml-2">•</span>
                                                استخدم رصيدك لشراء الكورسات والخدمات التي ستتواصل معنا بشأنها على واتساب
                                            </li>
                                        </ul>

                                        {/* Contact Methods */}
                                        <div className="mt-4 space-y-3">
                                            {/* WhatsApp Contact */}
                                            <div className="p-4 bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                                <h5 className="text-md font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                                    <FaWhatsapp className="text-green-600 dark:text-green-400" />
                                                    للحصول على كود شحن - تواصل معنا على واتساب
                                                </h5>
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-600">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            رقم الواتساب
                                                        </div>
                                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            01035448853
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            متاح على مدار 24/7
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const message = `مرحباً! أنا مهتم بشراء كود شحن للمحفظة. هل يمكنك تقديم المزيد من المعلومات؟`;
                                                            window.open(`https://wa.me/201035448853?text=${encodeURIComponent(message)}`, '_blank');
                                                        }}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <FaWhatsapp />
                                                        تواصل الآن
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* WhatsApp Contact Information */}
                                        {whatsappServices && whatsappServices.length > 0 && (
                                            <div className="mt-4 p-4 bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                                <h5 className="text-md font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                                    <FaWhatsapp className="text-green-600 dark:text-green-400" />
                                                    تحتاج مساعدة؟ تواصل معنا على واتساب
                                                </h5>
                                                <div className="space-y-3">
                                                    {whatsappServices.map((service) => (
                                                        <div key={service._id} className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{service.icon}</span>
                                                                <h6 className="font-medium text-green-900 dark:text-green-100">
                                                                    {service.name}
                                                                </h6>
                                                            </div>
                                                            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                                                                {service.description}
                                                            </p>
                                                            {service.whatsappNumbers.map((number, index) => (
                                                                <div key={number._id || index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-600">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                                            {number.name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {number.number}
                                                                        </div>
                                                                        {number.workingHours && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                                <FaClock />
                                                                                {number.workingHours}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const message = `مرحباً! أنا مهتم بخدمة ${service.name}. ${service.instructions || 'هل يمكنك تقديم المزيد من المعلومات؟'}`;
                                                                            window.open(`https://wa.me/${number.number}?text=${encodeURIComponent(message)}`, '_blank');
                                                                        }}
                                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                                    >
                                                                        <FaWhatsapp />
                                                                        تواصل
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 p-2 bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                                                    <p className="text-xs text-green-800 dark:text-green-200">
                                                        <strong>ساعات العمل:</strong> الدعم متاح على مدار 24/7
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Payment Result Modal/Alert */}
                                {paymentResult && (
                                    <div className="mb-6 p-4 bg-white dark:bg-gray-800 border-2 border-green-500 rounded-xl shadow-lg animate-fade-in">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500" />
                                                طلبح الدفع جاهز
                                            </h4>
                                            <button
                                                onClick={() => setPaymentResult(null)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        </div>

                                        {paymentResult.type === 'fawry' && (
                                            <div className="text-center">
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">كود الدفع عبر فوري:</p>
                                                <div className="text-3xl font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-2 select-all">
                                                    {paymentResult.code}
                                                </div>
                                                <p className="text-sm text-green-500">
                                                    تنتهي الصلاحية في: {formatDate(paymentResult.expireDate)}
                                                </p>
                                                <div className="mt-4 text-right bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                                                    <h5 className="font-bold text-blue-800 dark:text-blue-200 mb-2">طريقة الدفع:</h5>
                                                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                        <li>توجه إلى أي منفذ فوري.</li>
                                                        <li>اطلب الدفع عن طريق خدمة <strong>"Fawry Pay"</strong>.</li>
                                                        <li>أعط التاجر كود الدفع الموضح أعلاه.</li>
                                                        <li>ادفع المبلغ المستحق واستلم الإيصال.</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {paymentResult.type === 'wallet' && (
                                            <div className="text-center">
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">رقم المرجع:</p>
                                                <div className="text-2xl font-mono font-bold text-green-600 bg-red-50 dark:bg-green-900/20 p-3 rounded-lg mb-4 select-all">
                                                    {paymentResult.reference}
                                                </div>
                                                {paymentResult.qr && (
                                                    <div className="flex justify-center mb-4">
                                                        {/* QR Code rendering logic would go here if allowd, or just show text */}
                                                        <p className="text-xs text-gray-500">امسح كود QR لإتمام الدفع (إن وجد)</p>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    توجه إلى تطبيق محفظتك وأتمم عملية الدفع باستخدام رقم المرجع.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <form onSubmit={handleRecharge} className="space-y-6">
                                    {selectedMethod === 'code' ? (
                                        /* Code Input */
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                كود الشحن
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="code"
                                                    value={rechargeForm.code}
                                                    onChange={(e) => {
                                                        handleRechargeFormChange(e);
                                                        handleCodeValidation(e.target.value);
                                                    }}
                                                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="أدخل كود الشحن الخاص بك"
                                                    required
                                                />
                                                {rechargeForm.code && (
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                        {codeValidation.isValid ? (
                                                            <FaCheckCircle className="text-green-500 w-5 h-5" />
                                                        ) : codeValidation.error ? (
                                                            <FaTimesCircle className="text-green-500 w-5 h-5" />
                                                        ) : codeValidation.loading ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                                        ) : (
                                                            <FaExclamationTriangle className="text-green-500 w-5 h-5" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {codeValidation.error && (
                                                <p className="text-green-500 text-sm mt-1">{codeValidation.error}</p>
                                            )}

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المبلغ (للتأكيد فقط)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={rechargeForm.amount}
                                                    onChange={handleRechargeFormChange}
                                                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="أدخل المبلغ الموجود على الكارت"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Fawaterk Amount Input */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المبلغ المراد شحنه (جنيه)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={fawaterkAmount}
                                                    onChange={(e) => setFawaterkAmount(e.target.value)}
                                                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                                    placeholder="أدخل المبلغ (مثال: 100)"
                                                    min="10"
                                                    step="1"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    * قد يتم تطبيق رسوم خدمة إضافية بواسطة {selectedMethod === 'visa' ? 'البنك' : selectedMethod === 'fawry' ? 'فوري' : 'شركة المحمول'}.
                                                </p>
                                            </div>

                                            {selectedMethod === 'wallet' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        رقم المحفظة
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={walletNumber}
                                                        onChange={(e) => setWalletNumber(e.target.value)}
                                                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                                        placeholder="أدخل رقم المحفظة (مثال: 010xxxxxxxx)"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={rechargeLoading || (selectedMethod === 'code' && !codeValidation.isValid)}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        {rechargeLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                                                جاري المعالجة...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <FaPlus className="ml-2" />
                                                {selectedMethod === 'code' ? 'شحن بالكود' : 'متابعة للدفع'}
                                            </div>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    سجل المعاملات
                                </h3>

                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لم يتم العثور على معاملات. ابدأ بشحن محفظتك!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.map((transaction, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-reverse space-x-4">
                                                    <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                                                        {getTransactionIcon(transaction.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            الكود: {transaction.code}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                                            <FaCalendarAlt className="ml-1" />
                                                            {formatDate(transaction.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${transaction.type === 'recharge' || transaction.type === 'refund'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                        }`}>
                                                        {transaction.type === 'recharge' || transaction.type === 'refund' ? '+' : '-'}
                                                        {Math.abs(transaction.amount).toFixed(2)} جنيه
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : transaction.status === 'pending'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        }`}>
                                                        {getStatusText(transaction.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout >
    );
} 