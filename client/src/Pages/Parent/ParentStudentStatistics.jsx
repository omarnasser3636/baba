import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaChartPie,
    FaVideo,
    FaClipboardList,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaTrophy,
    FaBookOpen,
    FaEye,
    FaTimes,
    FaSignOutAlt
} from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { getParentStudentStats, parentLogout } from '../../Redux/Slices/ParentSlice';

const colorMaps = {
    blue: {
        border: 'border-blue-100 dark:border-blue-900/30',
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        bgHover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/40',
        subtitle: 'text-blue-600 dark:text-blue-300'
    },
    emerald: {
        border: 'border-emerald-100 dark:border-emerald-900/30',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        bgHover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
        subtitle: 'text-emerald-600 dark:text-emerald-300'
    },
    red: {
        border: 'border-green-100 dark:border-green-900/30',
        bg: 'bg-red-50 dark:bg-green-900/10',
        bgHover: 'group-hover:bg-green-100 dark:group-hover:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-red-50 dark:bg-green-900/40',
        subtitle: 'text-green-600 dark:text-green-300'
    },
    red: {
        border: 'border-green-100 dark:border-green-900/30',
        bg: 'bg-red-50 dark:bg-green-900/10',
        bgHover: 'group-hover:bg-green-100 dark:group-hover:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-red-50 dark:bg-green-900/40',
        subtitle: 'text-green-600 dark:text-green-300'
    },
    indigo: {
        border: 'border-indigo-100 dark:border-indigo-900/30',
        bg: 'bg-indigo-50 dark:bg-indigo-900/10',
        bgHover: 'group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-50 dark:bg-indigo-900/40',
        subtitle: 'text-indigo-600 dark:text-indigo-300'
    },
    emerald: {
        border: 'border-emerald-100 dark:border-emerald-900/30',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        bgHover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
        subtitle: 'text-emerald-600 dark:text-emerald-300'
    },
    red: {
        border: 'border-green-100 dark:border-green-900/30',
        bg: 'bg-red-50 dark:bg-green-900/10',
        bgHover: 'group-hover:bg-green-100 dark:group-hover:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-red-50 dark:bg-green-900/40',
        subtitle: 'text-green-600 dark:text-green-300'
    },
    orange: {
        border: 'border-orange-100 dark:border-orange-900/30',
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        bgHover: 'group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-50 dark:bg-orange-900/40',
        subtitle: 'text-orange-600 dark:text-orange-300'
    },
};

