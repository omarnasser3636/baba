import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { getAllStages } from "../Redux/Slices/StageSlice";
import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import fikraLogo from "../assets/Asset 2@3x.png";
import logo from "../assets/logo.png";
// Lazy load components
const FAQAccordion = lazy(() => import("../Components/FAQAccordion"));
const SubjectCard = lazy(() => import("../Components/SubjectCard"));
const InstructorSection = lazy(() => import("../Components/InstructorSection"));
const NewsletterSection = lazy(() => import("../Components/NewsletterSection"));

import {
  FaEye,
  FaHeart,
  FaCalendar,
  FaUser,
  FaArrowRight,
  FaPlay,
  FaStar,
  FaUsers,
  FaGraduationCap,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaCode,
  FaPalette,
  FaChartLine,
  FaBookOpen,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowUp,
  FaWhatsapp,
  FaFacebook,
  FaYoutube,
  FaComments,
  FaTiktok,
  FaInstagram,
  FaArrowLeft,
  FaBook
} from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";
// Using a public URL for now - replace with your actual image URL
const fikraCharacter = "/fikra_character-removebg-preview.png";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);
  const { featuredSubjects } = useSelector((state) => state.subject);
  const { courses, featuredCourses, featuredLoading } = useSelector((state) => state.course);
  const { stages, loading: stagesLoading } = useSelector((state) => state.stage);

  const { role, isLoggedIn, data: userData } = useSelector((state) => state.auth);
  const userStageId = userData?.stage?._id || userData?.stage;
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero entrance animation state
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Progressive loading - fetch data in sequence for better performance
    const loadData = async () => {
      // First, fetch essential data (subjects, courses, and stages)
      await Promise.all([
        dispatch(getFeaturedSubjects()),
        dispatch(getFeaturedCourses()),
        dispatch(getAllStages())
      ]);

      // Then fetch blogs after a short delay for better perceived performance
      setTimeout(() => {
        dispatch(getAllBlogs({ page: 1, limit: 3 }));
      }, 500);
    };

    loadData();

    // Trigger animations
    setIsVisible(true);

    // Hero entrance animation
    const timer = setTimeout(() => {
      setHeroVisible(true);
      setTimeout(() => {
        setHeroLoaded(true);
      }, 300);
    }, 100);

    // Add scroll event listener
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get Started Handler
  const onGetStarted = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };

  // APK Download Handler
  const handleAPKDownload = () => {
    // Create a download link for the APK file
    const link = document.createElement('a');
    link.href = '/downloads/mrayman.apk'; // Update this path to your APK file location
    link.download = 'mrayman.apk';
    link.target = '_blank';

    // Fallback for mobile browsers
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      // For Android devices, open the download directly
      window.open('/downloads/mrayman.apk', '_blank');
    } else {
      // For other devices, trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Show download started message
    if (window.toast) {
      window.toast.success('بدأ تحميل التطبيق...');
    }
  };

  // Google Play Store redirect (for future when app is published)
  const handlePlayStoreRedirect = () => {
    // Replace with your actual Google Play Store URL when published
    // Show a "Coming Soon" message instead of redirecting
    if (window.toast) {
      window.toast.info('قريباً على Google Play!');
    } else {
      alert('قريباً على Google Play!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { icon: FaUsers, number: "10K+", label: "طالب مسجل", color: "text-green-600" },
    { icon: FaGraduationCap, number: "100+", label: "مادة متاحة", color: "text-green-600" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-emerald-600" },
    { icon: FaAward, number: "50+", label: "مدرس خبير", color: "text-green-600" }
  ];

  const features = [
    {
      icon: FaRocket,
      title: "تعلم بوتيرتك الخاصة",
      description: "جداول تعلم مرنة تناسب نمط حياتك والتزاماتك.",
      color: "text-green-600",
      bgColor: "bg-red-50 dark:bg-green-900/20"
    },
    {
      icon: FaLightbulb,
      title: "دورات بقيادة الخبراء",
      description: "تعلم من المحترفين في المجال مع سنوات من الخبرة العملية.",
      color: "text-green-600",
      bgColor: "bg-red-50 dark:bg-green-900/20"
    },
    {
      icon: FaShieldAlt,
      title: "التعلم المعتمد",
      description: "احصل على شهادات معترف بها من أفضل الشركات في العالم.",
      color: "text-green-600",
      bgColor: "bg-red-50 dark:bg-green-900/20"
    },
    {
      icon: FaGlobe,
      title: "المجتمع العالمي",
      description: "تواصل مع المتعلمين من جميع أنحاء العالم وشارك الخبرات.",
      color: "text-green-600",
      bgColor: "bg-red-50 dark:bg-green-900/20"
    }
  ];

  const categories = [
    { icon: FaCode, name: "البرمجة", count: "150+ دورة", color: "bg-green-500" },
    { icon: FaPalette, name: "التصميم", count: "120+ دورة", color: "bg-green-500" },
    { icon: FaChartLine, name: "الأعمال", count: "200+ دورة", color: "bg-green-500" },
    { icon: FaBookOpen, name: "التسويق", count: "180+ دورة", color: "bg-green-500" }
  ];

  return (
    <Layout>
      {/* Hero Section - Clean & Modern RTL */}
      <div className={`transition-all duration-1000 ease-out ${heroVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}>
        <AnimatedHero onGetStarted={onGetStarted} />
      </div>

      {/* Stages Section - Educational Levels with Background Images */}
      <section className={`py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        dir="rtl"
        style={{ transitionDelay: '100ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '200ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {isLoggedIn && userStageId
                ? (stages?.find(s => (s._id || s.id) === userStageId)?.name || 'مرحلتك الدراسية')
                : 'المراحل الدراسية'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {isLoggedIn && userStageId
                ? 'استعرض الكورسات المتاحة لمرحلتك الدراسية'
                : 'اختر مرحلتك الدراسية لعرض الكورسات المناسبة لك'}
            </p>
          </div>

          {stagesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : stages && stages.length > 0 ? (
            <div className={`grid gap-8 ${isLoggedIn && userStageId ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {/* Filter stages: if logged in, show only user's stage; otherwise show all */}
              {(isLoggedIn && userStageId
                ? stages.filter(s => (s._id || s.id) === userStageId)
                : stages
              ).map((stage, index) => {
                const stageId = stage._id || stage.id;
                const stageCourseCount = featuredCourses?.filter(c =>
                  (c.stage?._id || c.stage?.id || c.stage) === stageId
                ).length || 0;
                const stageImage = stage.image?.secure_url;
                const baseUrl = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:8045';

                return (
                  <Link
                    key={stageId}
                    to={`/courses?stage=${stageId}`}
                    className={`group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 ${heroLoaded
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                      }`}
                    style={{ transitionDelay: `${300 + (index * 100)}ms` }}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      {stageImage ? (
                        <img
                          src={stageImage.startsWith('http') ? stageImage : `${baseUrl}${stageImage}`}
                          alt={stage.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}

                      {/* Fallback gradient when no image */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-green-400 via-green-600 to-emerald-700 ${stageImage ? 'hidden' : ''}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaGraduationCap className="text-9xl text-white opacity-20" />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                      </div>
                    </div>

                    {/* Overlay Gradient - Enhanced */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-green-500/20 to-transparent"></div>

                    {/* Course Count Badge */}
                    <div className="absolute top-5 right-5 z-10">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md text-green-600 font-bold rounded-full shadow-lg">
                        <FaBook className="text-sm" />
                        <span>{stageCourseCount} كورس</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                      {/* Stage Name */}
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                        {stage.name}
                      </h3>

                      {/* Description if available */}
                      {stage.description && (
                        <p className="text-white/80 text-base mb-4 line-clamp-2 leading-relaxed">
                          {stage.description}
                        </p>
                      )}

                      {/* CTA Button */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-green-400 font-semibold text-lg group-hover:text-green-300 transition-colors">
                          استعرض الكورسات
                        </span>
                        <div className="w-12 h-12 flex items-center justify-center bg-green-500 group-hover:bg-green-400 text-white rounded-full shadow-lg transform group-hover:translate-x-1 transition-all duration-300">
                          <FaArrowLeft className="text-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Border Glow on Hover */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-green-400/60 transition-all duration-500"></div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaGraduationCap className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-xl">لا توجد مراحل متاحة حالياً</p>
            </div>
          )}

          {/* View All Courses Button - Only show for guests */}
          {!(isLoggedIn && userStageId) && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>عرض جميع الكورسات</span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        dir="rtl"
        style={{ transitionDelay: '200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '400ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              كورساتنا المتاحة للعام 2025/2026
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف مجموعة واسعة من الكورسات التعليمية المميزة
            </p>
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكورسات المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id}
                  className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 ease-out group h-[50vh] ${heroLoaded
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                    }`}
                  style={{
                    transitionDelay: `${600 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  {/* Full Background Image */}
                  <div className="absolute inset-0">
                    {course.image?.secure_url ? (
                      <img
                        src={generateImageUrl(course.image.secure_url)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}

                    {/* Fallback gradient for missing/broken images */}
                    <div className={`w-full h-full bg-gradient-to-br from-green-600 via-green-600 to-green-800 ${course.image?.secure_url ? 'hidden' : 'flex'} items-center justify-center`}>
                      <FaBookOpen className="text-8xl text-white opacity-40" />
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

                  {/* Stage Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-lg border border-white/20">
                      {course.stage?.name || 'غير محدد'}
                    </span>
                  </div>

                  <div className="absolute top-4 left-4 z-20">
                    {(course.price || 0) > 0 ? (
                      <span className="px-3 py-1.5 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-green-500/50">{course.price} جنيه</span>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-green-500/50">مجاني ✓</span>
                    )}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    {/* Course Meta Info */}
                    <div className="mb-3 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FaUser className="w-3 h-3" />
                          <span className="font-medium">{course.instructor?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaPlay className="w-3 h-3" />
                          <span className="font-medium">
                            {(course.directLessons?.length || 0) +
                              (course.units?.reduce((total, unit) => total + (unit.lessons?.length || 0), 0) || 0)} درس
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg">
                      {course.title}
                    </h3>

                    {/* Subject */}
                    <p className="text-white/80 text-sm mb-4 font-semibold tracking-wide">
                      {course.description.slice(0, 80)}...
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-center py-3.5 px-5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-white/30 hover:border-white/50 hover:scale-105 shadow-lg"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>شوف التفاصيل</span>
                      </Link>
                      <Link
                        to="/courses"
                        className="p-3.5 bg-green-600/90 backdrop-blur-md hover:bg-green-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center border border-green-500/50 hover:border-green-400 hover:scale-105 shadow-lg"
                      >
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Effect Indicator */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>

                  {/* Bottom gradient for better text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-5"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد كورسات متاحة حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                سيتم إضافة كورسات جديدة قريباً!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses && featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>عرض جميع الكورسات</span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - What You'll Find on the Platform */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        dir="rtl"
        style={{ transitionDelay: '400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              إيه اللي هتلاقيه على المنصة؟
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Periodic Follow-up */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${heroLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '800ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                متابعة دورية وتقييم مستمر
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                تقدمك بيتراجع أسبوعياً، وبنقدملك توصيات حسب احتياجك، ومتابعة أول بأول.
              </p>
            </div>

            {/* Feature 2 - Exam Models */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${heroLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '900ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaAward className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                نماذج امتحانات بنفس النظام
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                امتحانات تفاعلية بنفس شكل امتحانات الثانوية العامة، عشان تعيش جو الامتحان على المنصة.
              </p>
            </div>

            {/* Feature 3 - Simplified Explanation */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${heroLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '1000ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                شرح مبسط ومركز
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                شرح النظريات والمفاهيم زي ما بتفهمها في حياتك اليومية، بعيد عن التعقيد الأكاديمي.
              </p>
            </div>

            {/* Feature 4 - Focused Review Videos */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${heroLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '1100ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaClock className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                فيديوهات مراجعة مركزة ليالي الامتحان
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                فيديوهات مراجعة قصيرة مركزة على أهم النقاط اللي محتاج تذاكرها قبل ما تدخل قاعة الامتحان.
              </p>
            </div>

            {/* Feature 5 - Direct Interaction */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${heroLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '1200ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaComments className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                تفاعل مباشر مع المدرسين
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                أي استفسار أو نقطة مش واضحة تسأل عنها وإحنا هنرد عليها بشكل فوري، وكده مش هتحس إنك لوحدك.
              </p>
            </div>

            {/* Feature 6 - Organized Study Plan */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${heroLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: '1300ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                خطة مذاكرة منظمة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                المنصة بتديك جدول مذاكرة جاهز حسب وقتك ومستواك، عشان تذاكر بتركيز وراحة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subjects Section */}
      {/* <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '1400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '1600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              المواد الدراسية
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف موادنا الأكثر شعبية وأعلى تقييماً
            </p>
          </div>

          {featuredSubjects && featuredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSubjects.slice(0, 6).map((subject, index) => (
                <div 
                  key={subject._id} 
                  className={`transform hover:scale-105 transition-all duration-500 ease-out ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${1800 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  <Suspense fallback={
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  }>
                    <SubjectCard subject={subject} />
                  </Suspense>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد مواد مميزة بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                عد قريباً لمواد رائعة!
              </p>
            </div>
          )}
        </div>
      </section> */}

      {/* Instructor Section */}
      {/* <Suspense fallback={
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <InstructorSection />
      </Suspense> */}



      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 transition-all duration-700 ease-out ${heroLoaded
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '3600ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '3800ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              هل أنت مستعد لبدء رحلة التعلم؟
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              اكتشف مجموعة متنوعة من الكورسات التعليمية المصممة خصيصاً لمساعدتك في تحقيق أهدافك الأكاديمية
            </p>
          </div>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 ease-out ${heroLoaded
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '4000ms' }}>
            <Link to="/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ابدأ مجاناً
              </button>
            </Link>

            <Link to="/qa">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <FaQuestionCircle className="w-5 h-5" />
                اطرح سؤالاً
              </button>
            </Link>
          </div>
        </div>
      </section>



      {/* Static FAQ Section */}
      <section className="py-16 px-4 lg:px-20 bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-right">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-right">
              كل ما تحتاج معرفته عن منصتنا
            </p>
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mr-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mr-auto"></div>
                </div>
              ))}
            </div>
          }>
            <FAQAccordion />
          </Suspense>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                تواصل معنا
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                محتاج مساعدة ؟ تواصل معنا علطول على الارقام التاليه واتساب او اتصال
              </p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                  <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">الحجز والاستفسارات</h3>
                  <a href="https://wa.me/+201221350679" className="text-green-600 dark:text-green-400 hover:underline">
                    +201221350679
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                  <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">الدعم الفني</h3>
                  <a href="https://wa.me/+201035448853" className="text-green-600 dark:text-green-400 hover:underline">
                    +201035448853
                  </a>
                </div>
              </div>
            </div>
               <div className="mt-12 text-center">
                <Link
                  to="/parent/login"
                  className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <FaUsers className="w-4 h-4" />
                  <span>دخول ولي الأمر لمتابعة الطالب</span>
                </Link>
              </div>

            {/* Social Media */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                تابعنا
              </h3>
              <div className="flex flex-wrap justify-center gap-6 max-w-md mx-auto">
                <a
                  href="https://www.facebook.com/AlmistarMath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-600 hover:scale-105"
                  title="Facebook"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaFacebook className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Facebook
                  </span>
                </a>
                <a
                  href="https://youtube.com/@mr-krimgaber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-600 hover:scale-105"
                  title="YouTube"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaYoutube className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    YouTube
                  </span>
                </a>
                <a
                  href="https://www.tiktok.com/@m.karim_gaber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-600 hover:scale-105"
                  title="Tiktok"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaTiktok className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Tiktok
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/karemgaber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-600 hover:scale-105"
                  title="Instagram"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaInstagram className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Instagram
                  </span>
                </a>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Partner Section */}
      {/* <section className="py-16 bg-white dark:bg-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              شركاؤنا
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              شريكنا التقني: 
              <a
                href="https://fikra.solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Fikra Software
              </a>
            </p>
          </div>
          <div className="flex items-center justify-center">
            <a href="https://fikra.solutions/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
              <img
                src={fikraLogo}
                alt="Fikra Software Logo"
                className="h-24 md:h-32 object-contain drop-shadow-lg hover:opacity-90 transition"
              />
            </a>
          </div>
        </div>
      </section> */}

      {/* Scroll to Top Button */}
      {
        showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
            aria-label="Scroll to top"
          >
            <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        )
      }

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/+201035448853"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-8 bottom-8 z-50 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group animate-bounce"
        aria-label="Contact us on WhatsApp"
        title="تواصل معنا على واتساب"
      >
        <FaWhatsapp className="w-6 h-6" />
      </a>
    </Layout >
  );
}
