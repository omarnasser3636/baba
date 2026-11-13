import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaClipboardList, FaEye, FaUser, FaBook, FaTrophy, FaTimes, FaCalendar, FaClock, FaSearch, FaSort, FaSortUp, FaSortDown, FaStopwatch } from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';

const ExamSearchDashboard = () => {
  const { data: userData } = useSelector((state) => state.auth);
  
  // State for data
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamDetails, setShowExamDetails] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('percentage'); // 'percentage', 'name', 'date'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [showOnlyHighest, setShowOnlyHighest] = useState(false);

  // Fetch all exams with student results
  useEffect(() => {
    fetchAllExams();
  }, []);

  const fetchAllExams = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/exam-results/search');
      
      if (response.data.success) {
        const examData = response.data.data.results || [];

        // Log sample exam structure
        if (examData.length > 0) {

        }
        
        setExams(examData);
      }
    } catch (error) {
      toast.error('فشل في جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  // View exam details
  const viewExamDetails = (exam) => {
    setSelectedExam(exam);
    setShowExamDetails(true);
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-green-600';
    return 'text-green-600';
  };

  // Get status badge
  const getStatusBadge = (passed) => {
    return passed ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaTrophy className="w-3 h-3 mr-1" />
        ناجح
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaTimes className="w-3 h-3 mr-1" />
        راسب
      </span>
    );
  };

  // Format submission time
  const formatSubmissionTime = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    // For older dates, show the actual date and time
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and process exams
  const processExams = () => {
    let filteredExams = exams.filter(exam => {
      // Filter by search term
      if (searchTerm) {
        const studentName = exam.user?.fullName || exam.user?.username || '';
        const studentEmail = exam.user?.email || '';
        const courseName = exam.course?.title || '';
        const lessonName = exam.lesson?.title || '';
        
        return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
               courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               lessonName.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    // Filter to show only highest grades if enabled
    if (showOnlyHighest) {
      const studentHighestGrades = {};
      filteredExams.forEach(exam => {
        const studentId = exam.user?._id;
        const currentPercentage = exam.percentage || 0;
        
        if (!studentHighestGrades[studentId] || 
            currentPercentage > studentHighestGrades[studentId].percentage) {
          studentHighestGrades[studentId] = exam;
        }
      });
      filteredExams = Object.values(studentHighestGrades);
    }

    // Sort exams
    filteredExams.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'percentage':
          aValue = a.percentage || 0;
          bValue = b.percentage || 0;
          break;
        case 'name':
          aValue = (a.user?.fullName || a.user?.username || '').toLowerCase();
          bValue = (b.user?.fullName || b.user?.username || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.completedAt || 0);
          bValue = new Date(b.completedAt || 0);
          break;
        default:
          aValue = a.percentage || 0;
          bValue = b.percentage || 0;
      }
      
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filteredExams;
  };

  // Group exams by course and lesson
  const groupedExams = () => {
    const processedExams = processExams();

    const grouped = processedExams.reduce((acc, exam) => {
      const key = `${exam.course?.title}-${exam.lesson?.title}`;
      if (!acc[key]) {
        acc[key] = {
          course: exam.course,
          lesson: exam.lesson,
          unit: exam.unit,
          exam: exam.exam,
          examType: exam.examType,
          students: []
        };
      }
      
      // Include ALL students who appear in exam results - if they're in the data, they took the exam
      // Only exclude if explicitly marked as not completed AND has no exam data
      const shouldExclude = !exam.isCompleted && 
                           exam.type === 'available' && 
                           !exam.completedAt && 
                           exam.score === undefined && 
                           exam.percentage === undefined &&
                           !exam.userResult &&
                           exam.correctAnswers === undefined &&
                           !exam.timeTaken &&
                           exam.passed === undefined;
      
      const shouldInclude = !shouldExclude;
      
      if (shouldInclude) {
        acc[key].students.push(exam);
      } else {
      }
      
      return acc;
    }, {});

    return grouped;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-indigo-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-right">
              <FaClipboardList className="inline-block mr-3 text-green-600" />
              جميع الامتحانات والنتائج
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-right">
              عرض جميع الامتحانات والطلاب الذين تقدموا لها مع نتائجهم
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث عن طالب أو دورة أو درس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="percentage">الترتيب حسب النتيجة</option>
                  <option value="name">الترتيب حسب اسم الطالب</option>
                  <option value="date">الترتيب حسب التاريخ</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {sortOrder === 'desc' ? <FaSortDown /> : <FaSortUp />}
                  {sortOrder === 'desc' ? 'تنازلي' : 'تصاعدي'}
                </button>
              </div>

              {/* Show Only Highest Grades */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyHighest}
                    onChange={(e) => setShowOnlyHighest(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    أعلى الدرجات فقط
                  </span>
                </label>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>إجمالي النتائج: {processExams().length}</span>
                <span>إجمالي الطلاب: {Object.values(groupedExams()).reduce((sum, group) => sum + group.students.length, 0)}</span>
                {searchTerm && <span>نتائج البحث: {processExams().filter(exam => {
                  const studentName = exam.user?.fullName || exam.user?.username || '';
                  const studentEmail = exam.user?.email || '';
                  const courseName = exam.course?.title || '';
                  const lessonName = exam.lesson?.title || '';
                  
                  return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lessonName.toLowerCase().includes(searchTerm.toLowerCase());
                }).length}</span>}
                {showOnlyHighest && <span>أعلى الدرجات: {processExams().length}</span>}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">جاري تحميل الامتحانات...</p>
            </div>
          ) : (
            /* Exams List */
            <div className="space-y-6">
              {Object.entries(groupedExams()).map(([key, examData]) => (
                <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  {/* Exam Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <FaBook className="text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {examData.exam?.title || 
                               (examData.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي') ||
                               `امتحان ${examData.lesson?.title || examData.course?.title || ''}`}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {examData.exam?.description || 
                               `${examData.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي'} لدرس "${examData.lesson?.title || ''}"`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FaBook className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">الدورة:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.course?.title || 'غير محدد'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaClipboardList className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">الدرس:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.lesson?.title || 'غير محدد'}
                            </span>
                          </div>
                          
                          {examData.unit && (
                            <div className="flex items-center gap-2">
                              <FaBook className="text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">الوحدة:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {examData.unit.title}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">الوقت المحدد:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.exam?.timeLimit || 0} دقيقة
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaClipboardList className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">عدد الأسئلة:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {examData.exam?.questionsCount || 0}
                            </span>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            examData.examType === 'training' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {examData.examType === 'training' ? 'تدريب' : 'امتحان نهائي'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => viewExamDetails(examData)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaEye />
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>

                  {/* Students Results */}
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-right">
                      نتائج الطلاب ({examData.students.length} طالب)
                    </h4>
                    
                    {examData.students.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">📝</div>
                        <p className="text-gray-600 dark:text-gray-400">لم يتقدم أي طالب لهذا الامتحان بعد</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" dir="rtl">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                التاريخ
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                وقت التقديم
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                الحالة
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                النتيجة
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                الطالب
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {examData.students.map((student, index) => (
                              <tr key={student._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400" />
                                    {new Date(student.completedAt).toLocaleDateString('ar-EG')}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <FaStopwatch className="text-blue-400" />
                                    <div>
                                      <div className="font-medium">
                                        {formatSubmissionTime(student.completedAt)}
                                      </div>
                                      {student.timeTaken && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          استغرق {student.timeTaken} دقيقة
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {getStatusBadge(student.passed)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-lg font-bold ${getScoreColor(student.percentage)}`}>
                                        {student.percentage}%
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({student.correctAnswers}/{student.totalQuestions})
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {student.correctAnswers} من {student.totalQuestions} سؤال صحيح
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <FaUser className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                    </div>
                                    <div className="mr-3 text-right">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {student.user?.fullName || student.user?.username || 'غير محدد'}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {student.user?.email || 'غير محدد'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Performers Section - Only show when showing highest grades */}
          {!loading && showOnlyHighest && processExams().length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-red-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FaTrophy className="text-2xl text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">أفضل الطلاب</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                الطلاب الذين حققوا أعلى الدرجات في الامتحانات
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processExams()
                  .slice(0, 6) // Show top 6 performers
                  .map((exam, index) => (
                    <div key={exam._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-emerald-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-green-600' : 'bg-green-500'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {exam.user?.fullName || exam.user?.username || 'غير محدد'}
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${
                          exam.percentage >= 90 ? 'text-green-600' :
                          exam.percentage >= 80 ? 'text-green-600' :
                          exam.percentage >= 70 ? 'text-green-600' :
                          'text-green-600'
                        }`}>
                          {exam.percentage}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>{exam.course?.title || 'غير محدد'}</div>
                        <div>{exam.lesson?.title || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {formatSubmissionTime(exam.completedAt)}
                        </div>
                        {exam.timeTaken && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            استغرق {exam.timeTaken} دقيقة
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && exams.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد امتحانات
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                لم يتم إنشاء أي امتحانات بعد
              </p>
            </div>
          )}

          {/* No Results State */}
          {!loading && exams.length > 0 && processExams().length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد نتائج مطابقة
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                لم يتم العثور على نتائج مطابقة لمعايير البحث المحددة
              </p>
            </div>
          )}
        </div>

        {/* Exam Details Modal */}
        {showExamDetails && selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    تفاصيل الامتحان
                  </h3>
                  <button
                    onClick={() => setShowExamDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Exam Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">معلومات الامتحان</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">العنوان:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.title || 
                           (selectedExam.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي') ||
                           `امتحان ${selectedExam.lesson?.title || selectedExam.course?.title || ''}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الوصف:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.description || 
                           `${selectedExam.examType === 'training' ? 'امتحان تدريبي' : 'امتحان نهائي'} لدرس "${selectedExam.lesson?.title || ''}" في دورة "${selectedExam.course?.title || ''}"`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الوقت المحدد:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.timeLimit || 0} دقيقة
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">عدد الأسئلة:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.exam?.questionsCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">معلومات الدورة</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">اسم الدورة:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.course?.title || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الدرس:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.lesson?.title || 'غير محدد'}
                        </span>
                      </div>
                      {selectedExam.unit && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">الوحدة:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {selectedExam.unit.title}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">نوع الامتحان:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedExam.examType === 'training' ? 'تدريب' : 'امتحان نهائي'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                {selectedExam.students.length > 0 && (
                  <div className="bg-red-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">إحصائيات الامتحان</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedExam.students.length}
                        </div>
                        <div className="text-green-700 dark:text-green-300">إجمالي الطلاب</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedExam.students.filter(s => s.passed).length}
                        </div>
                        <div className="text-green-700 dark:text-green-300">ناجحون</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedExam.students.filter(s => !s.passed).length}
                        </div>
                        <div className="text-green-700 dark:text-green-300">راسبون</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(selectedExam.students.reduce((sum, s) => sum + s.percentage, 0) / selectedExam.students.length)}%
                        </div>
                        <div className="text-green-700 dark:text-green-300">متوسط النتيجة</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowExamDetails(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamSearchDashboard;
