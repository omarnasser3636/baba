import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaTimes,
  FaClock,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
  FaRedo,
  FaChartBar,
  FaTrophy,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaHistory
} from 'react-icons/fa';
import { takeTrainingExam, takeFinalExam, clearExamError, clearLastExamResult } from '../../Redux/Slices/ExamSlice';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { generateImageUrl } from '../../utils/fileUtils';
import { toast } from 'react-hot-toast';
import ExamHistoryModal from './ExamHistoryModal';

const ExamModal = ({ isOpen, onClose, exam, courseId, lessonId, unitId, examType = 'training' }) => {
  const dispatch = useDispatch();
  const { loading, error, lastExamResult } = useSelector(state => state.exam);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(() => {
    const limit = exam?.timeLimit;

    return (limit && !isNaN(limit)) ? limit * 60 : 1800; // Default to 30 minutes (1800 seconds)
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const questions = exam?.questions || [];
  const totalQuestions = questions.length;

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // Reset state when exam changes
  useEffect(() => {
    if (exam && !examStarted) {
      const limit = exam.timeLimit;

      const validLimit = (limit && !isNaN(limit)) ? limit * 60 : 1800; // Default to 30 minutes
      setTimeLeft(validLimit);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setExamCompleted(false);
      setShowResults(false);
      setTimeTaken(0);
    }
  }, [exam]);

  // Reset stale results when opening a different exam
  useEffect(() => {
    // Clear previous results when exam changes
    dispatch(clearLastExamResult());
    setShowResults(false);
    setExamCompleted(false);
    setIsTimerRunning(false);
  }, [dispatch, exam?._id]);

  // Handle exam result only when it matches current exam context
  useEffect(() => {
    if (!lastExamResult) return;
    // If backend includes examId, ensure it matches current exam
    if (lastExamResult.examId && exam?._id && String(lastExamResult.examId) !== String(exam._id)) {
      return;
    }
    setShowResults(true);
    setExamCompleted(true);
    setIsTimerRunning(false);
  }, [lastExamResult, exam?._id]);

  const formatTime = (seconds) => {
    // Ensure seconds is a valid number
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {

    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionIndex]: selectedAnswer
      };

      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Show confirmation modal before submitting
  const handleSubmitExam = () => {

    if (loading) return;
    setShowConfirmModal(true);
  };

  // Actually submit the exam after confirmation
  const confirmSubmitExam = () => {

    setShowConfirmModal(false);

    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length;

    if (answeredQuestions === 0) {
      toast.error('يجب الإجابة على سؤال واحد على الأقل');
      return;
    }

    const timeTakenMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    setTimeTaken(timeTakenMinutes);
    setIsTimerRunning(false);

    const examData = {
      courseId,
      lessonId,
      unitId,
      examId: exam._id,
      answers: Object.keys(answers).map(key => ({
        questionIndex: parseInt(key),
        selectedAnswer: answers[key]
      })),
      startTime: new Date(startTimeRef.current).toISOString(), // Send start time to backend
      timeTaken: timeTakenMinutes // Keep for backwards compatibility
    };

    if (examType === 'training') {
      dispatch(takeTrainingExam(examData));
    } else {
      dispatch(takeFinalExam(examData));
    }
  };

  const handleClose = () => {
    if (examStarted && !examCompleted) {
      if (window.confirm('هل أنت متأكد من إغلاق الامتحان؟ سيتم فقدان تقدمك.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return 'answered';
    return 'unanswered';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaClock className="text-green-500" />
              <span className={timeLeft < 300 ? 'text-green-600 font-bold' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Question Image - Positioned above the question */}
          {question.image && (
            <div className="mb-4 flex justify-center">
              <div
                className="rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => {
                  setCurrentImage(generateImageUrl(question.image));
                  setImageModalOpen(true);
                }}
              >
                <img
                  src={generateImageUrl(question.image)}
                  alt="صورة السؤال"
                  className="w-full h-full object-cover"
                  onError={(e) => {

                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {question.question}
          </h3>
        </div>

        <div className="space-y-3">
          {question.options.slice(0, question.numberOfOptions || 4).map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${answers[currentQuestionIndex] === optionIndex
                ? 'border-green-500 bg-red-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={optionIndex}
                checked={answers[currentQuestionIndex] === optionIndex}
                onChange={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestionIndex] === optionIndex
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 dark:border-gray-500'
                }`}>
                {answers[currentQuestionIndex] === optionIndex && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionNavigation = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">أسئلة الامتحان</h4>
        <div className="text-sm text-gray-500">
          {Object.keys(answers).length} من {totalQuestions} تمت الإجابة
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${index === currentQuestionIndex
              ? 'bg-green-600 text-white'
              : getQuestionStatus(index) === 'answered'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!lastExamResult) return null;

    const { score, totalQuestions, correctAnswers, wrongAnswers } = lastExamResult;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Calculate if passed based on percentage (you can adjust the passing threshold)
    const passingThreshold = 50; // 50% to pass
    const passed = percentage >= passingThreshold;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-100 dark:bg-green-900' : 'bg-green-100 dark:bg-green-900'
            }`}>
            {passed ? (
              <FaTrophy className="text-3xl text-green-600 dark:text-green-400" />
            ) : (
              <FaExclamationTriangle className="text-3xl text-green-600 dark:text-green-400" />
            )}
          </div>

          <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'
            }`}>
            {passed ?
              (percentage === 100 ? 'ممتاز! درجة كاملة!' :
                percentage >= 90 ? 'مبروك! أداء ممتاز' :
                  percentage >= 80 ? 'مبروك! أداء جيد جداً' :
                    percentage >= 70 ? 'مبروك! أداء جيد' :
                      'مبروك! لقد نجحت في الامتحان')
              : 'حاول مرة أخرى'}
          </h3>

          <p className="text-gray-600 dark:text-gray-300">
            {passed ?
              (percentage === 100 ? 'أداء مثالي! تهانينا على الدرجة الكاملة' :
                percentage >= 90 ? 'أداء ممتاز! استمر في التفوق' :
                  percentage >= 80 ? 'أداء رائع! واصل التقدم' :
                    percentage >= 70 ? 'أداء جيد! يمكنك تحسينه أكثر' :
                      'لقد نجحت! استمر في التعلم')
              : 'لا تستسلم، راجع المادة وحاول مرة أخرى'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{percentage}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">النسبة المئوية</div>
          </div>

          <div className="bg-red-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">الدرجة</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">الإجابات الصحيحة</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{correctAnswers}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">الإجابات الخاطئة</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{wrongAnswers}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">الوقت المستغرق</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{timeTaken} دقيقة</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaHistory />
            مراجعة الأسئلة والإجابات
          </button>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <p className="text-green-100 mt-1">{exam.description}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-green-200 text-2xl transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {error && (
            <div className="mb-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!examStarted ? (
            // Exam Start Screen
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {exam.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {exam.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">عدد الأسئلة</span>
                    <span className="font-semibold">{totalQuestions}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">الوقت المحدد</span>
                    <span className="font-semibold">
                      {exam.timeLimit && !isNaN(exam.timeLimit) ? exam.timeLimit : 30} دقيقة
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleStartExam}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري التحميل...' : 'ابدأ الامتحان'}
                </button>
              </div>
            </div>
          ) : showResults ? (
            // Results Screen
            renderResults()
          ) : (
            // Exam Interface
            <div className="space-y-6">
              {/* Question Navigation - Shown at top on mobile, right side on desktop */}
              <div className="block lg:hidden">
                {renderQuestionNavigation()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  {renderQuestion()}

                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FaChevronRight />

                      السابق
                    </button>

                    <button
                      onClick={handleSubmitExam}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'جاري الإرسال...' : 'إنهاء الامتحان'}
                      <FaCheck />
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      التالي
                      <FaChevronLeft />
                    </button>
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-1">
                  {renderQuestionNavigation()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && currentImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => {
                setImageModalOpen(false);
                setCurrentImage(null);
              }}
              className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300 text-xl" />
            </button>
            <img
              src={currentImage}
              alt="صورة السؤال"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Exam History Modal */}
      <ExamHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        exam={exam}
        courseId={courseId}
        lessonId={lessonId}
        examType={examType}
        examResult={lastExamResult}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-pulse-once">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                هل أنت متأكد من إنهاء الامتحان؟
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {Object.keys(answers).length < questions.length ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ⚠️ لديك {questions.length - Object.keys(answers).length} أسئلة لم يتم الإجابة عليها
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ تم الإجابة على جميع الأسئلة
                  </span>
                )}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                بعد إنهاء الامتحان لن تتمكن من العودة لتعديل الإجابات
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmSubmitExam}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                ✓ تأكيد الإرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamModal;