const StatCard = ({ title, value, icon, color = 'blue', subtitle, delay = 0 }) => {
    const theme = colorMaps[color] || colorMaps.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${theme.border} relative overflow-hidden group hover:shadow-md transition-all duration-300`}
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${theme.bg} rounded-full blur-2xl ${theme.bgHover} transition-all duration-300`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{value}</h3>
                    {subtitle && (
                        <p className={`text-xs ${theme.subtitle} font-medium`}>{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.text} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default function ParentStudentStatistics() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn, student, examStats, examHistory, videoStats, loading } = useSelector((state) => state.parent);

    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [selectedExamForModal, setSelectedExamForModal] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/parent/login');
        } else {
            dispatch(getParentStudentStats());
        }
    }, [dispatch, isLoggedIn, navigate]);

    const handleLogout = () => {
        dispatch(parentLogout());
        navigate('/parent/login');
    };

    // Helper functions for modal colors and icons
    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-green-600';
        if (score >= 70) return 'text-green-600';
        return 'text-green-600';
    };

    const getExamTypeIcon = (examType) => {
        return examType === 'training' ? (
            <FaClipboardList className="text-green-500" size={24} />
        ) : (
            <FaBookOpen className="text-green-500" size={24} />
        );
    };

    if (loading && !student) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex flex-col">
                    <LoadingSpinner message="جاري تحميل الإحصائيات..." />
                </div>
            </Layout>
        );
    }

    if (!student && !loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex flex-col items-center justify-center">
                    <p className="text-xl text-gray-600 dark:text-gray-300">يجب تسجيل الدخول كولي أمر.</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-20" dir="rtl">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* Top Top Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                                    الطالب: {student?.fullName}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {student?.stage?.name || 'مرحلة غير محددة'} | {student?.phoneNumber}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded-lg transition-colors"
                        >
                            <FaSignOutAlt />
                            <span className="hidden sm:inline">تسجيل الخروج</span>
                        </button>
                    </div>

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <FaChartPie />
                            </span>
                            إحصائيات الأداء في المنصة
                        </h2>
                    </motion.div>

                    {/* Video Tracking Progress Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FaVideo className="text-blue-500" /> مشاهدة الدروس
                        </h2>

                        {videoStats && videoStats.totalVideosWatched > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="إجمالي الفيديوهات المكتملة"
                                    value={videoStats.completedVideos}
                                    subtitle={`من أصل ${videoStats.totalVideosWatched} تم مشاهدتها`}
                                    icon={<FaCheckCircle size={24} />}
                                    color="blue"
                                    delay={0.1}
                                />
                                <StatCard
                                    title="نسبة الإنجاز الإجمالية"
                                    value={videoStats.completionRate}
                                    icon={<FaTrophy size={24} />}
                                    color="emerald"
                                    delay={0.2}
                                />
                                <StatCard
                                    title="ساعات المشاهدة"
                                    value={`${videoStats.totalWatchTimeHours} ساعة`}
                                    icon={<FaClock size={24} />}
                                    color="red"
                                    delay={0.3}
                                />
                                <StatCard
                                    title="أيام النشاط (آخر 30 يوم)"
                                    value={`${videoStats.activeDaysLast30} أيام`}
                                    icon={<FaBookOpen size={24} />}
                                    color="red"
                                    delay={0.4}
                                />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد إحصائيات مشاهدة متاحة حالياً.</p>
                            </div>
                        )}
                    </div>

                    {/* Exam Statistics Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FaClipboardList className="text-green-500" /> إحصائيات الامتحانات
                        </h2>

                        {examStats && examStats.total > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="إجمالي الامتحانات المسجلة"
                                    value={examStats.total}
                                    subtitle={`${examStats.finalExams} امتحانات و ${examStats.trainingExams} تدريبات`}
                                    icon={<FaClipboardList size={24} />}
                                    color="indigo"
                                    delay={0.5}
                                />
                                <StatCard
                                    title="الامتحانات المجتازة"
                                    value={examStats.passed}
                                    icon={<FaCheckCircle size={24} />}
                                    color="emerald"
                                    delay={0.6}
                                />
                                <StatCard
                                    title="الامتحانات غير المجتازة"
                                    value={examStats.failed}
                                    icon={<FaTimesCircle size={24} />}
                                    color="red"
                                    delay={0.7}
                                />
                                <StatCard
                                    title="متوسط الدرجات"
                                    value={`${examStats.averageScore}%`}
                                    icon={<FaChartPie size={24} />}
                                    color="orange"
                                    delay={0.8}
                                />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد سجلات امتحانات.</p>
                            </div>
                        )}
                    </div>

                    {/* Exam History List Section */}
                    {examHistory && examHistory.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaBookOpen className="text-indigo-500" /> سجل الامتحانات (الأحدث أولوية)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">اسم الامتحان</th>
                                            <th scope="col" className="px-6 py-4">النوع</th>
                                            <th scope="col" className="px-6 py-4">النتيجة</th>
                                            <th scope="col" className="px-6 py-4">الحالة</th>
                                            <th scope="col" className="px-6 py-4">تاريخ الأداء</th>
                                            <th scope="col" className="px-6 py-4 text-center">التفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examHistory.map((exam, index) => (
                                            <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {exam?.lessonTitle || exam?.courseId?.title || 'امتحان'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${exam.examType === 'final'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                        {exam.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {exam.score}%
                                                </td>
                                                <td className="px-6 py-4">
                                                    {exam.passed ? (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <FaCheckCircle size={14} /> نجاح
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <FaTimesCircle size={14} /> رسوب
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(exam.createdAt).toLocaleDateString('ar-EG')}</span>
                                                        <span className="text-xs text-gray-400">{new Date(exam.createdAt).toLocaleTimeString('ar-EG')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedExamForModal(exam);
                                                            setIsExamModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        <FaEye size={14} /> عرض
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                </div>


                {/* Result Detail Modal */}
                {isExamModalOpen && selectedExamForModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4 text-right" dir="rtl">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getExamTypeIcon(selectedExamForModal.examType)}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {selectedExamForModal.lessonTitle || selectedExamForModal.course?.title || 'امتحان'}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedExamForModal.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsExamModalOpen(false);
                                            setSelectedExamForModal(null);
                                        }}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Result Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className={`text-3xl font-bold ${getScoreColor(selectedExamForModal.score)}`}>
                                            {selectedExamForModal.score}%
                                        </div>
                                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">الدرجة</div>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedExamForModal.correctAnswers}/{selectedExamForModal.totalQuestions}
                                        </div>
                                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">الإجابات الصحيحة</div>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedExamForModal.timeTaken || 0} دقيقة
                                        </div>
                                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">الوقت المستغرق</div>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className={`text-2xl font-bold ${selectedExamForModal.passed ? 'text-green-600' : 'text-green-600'}`}>
                                            {selectedExamForModal.passed ? 'ناجح' : 'راسب'}
                                        </div>
                                        <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">النتيجة</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
