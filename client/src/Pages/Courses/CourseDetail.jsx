import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../Layout/Layout';
import { getCourseById } from '../../Redux/Slices/CourseSlice';
import {
  purchaseCourse,
  checkCoursePurchaseStatus,
  getWalletBalance
} from '../../Redux/Slices/PaymentSlice';
import { PaymentSuccessAlert, PaymentErrorAlert } from '../../Components/ModernAlert';
import WatchButton from '../../Components/WatchButton';
import OptimizedLessonContentModal from '../../Components/OptimizedLessonContentModal';
import {
  FaBookOpen,
  FaUser,
  FaStar,
  FaPlay,
  FaClock,
  FaUsers,
  FaArrowRight,
  FaArrowLeft,
  FaGraduationCap,
  FaCheckCircle,
  FaEye,
  FaShoppingCart,
  FaList,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaUnlock,
  FaWallet,
  FaTimes,
  FaExclamationTriangle,
  FaClipboardList
} from 'react-icons/fa';
import { generateImageUrl } from '../../utils/fileUtils';
import { placeholderImages } from '../../utils/placeholderImages';
import { checkCourseAccess, redeemCourseAccessCode } from '../../Redux/Slices/CourseAccessSlice';
import { axiosInstance } from '../../Helpers/axiosInstance';
import RemainingDaysLabel from '../../Components/RemainingDaysLabel';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, loading } = useSelector((state) => state.course);
  const { walletBalance, coursePurchaseStatus, loading: paymentLoading } = useSelector((state) => state.payment);
  const { data: user, isLoggedIn } = useSelector((state) => state.auth);
  const courseAccessState = useSelector((state) => state.courseAccess.byCourseId[id]);
  const [accessAlertShown, setAccessAlertShown] = useState(false);


  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [showCoursePurchaseModal, setShowCoursePurchaseModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getCourseById(id));
    }
  }, [dispatch, id]);

  // Check timed-access via code
  useEffect(() => {
    if (id && user && isLoggedIn) {
      dispatch(checkCourseAccess(id));
    }
  }, [dispatch, id, user, isLoggedIn]);

  // Periodic check for access expiration (every minute)
  useEffect(() => {
    if (!courseAccessState?.hasAccess || !courseAccessState?.accessEndAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endDate = new Date(courseAccessState.accessEndAt);

      if (endDate <= now) {
        // Access has expired, refresh status
        dispatch(checkCourseAccess(id));

        // Show immediate notification that access has expired
        if (!accessAlertShown) {
          setAlertMessage('انتهت صلاحية الوصول عبر الكود. يرجى إعادة تفعيل كود جديد أو شراء المحتوى.');
          setShowErrorAlert(true);
          setAccessAlertShown(true);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [courseAccessState?.hasAccess, courseAccessState?.accessEndAt, dispatch, id, accessAlertShown]);

  // Fetch wallet balance only when user is logged in
  useEffect(() => {
    if (user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      dispatch(getWalletBalance());
    }
  }, [dispatch, user, isLoggedIn]);



  // Check course purchase status
  useEffect(() => {
    if (currentCourse && user && isLoggedIn && currentCourse.price > 0) {
      dispatch(checkCoursePurchaseStatus({ courseId: currentCourse._id }));
    }
  }, [currentCourse, user, isLoggedIn, dispatch]);

  // Check if course is purchased
  const isCoursePurchased = () => {
    if (!currentCourse) return false;
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return true;
    if (courseAccessState?.hasAccess) return true;
    return coursePurchaseStatus[currentCourse._id] || false;
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const getTotalLessons = (course) => {
    if (!course) return 0;
    let total = 0;
    if (course.directLessons) {
      total += course.directLessons.length;
    }
    if (course.units) {
      course.units.forEach(unit => {
        if (unit.lessons) {
          total += unit.lessons.length;
        }
      });
    }
    return total;
  };


  const getTotalDuration = (course) => {
    return getTotalLessons(course) * 45; // Assuming 45 minutes per lesson
  };

  // Check if user has access to content (through course purchase, code redemption, or free course)
  // User must be logged in to access any content
  const hasContentAccess = () => {
    // Must be logged in to access any content
    if (!user || !isLoggedIn) {
      return false;
    }

    // Admin users have access to all content
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return true;
    }

    // If course is free (no price or price = 0), logged-in users can access
    const coursePrice = currentCourse?.price || 0;
    if (coursePrice <= 0) {
      return true;
    }

    // If entire course is purchased, all content is accessible
    if (isCoursePurchased()) {
      return true;
    }

    // Check if code-based access has expired
    if (courseAccessState?.source === 'code' && courseAccessState?.accessEndAt) {
      const now = new Date();
      const endDate = new Date(courseAccessState.accessEndAt);
      const isExpired = endDate <= now;

      // If access has expired, block access
      if (isExpired) {
        return false;
      }
    }

    // If user has active course access via code, allow viewing
    if (courseAccessState?.hasAccess) {
      return true;
    }

    // No access - user needs to purchase course or redeem code
    return false;
  };


  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!redeemCode.trim()) {
      setAlertMessage('يرجى إدخال الكود أولاً');
      setShowErrorAlert(true);
      return;
    }

    // Basic code format validation
    const codeFormat = /^[A-Z0-9]{8,12}$/;
    if (!codeFormat.test(redeemCode.trim().toUpperCase())) {
      setAlertMessage('تنسيق الكود غير صحيح. يجب أن يتكون الكود من 8-12 حرف وأرقام باللغة الإنجليزية فقط');
      setShowErrorAlert(true);
      return;
    }

    try {
      await dispatch(redeemCourseAccessCode({
        code: redeemCode.trim().toUpperCase(),
        courseId: currentCourse._id
      })).unwrap();

      setRedeemCode('');
      setAlertMessage('🎉 تم تفعيل الوصول للكورس بنجاح! يمكنك الآن الوصول لجميع محتويات الكورس');
      setShowSuccessAlert(true);

      // Clear the access alert since access is restored
      setAccessAlertShown(false);

      // Refresh course access status
      dispatch(checkCourseAccess(currentCourse._id));
    } catch (err) {
      // Enhanced error messages based on backend responses
      let errorMessage = 'تعذر تفعيل الكود';

      if (err?.message) {
        const message = err.message.toLowerCase();

        if (message.includes('invalid or expired code')) {
          errorMessage = '❌ الكود غير صحيح أو منتهي الصلاحية. تأكد من كتابة الكود بشكل صحيح';
        } else if (message.includes('not valid for this course')) {
          errorMessage = '🚫 هذا الكود غير صالح لهذا الكورس. تأكد من أنك تستخدم الكود الصحيح للكورس المطلوب';
        } else if (message.includes('expired for its access window')) {
          errorMessage = '⏰ انتهت صلاحية هذا الكود. يرجى الحصول على كود جديد من المدرس';
        } else if (message.includes('course not found')) {
          errorMessage = '📚 الكورس المرتبط بهذا الكود غير موجود. يرجى التواصل مع الدعم الفني';
        } else if (message.includes('code is required')) {
          errorMessage = '📝 يرجى إدخال الكود';
        } else if (message.includes('already used')) {
          errorMessage = '🔒 تم استخدام هذا الكود من قبل. كل كود يمكن استخدامه مرة واحدة فقط';
        } else {
          errorMessage = `❌ ${err.message}`;
        }
      }

      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
    }
  };

  const handlePreviewClick = (item, purchaseType) => {
    // Preview is always allowed for all users (logged in or not)
    // It just shows lesson info, not the actual content
    setPreviewItem({ ...item, purchaseType });
    setShowPreviewModal(true);
  };



  const handleCoursePurchase = async () => {
    if (!currentCourse) return;

    try {
      await dispatch(purchaseCourse({
        courseId: currentCourse._id
      })).unwrap();

      setShowCoursePurchaseModal(false);
      setAlertMessage('تم شراء الكورس بنجاح! يمكنك الآن الوصول لجميع المحتوى');
      setShowSuccessAlert(true);

      // Refresh wallet balance
      dispatch(getWalletBalance());
    } catch (error) {
      setAlertMessage(error.message || 'حدث خطأ أثناء شراء الكورس');
      setShowErrorAlert(true);
    }
  };

  const handleCoursePurchaseClick = () => {
    if (!user || !isLoggedIn) {
      setAlertMessage('يرجى تسجيل الدخول أولاً لشراء الكورس');
      setShowErrorAlert(true);
      setTimeout(() => {
        navigate('/login', { state: { from: `/courses/${id}` } });
      }, 2000);
      return;
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      setAlertMessage('أنت مدير النظام - لديك صلاحية الوصول لجميع المحتوى');
      setShowSuccessAlert(true);
      return;
    }

    if (isCoursePurchased()) {
      setAlertMessage('لقد قمت بشراء هذا الكورس مسبقاً');
      setShowSuccessAlert(true);
      return;
    }

    setShowCoursePurchaseModal(true);
  };

  const handleWatchClick = async (item, purchaseType, unitId = null) => {
    // Check if user is logged in first
    if (!user || !isLoggedIn) {
      setAlertMessage('يرجى تسجيل الدخول أولاً لمشاهدة المحتوى');
      setShowErrorAlert(true);
      setTimeout(() => {
        navigate('/login', { state: { from: `/courses/${id}` } });
      }, 2000);
      return;
    }

    // Admin users have unrestricted access
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      // Store lesson info including unit context for the optimized modal
      const lessonInfo = {
        lessonId: item._id,
        courseId: currentCourse._id,
        unitId: unitId, // Will be null for درس
        title: item.title
      };
      setSelectedLesson(lessonInfo);
      setShowLessonModal(true);
      return;
    }

    // If entire course is purchased, allow access to all content
    if (isCoursePurchased()) {
      const lessonInfo = {
        lessonId: item._id,
        courseId: currentCourse._id,
        unitId: unitId,
        title: item.title
      };
      setSelectedLesson(lessonInfo);
      setShowLessonModal(true);
      return;
    }

    // Check if user has course access (via purchase or code)
    if (!hasContentAccess()) {
      // Check if code-based access has expired
      if (courseAccessState?.source === 'code' && courseAccessState?.accessEndAt) {
        const now = new Date();
        const endDate = new Date(courseAccessState.accessEndAt);
        if (endDate <= now) {
          setAlertMessage('انتهت صلاحية الوصول عبر الكود. يرجى إعادة تفعيل كود جديد أو شراء الكورس.');
          setShowErrorAlert(true);
          return;
        }
      }
      // No access - show message
      setAlertMessage('يجب شراء الكورس أو تفعيل كود للوصول إلى هذا المحتوى.');
      setShowErrorAlert(true);
      return;
    }

    // User has access - open the lesson
    const lessonInfo = {
      lessonId: item._id,
      courseId: currentCourse._id,
      unitId: unitId,
      title: item.title
    };
    setSelectedLesson(lessonInfo);
    setShowLessonModal(true);
  };

  const renderPurchaseButton = (item, purchaseType, showButton = true, unitId = null) => {

    // Admin users have access to all content
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return (
        <WatchButton
          item={item}
          purchaseType={purchaseType}
          onWatch={(item, purchaseType) => handleWatchClick(item, purchaseType, unitId)}
          variant="primary"
          showButton={showButton}
        />
      );
    }

    // Check if user has access through course purchase or code redemption
    if (hasContentAccess()) {
      return (
        <WatchButton
          item={item}
          purchaseType={purchaseType}
          onWatch={(item, purchaseType) => handleWatchClick(item, purchaseType, unitId)}
          variant="primary"
          showButton={showButton}
        />
      );
    }

    // Don't show anything if showButton is false
    if (!showButton) {
      return null;
    }

    // User is not logged in - show sign in button
    if (!user || !isLoggedIn) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreviewClick(item, purchaseType)}
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <FaEye />
            <span>معاينة</span>
          </button>
          <button
            onClick={() => {
              setAlertMessage('يرجى تسجيل الدخول أولاً لمشاهدة المحتوى');
              setShowErrorAlert(true);
              setTimeout(() => {
                navigate('/login', { state: { from: `/courses/${id}` } });
              }, 2000);
            }}
            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
          >
            <FaUser />
            <span>سجل دخول للمشاهدة</span>
          </button>
        </div>
      );
    }

    // User is logged in but doesn't have access - show lock icon with message to purchase course or redeem code
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePreviewClick(item, purchaseType)}
          className="text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <FaEye />
          <span>معاينة</span>
        </button>
        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm">
          <FaLock className="text-gray-400" />
          <span>اشتري الكورس أو فعّل كود</span>
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل تفاصيل الدرس...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentCourse) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              الدرس غير موجودة
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              عذراً، الدرس التي تبحث عنها غير موجودة
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>العودة للكورسات </span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors text-sm sm:text-base"
          >
            <FaArrowLeft className="text-sm sm:text-base" />
            <span>العودة للكورسات</span>
          </Link>
        </div>

        {/* Course Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Course Hero Section */}
            <div className="relative h-48 sm:h-64 overflow-hidden">
              {currentCourse.image?.secure_url ? (
                <>
                  <img
                    src={generateImageUrl(currentCourse.image?.secure_url)}
                    alt={currentCourse.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = placeholderImages.course;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </>
              ) : (
                <>
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600"></div>
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaBookOpen className="text-6xl sm:text-8xl text-white opacity-80" />
                  </div>
                </>
              )}

              {/* Fallback gradient for broken images */}
              <div className="hidden w-full h-full bg-gradient-to-br from-green-500 to-green-600">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBookOpen className="text-8xl text-white opacity-80" />
                </div>
              </div>

              <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
                <span className="px-2 py-1 sm:px-3 sm:py-1 bg-white bg-opacity-90 text-gray-800 text-xs sm:text-sm font-medium rounded-full">
                  {currentCourse.stage?.name || 'غير محدد'}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentCourse.title}
                  </h1>

                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {currentCourse.description}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                        {getTotalLessons(currentCourse)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">درس</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                        {currentCourse.units?.length || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">وحدة</div>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-red-50 dark:bg-green-900/20 rounded-lg mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-white text-lg sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {currentCourse.instructor?.name || 'غير محدد'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">المدرس</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 lg:sticky lg:top-6">
                    {/* Wallet Balance */}
                    {user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
                      <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FaWallet className="text-green-600 text-sm sm:text-base" />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">رصيد المحفظة</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {walletBalance} جنيه
                        </div>
                      </div>
                    )}

                    {/* Course Price and Buy Button - Only show if course has a price */}
                    {currentCourse.price > 0 && (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="text-center mb-3">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">سعر الكورس</p>
                          <div className="text-2xl sm:text-3xl font-bold text-green-600">
                            {currentCourse.price} جنيه
                          </div>
                        </div>

                        {isCoursePurchased() ? (
                          <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                              <FaCheckCircle />
                              <span className="font-medium">تم شراء الكورس</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={handleCoursePurchaseClick}
                            disabled={paymentLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaShoppingCart />
                            <span>شراء الكورس كاملاً</span>
                          </button>
                        )}

                        {!isCoursePurchased() && user && isLoggedIn && walletBalance < currentCourse.price && (
                          <p className="text-xs text-green-600 text-center mt-2">
                            رصيد المحفظة غير كافي لشراء الكورس
                          </p>
                        )}
                      </div>
                    )}

                    {/* Remaining Days Label - Only show if course is NOT purchased */}
                    {!isCoursePurchased() && courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && (
                      <div className="mb-4 sm:mb-6">
                        <RemainingDaysLabel
                          accessEndAt={courseAccessState.accessEndAt}
                          className="w-full justify-center text-sm sm:text-base"
                          showExpiredMessage={!courseAccessState?.hasAccess}
                        />
                      </div>
                    )}

                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <FaBookOpen className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">المادة: {currentCourse.subject?.title || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <FaGraduationCap className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">المرحلة: {currentCourse.stage?.name || 'غير محدد'}</span>
                      </div>
                    </div>

                    {/* Redeem Access Code - Only show if course is NOT purchased */}
                    {user && isLoggedIn && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && !isCoursePurchased() && (
                      <div className="space-y-3">
                        {/* Show expired access warning */}
                        {courseAccessState?.source === 'code' && !courseAccessState?.hasAccess && courseAccessState?.accessEndAt && (
                          <div className="p-3 bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                              <FaExclamationTriangle className="text-green-600" />
                              <span className="text-sm font-medium">خلاص الكود انتهى</span>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              لازم تدخل كود جديد عشان ترجع تدخل الكورس تاني
                            </p>
                          </div>
                        )}

                        <form onSubmit={handleRedeemCode} className="space-y-4">
                          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 text-right">
                            {courseAccessState?.source === 'code' && !courseAccessState?.hasAccess
                              ? 'اكتب الكود الجديد هنا'
                              : 'معاك كود للكورس؟'
                            }
                          </label>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={redeemCode}
                              onChange={(e) => {
                                // Auto-format: uppercase and remove spaces/special chars
                                const formatted = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                                if (formatted.length <= 12) {
                                  setRedeemCode(formatted);
                                }
                              }}
                              onKeyDown={(e) => {
                                // Prevent space key
                                if (e.key === ' ') {
                                  e.preventDefault();
                                }
                              }}
                              placeholder="زي كده: ABC123XYZ9"
                              className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center font-mono text-lg tracking-wider"
                              maxLength="12"
                              style={{ letterSpacing: '0.1em' }}
                              required
                            />
                            <button
                              type="submit"
                              className={`px-4 sm:px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex-shrink-0 min-w-max ${courseAccessState?.source === 'code' && !courseAccessState?.hasAccess
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                } focus:ring-2 focus:ring-opacity-50`}
                            >
                              {courseAccessState?.source === 'code' && !courseAccessState?.hasAccess ? 'فعّل تاني' : 'فعّل'}
                            </button>
                          </div>

                          {/* Mobile Layout */}
                          <div className="sm:hidden space-y-3">
                            <input
                              type="text"
                              value={redeemCode}
                              onChange={(e) => {
                                // Auto-format: uppercase and remove spaces/special chars
                                const formatted = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                                if (formatted.length <= 12) {
                                  setRedeemCode(formatted);
                                }
                              }}
                              onKeyDown={(e) => {
                                // Prevent space key
                                if (e.key === ' ') {
                                  e.preventDefault();
                                }
                              }}
                              placeholder="زي كده: ABC123XYZ9"
                              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center font-mono text-lg tracking-wider"
                              maxLength="12"
                              style={{ letterSpacing: '0.1em' }}
                              required
                            />
                            <button
                              type="submit"
                              className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 ${courseAccessState?.source === 'code' && !courseAccessState?.hasAccess
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                } focus:ring-2 focus:ring-opacity-50 text-base`}
                            >
                              {courseAccessState?.source === 'code' && !courseAccessState?.hasAccess ? 'فعّل تاني' : 'فعّل'}
                            </button>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right leading-relaxed">
                              {courseAccessState?.source === 'code' && !courseAccessState?.hasAccess && courseAccessState?.accessEndAt && (
                                <span className="text-green-500">خلاص الكود انتهى</span>
                              )}
                            </p>
                            <div className="bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                              <h4 className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">حاجات مهمة:</h4>
                              <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                                <li>• الكود ده للكورس ده بس</li>
                                <li>• كل كود يتستعمل مرة واحدة بس</li>
                                <li>• الكود من 8-12 حرف وأرقام إنجليزي</li>
                                <li>• اتأكد إنك كاتب الكود صح</li>
                              </ul>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Days Banner - Only show if course is NOT purchased */}
        {!isCoursePurchased() && courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <div className={`border rounded-xl p-3 sm:p-4 ${courseAccessState?.hasAccess
              ? 'bg-gradient-to-r from-red-50 to-red-50 dark:from-green-900/20 dark:to-green-900/20 border-green-200 dark:border-green-700'
              : 'bg-gradient-to-r from-red-50 to-red-50 dark:from-green-900/20 dark:to-green-900/20 border-green-200 dark:border-green-700'
              }`}>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {courseAccessState?.hasAccess ? (
                  <FaClock className="text-green-600 text-lg sm:text-xl flex-shrink-0" />
                ) : (
                  <FaExclamationTriangle className="text-green-600 text-lg sm:text-xl flex-shrink-0" />
                )}
                <RemainingDaysLabel
                  accessEndAt={courseAccessState.accessEndAt}
                  className="text-base sm:text-lg font-semibold text-center"
                  showExpiredMessage={!courseAccessState?.hasAccess}
                />
              </div>
            </div>
          </div>
        )}

        {/* هيكل الدورة */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaList className="text-lg sm:text-xl" />
                <span>الدروس</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              {/* درس */}
              {currentCourse.directLessons && currentCourse.directLessons.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    المقدمة
                  </h3>
                  <div className="space-y-3">
                    {currentCourse.directLessons.map((lesson, index) => (
                      <div
                        key={lesson._id || index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3 sm:gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaPlay className="text-white text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                          <div className="flex-shrink-0">
                            {renderPurchaseButton(lesson, 'lesson')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Units */}
              {currentCourse.units && currentCourse.units.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    الوحدات التعليمية
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {currentCourse.units.map((unit, unitIndex) => (
                      <div
                        key={unit._id || unitIndex}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                      >
                        {/* Unit Header */}
                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors gap-3 sm:gap-4"
                          onClick={() => toggleUnit(unit._id || unitIndex)}
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaBookOpen className="text-white text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {unit.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-1">
                                {unit.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                            <div className="flex-shrink-0">
                              {expandedUnits.has(unit._id || unitIndex) ? (
                                <FaChevronUp className="text-gray-400" />
                              ) : (
                                <FaChevronDown className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Unit Lessons */}
                        {expandedUnits.has(unit._id || unitIndex) && unit.lessons && (
                          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800">
                            <div className="space-y-3">
                              {unit.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson._id || lessonIndex}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3 sm:gap-4"
                                >
                                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <FaPlay className="text-white text-xs" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                        {lesson.title}
                                      </h5>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {lesson.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                                    <div className="flex-shrink-0">
                                      {renderPurchaseButton(lesson, 'lesson', true, unit._id)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!currentCourse.directLessons || currentCourse.directLessons.length === 0) &&
                (!currentCourse.units || currentCourse.units.length === 0) && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      لا توجد محتويات متاحة
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      سيتم إضافة المحتويات قريباً
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>


        {/* Preview Modal */}
        {showPreviewModal && previewItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  معاينة الدرس
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {previewItem.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {previewItem.description}
                </p>


                {/* Show remaining days if user has code-based access */}
                {courseAccessState?.source === 'code' && courseAccessState?.accessEndAt && (
                  <div className="mb-4">
                    <RemainingDaysLabel
                      accessEndAt={courseAccessState.accessEndAt}
                      className="w-full justify-center"
                      showExpiredMessage={!courseAccessState?.hasAccess}
                    />
                  </div>
                )}
              </div>

              {/* Preview Content */}
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  محتوى الدرس
                </h5>

                {/* Videos Preview */}
                {previewItem.videos && previewItem.videos.length > 0 && (
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-900 dark:text-white mb-2">الفيديوهات ({previewItem.videos.length})</h6>
                    <div className="space-y-2">
                      {previewItem.videos.slice(0, 2).map((video, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaPlay className="text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{video.title}</span>
                          </div>
                        </div>
                      ))}
                      {previewItem.videos.length > 2 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          + {previewItem.videos.length - 2} فيديو آخر
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* PDFs Preview */}
                {previewItem.pdfs && previewItem.pdfs.length > 0 && (
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-900 dark:text-white mb-2">الملفات PDF ({previewItem.pdfs.length})</h6>
                    <div className="space-y-2">
                      {previewItem.pdfs.slice(0, 2).map((pdf, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaBookOpen className="text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{pdf.title}</span>
                          </div>
                        </div>
                      ))}
                      {previewItem.pdfs.length > 2 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          + {previewItem.pdfs.length - 2} ملف آخر
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Exams Preview */}
                {previewItem.exams && previewItem.exams.length > 0 && (
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-900 dark:text-white mb-2">الاختبارات ({previewItem.exams.length})</h6>
                    <div className="space-y-2">
                      {previewItem.exams.slice(0, 2).map((exam, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaGraduationCap className="text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{exam.title}</span>
                          </div>
                        </div>
                      ))}
                      {previewItem.exams.length > 2 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          + {previewItem.exams.length - 2} اختبار آخر
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Trainings Preview */}
                {previewItem.trainings && previewItem.trainings.length > 0 && (
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-900 dark:text-white mb-2">التدريبات ({previewItem.trainings.length})</h6>
                    <div className="space-y-2">
                      {previewItem.trainings.slice(0, 2).map((training, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaStar className="text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{training.title}</span>
                          </div>
                        </div>
                      ))}
                      {previewItem.trainings.length > 2 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          + {previewItem.trainings.length - 2} تدريب آخر
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show content summary instead of "Content will be added soon" */}
                <div className="bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                  <h6 className="font-medium text-green-900 dark:text-green-100 mb-3">ملخص المحتوى</h6>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaPlay className="text-green-600" />
                      <span className="text-green-700 dark:text-green-300">
                        {previewItem.videosCount || 0} فيديو
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBookOpen className="text-green-600" />
                      <span className="text-green-700 dark:text-green-300">
                        {previewItem.pdfsCount || 0} ملف PDF
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClipboardList className="text-green-600" />
                      <span className="text-green-700 dark:text-green-300">
                        {previewItem.examsCount || 0} اختبار
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-green-600" />
                      <span className="text-green-700 dark:text-green-300">
                        {previewItem.trainingsCount || 0} تدريب
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  إغلاق
                </button>
                {/* Show different buttons based on login and access status */}
                {!user || !isLoggedIn ? (
                  // User is not logged in - show sign in button
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setAlertMessage('يرجى تسجيل الدخول أولاً لمشاهدة المحتوى');
                      setShowErrorAlert(true);
                      setTimeout(() => {
                        navigate('/login', { state: { from: `/courses/${id}` } });
                      }, 2000);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FaUser />
                    <span>سجل دخول للمشاهدة</span>
                  </button>
                ) : hasContentAccess() ? (
                  // User has access - show watch button
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleWatchClick(previewItem, previewItem.purchaseType, null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FaPlay />
                    <span>مشاهدة</span>
                  </button>
                ) : (
                  // User is logged in but doesn't have access - show message to purchase course or enter code
                  <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-center text-sm flex items-center justify-center gap-2">
                    <FaLock className="text-gray-400" />
                    <span>اشتري الكورس أو فعّل كود</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Content Modal */}
        {selectedLesson && (
          <OptimizedLessonContentModal
            isOpen={showLessonModal}
            onClose={() => {
              setShowLessonModal(false);
              setSelectedLesson(null);
            }}
            courseId={selectedLesson.courseId}
            lessonId={selectedLesson.lessonId}
            unitId={selectedLesson.unitId}
            lessonTitle={selectedLesson.title}
            courseAccessState={courseAccessState}
          />
        )}

        {/* Course Purchase Modal */}
        {showCoursePurchaseModal && currentCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  تأكيد شراء الكورس
                </h3>
                <button
                  onClick={() => setShowCoursePurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaShoppingCart className="text-green-600 text-2xl" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {currentCourse.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    سيتم خصم المبلغ من رصيد محفظتك
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">سعر الكورس:</span>
                    <span className="font-bold text-green-600 text-lg">{currentCourse.price} جنيه</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">رصيد المحفظة:</span>
                    <span className={`font-bold text-lg ${walletBalance >= currentCourse.price ? 'text-green-600' : 'text-green-600'}`}>
                      {walletBalance} جنيه
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">الرصيد بعد الشراء:</span>
                    <span className={`font-bold text-lg ${walletBalance - currentCourse.price >= 0 ? 'text-green-600' : 'text-green-600'}`}>
                      {walletBalance - currentCourse.price} جنيه
                    </span>
                  </div>
                </div>

                {walletBalance < currentCourse.price && (
                  <div className="p-3 bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mb-4">
                    <p className="text-green-700 dark:text-green-300 text-sm text-center">
                      ⚠️ رصيد المحفظة غير كافي لإتمام عملية الشراء
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCoursePurchaseModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleCoursePurchase}
                    disabled={paymentLoading || walletBalance < currentCourse.price}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>جاري الشراء...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>تأكيد الشراء</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Alerts */}
        <PaymentSuccessAlert
          isVisible={showSuccessAlert}
          message={alertMessage}
          onClose={() => setShowSuccessAlert(false)}
        />

        <PaymentErrorAlert
          isVisible={showErrorAlert}
          message={alertMessage}
          onClose={() => setShowErrorAlert(false)}
        />
      </div>
    </Layout>
  );
}
