import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    FaTimes
} from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { getUserExamHistory } from '../../Redux/Slices/ExamSlice';
import { getUserTrackingStats } from '../../Redux/Slices/VideoProgressSlice';

const StatCard = ({ title, value, icon, color, subtitle, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-${color}-100 dark:border-${color}-900/30 relative overflow-hidden group hover:shadow-md transition-all duration-300`}
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 dark:bg-${color}-900/10 rounded-full blur-2xl group-hover:bg-${color}-100 dark:group-hover:bg-${color}-900/20 transition-all duration-300`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{value}</h3>
                    {subtitle && (
                        <p className={`text-xs text-${color}-600 dark:text-${color}-400 font-medium`}>{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default function StudentStatistics() {
    const dispatch = useDispatch();
    const { data: userData } = useSelector((state) => state.auth);
    const { examHistory, loading: examLoading } = useSelector((state) => state.exam);
    const { userTrackingStats, loading: videoLoading } = useSelector((state) => state.videoProgress);

    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [selectedExamForModal, setSelectedExamForModal] = useState(null);

    const [examStats, setExamStats] = useState({
        total: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        trainingExams: 0,
        finalExams: 0
    });

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

    useEffect(() => {
        if (userData?._id) {
            dispatch(getUserExamHistory({ page: 1, limit: 100 }));
            dispatch(getUserTrackingStats(userData._id));
        }
    }, [dispatch, userData]);

    useEffect(() => {
        console.log("Exam History Data: ", examHistory);
        console.log("Video Progress Data: ", userTrackingStats);
        if (examHistory && examHistory.length > 0) {
            const total = examHistory.length;
            const passed = examHistory.filter(e => e.passed).length;
            const failed = total - passed;
            const trainingExams = examHistory.filter(e => e.examType === 'training').length;
            const finalExams = examHistory.filter(e => e.examType === 'final').length;

            const totalScore = examHistory.reduce((acc, curr) => acc + (curr.score || 0), 0);
            const averageScore = total > 0 ? Math.round(totalScore / total) : 0;

            setExamStats({
                total,
                passed,
                failed,
                averageScore,
                trainingExams,
                finalExams
            });
        }
    }, [examHistory]);

    const loading = examLoading || videoLoading;

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                    <LoadingSpinner message="جاري تحميل الإحصائيات..." />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-20" dir="rtl">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                <FaChartPie />
                            </span>
                            إحصائيات الأداء
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            تابع تقدمك الأكاديمي، نتائج امتحاناتك، ونسبة مشاهدتك للدروس المسجلة.
                        </p>
                    </motion.div>

                    {/* Video Tracking Progress Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FaVideo className="text-blue-500" /> إحصائيات مشاهدة الفيديوهات
                        </h2>

                        {userTrackingStats?.summary ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="إجمالي الفيديوهات المكتملة"
                                    value={userTrackingStats.summary.completedVideos}
                                    subtitle={`من أصل ${userTrackingStats.summary.totalVideosWatched} تم مشاهدتها`}
                                    icon={<FaCheckCircle size={24} />}
                                    color="blue"
                                    delay={0.1}
                                />
                                <StatCard
                                    title="نسبة الإنجاز"
                                    value={userTrackingStats.summary.completionRate}
                                    icon={<FaTrophy size={24} />}
                                    color="emerald"
                                    delay={0.2}
                                />
                                <StatCard
                                    title="ساعات المشاهدة"
                                    value={`${userTrackingStats.summary.totalWatchTimeHours} ساعة`}
                                    icon={<FaClock size={24} />}
                                    color="red"
                                    delay={0.3}
                                />
                                <StatCard
                                    title="أيام النشاط (آخر 30 يوم)"
                                    value={`${userTrackingStats.summary.activeDaysLast30} أيام`}
                                    subtitle={`مستوى الاستمرارية: ${userTrackingStats.learningMetrics?.consistency === 'High' ? 'عالي' :
                                        userTrackingStats.learningMetrics?.consistency === 'Medium' ? 'متوسط' : 'ضعيف'
                                        }`}
                                    icon={<FaBookOpen size={24} />}
                                    color="red"
                                    delay={0.4}
                                />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد إحصائيات مشاهدة متاحة حالياً.</p>
                                <p className="text-sm text-gray-400">ابدأ في مشاهدة دروسك لتتبع تقدمك.</p>
                            </div>
                        )}
                    </div>

                    {/* Exam Statistics Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FaClipboardList className="text-green-500" /> إحصائيات الامتحانات والتدريبات
                        </h2>

                        {examStats.total > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="إجمالي المشاركات"
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
                                <p className="text-gray-500 dark:text-gray-400 mb-2">لا توجد سجلات امتحانات أو تدريبات.</p>
                                <p className="text-sm text-gray-400">قم بحل بعض الامتحانات أو التدريبات لتظهر إحصائياتك هنا.</p>
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
                                    <FaBookOpen className="text-indigo-500" /> سجل السابقة
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
                                                    {exam?.lessonId?.title || exam?.courseId?.title || 'امتحان'}
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
            </div>

            {/* Result Detail Modal */}
            {isExamModalOpen && selectedExamForModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getExamTypeIcon(selectedExamForModal.examType)}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {selectedExamForModal.lessonTitle || selectedExamForModal.courseId?.title || 'امتحان'}
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
        </Layout>
    );
}
