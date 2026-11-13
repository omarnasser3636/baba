import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { getAllCourses } from '../../Redux/Slices/CourseSlice';
import { getAllStages } from '../../Redux/Slices/StageSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import {
  FaSearch,
  FaFilter,
  FaBookOpen,
  FaUser,
  FaStar,
  FaPlay,
  FaEye,
  FaGraduationCap,
  FaClock,
  FaUsers,
  FaArrowRight,
  FaTimes
} from 'react-icons/fa';

export default function CoursesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, loading } = useSelector((state) => state.course);
  const { stages } = useSelector((state) => state.stage);
  const { subjects } = useSelector((state) => state.subject);

  // Get user data for stage filtering
  const { isLoggedIn, data: userData } = useSelector((state) => state.auth);
  const userStageId = userData?.stage?._id || userData?.stage;

  // Initialize filters - if logged in, default to user's stage
  const [filters, setFilters] = useState({
    stage: searchParams.get('stage') || '',
    subject: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(searchParams.get('stage') ? true : false);

  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getAllStages());
    dispatch(getAllSubjects());
  }, [dispatch]);

  // Set user's stage as default filter when logged in and no URL param
  useEffect(() => {
    if (isLoggedIn && userStageId && !searchParams.get('stage')) {
      setFilters(prev => ({ ...prev, stage: userStageId }));
    }
  }, [isLoggedIn, userStageId, searchParams]);

  // Update filters when URL params change
  useEffect(() => {
    const stageFromUrl = searchParams.get('stage');
    if (stageFromUrl) {
      setFilters(prev => ({ ...prev, stage: stageFromUrl }));
      setShowFilters(true);
    }
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    // When logged in, keep the user's stage filter
    setFilters({
      stage: isLoggedIn && userStageId ? userStageId : '',
      subject: '',
      search: ''
    });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase());

    // Handle both _id and id formats for stage matching
    const courseStageId = course.stage?._id || course.stage?.id || course.stage;

    // For logged-in users, ALWAYS filter by their stage (cannot see other stages)
    if (isLoggedIn && userStageId) {
      const matchesUserStage = courseStageId === userStageId;
      const matchesSubject = !filters.subject || course.subject?._id === filters.subject;
      return matchesSearch && matchesUserStage && matchesSubject;
    }

    // For guests, use the selected filter
    const matchesStage = !filters.stage || courseStageId === filters.stage;
    const matchesSubject = !filters.subject || course.subject?._id === filters.subject;

    return matchesSearch && matchesStage && matchesSubject;
  });

  const getTotalLessons = (course) => {
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

  const getTotalPrice = (course) => {
    let total = 0;
    if (course.directLessons) {
      course.directLessons.forEach(lesson => {
        total += lesson.price || 0;
      });
    }
    if (course.units) {
      course.units.forEach(unit => {
        total += unit.price || 0;
        if (unit.lessons) {
          unit.lessons.forEach(lesson => {
            total += lesson.price || 0;
          });
        }
      });
    }
    return total;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Show stage name if filtering by stage */}
              {filters.stage ? (
                <>
                  <div className="mb-4">
                    <Link
                      to="/courses"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, stage: '' }));
                        setSearchParams({});
                      }}
                      className="text-green-200 hover:text-white transition-colors"
                    >
                      الكورسات المتاحة
                    </Link>
                    <span className="mx-2 text-green-300">/</span>
                    <span className="text-white font-semibold">
                      {stages.find(s => (s._id || s.id) === filters.stage)?.name || 'المرحلة المختارة'}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    كورسات {stages.find(s => (s._id || s.id) === filters.stage)?.name || ''}
                  </h1>
                  <p className="text-xl text-green-100 max-w-3xl mx-auto">
                    استعرض جميع الكورسات المتاحة لهذه المرحلة
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    الكورسات المتاحة
                  </h1>
                  <p className="text-xl text-green-100 max-w-3xl mx-auto">
                    اكتشف مجموعة متنوعة من الكورسات التعليمية المصممة خصيصاً لمساعدتك في تحقيق أهدافك الأكاديمية
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="ابحث في الدورات..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FaFilter />
              <span>الفلاتر</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className={`grid gap-4 ${isLoggedIn && userStageId ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {/* Stage Filter - Hidden for logged-in users (locked to their stage) */}
                {isLoggedIn && userStageId ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المرحلة (مرحلتك الدراسية)
                    </label>
                    <div className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-red-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                      {stages.find(s => (s._id || s.id) === userStageId)?.name || 'مرحلتك الدراسية'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المرحلة
                    </label>
                    <select
                      value={filters.stage}
                      onChange={(e) => handleFilterChange('stage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">جميع المراحل</option>
                      {stages.map((stage) => {
                        const stageId = stage._id || stage.id;
                        return (
                          <option key={stageId} value={stageId}>
                            {stage.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المادة
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">جميع المواد</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <FaTimes />
                    <span>مسح الفلاتر</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              تم العثور على <span className="font-semibold text-gray-900 dark:text-white">{filteredCourses.length}</span> دورة
            </p>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الدورات...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Course Image */}
                  <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden">
                    {course.image && course.image.secure_url ? (
                      // Display actual course image
                      <img
                        src={`${import.meta.env.VITE_REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:8045'}/uploads/courses/${course.image.public_id}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    {/* Fallback placeholder icon */}
                    <div className={`absolute inset-0 flex items-center justify-center ${course.image && course.image.secure_url ? 'hidden' : ''}`}>
                      <FaBookOpen className="text-6xl text-white opacity-80" />
                    </div>

                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-full">
                        {course.stage?.name || 'غير محدد'}
                      </span>
                    </div>
                  </div>


                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Meta */}
                    <div className="space-y-3 mb-4">
                      {/* Instructor */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaUser className="text-gray-400" />
                        <span>{course.instructor?.name || 'غير محدد'}</span>
                        <FaStar className="text-green-500" />
                        <span>{getTotalLessons(course)} درس متاح</span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Course Description */}
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {course.description}
                      </p>





                      {/* Course Price */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {(course.price || 0) > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">سعر الكورس:</span>
                            <span className="text-lg font-bold text-green-600">{course.price} جنيه</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">سعر الكورس:</span>
                            <span className="text-lg font-bold text-green-600">مجاني ✓</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaEye />
                        <span>عرض التفاصيل</span>
                      </Link>
                      {(course.price || 0) > 0 ? (
                        <Link
                          to={`/courses/${course._id}`}
                          className="flex-1 bg-orange-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <FaGraduationCap />
                          <span>شراء الكورس</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/courses/${course._id}`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlay />
                          <span>ابدأ مجاناً</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد دورات متاحة
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                جرب تغيير الفلاتر أو البحث عن شيء آخر
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
