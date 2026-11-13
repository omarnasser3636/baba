import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";
import ExamResult from "../models/examResult.model.js";
import VideoProgress from "../models/videoProgress.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Parent Login
export const parentLogin = async (req, res, next) => {
    try {
        const { fatherPhoneNumber, studentPhoneNumber } = req.body;

        if (!fatherPhoneNumber || !studentPhoneNumber) {
            return next(new AppError('رقم ولي الأمر ورقم الطالب مطلوبان للتسجيل', 400));
        }

        // Find the student matching both phone numbers
        const student = await userModel.findOne({
            fatherPhoneNumber: fatherPhoneNumber.trim(),
            phoneNumber: studentPhoneNumber.trim(),
            role: 'USER'
        }).populate('stage', 'name');

        if (!student) {
            return next(new AppError('بيانات الدخول غير صحيحة، تأكد من رقم ولي الأمر ورقم الطالب', 400));
        }

        // Generate a specific PARENT token that only grants access to this student's stats
        const payload = {
            id: student._id,
            role: 'PARENT',
            type: 'access'
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Don't send sensetive info
        const safeStudentData = {
            _id: student._id,
            fullName: student.fullName,
            phoneNumber: student.phoneNumber,
            fatherPhoneNumber: student.fatherPhoneNumber,
            stage: student.stage,
            avatar: student.avatar
        };

        res.cookie("parentToken", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            student: safeStudentData,
            token
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Parent Logout
export const parentLogout = async (req, res, next) => {
    try {
        res.cookie('parentToken', '', {
            ...cookieOptions,
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export const getParentStudentStats = async (req, res, next) => {
    try {
        // The middleware guarantees req.user.id is the student's ID and role is PARENT
        const studentId = req.user.id;

        // Fetch student data securely
        const student = await userModel.findById(studentId).select('fullName avatar _id stage').populate('stage', 'name');

        if (!student) {
            return next(new AppError('الطالب غير موجود', 404));
        }

        // 1. Fetch Exam History
        const examHistory = await ExamResult.find({ user: studentId })
            .populate('course', 'title _id')
            .sort({ createdAt: -1 });

        // Calculate Exam Stats
        const totalExams = examHistory.length;
        const passedExams = examHistory.filter(e => e.passed).length;
        const failedExams = totalExams - passedExams;
        const trainingExams = examHistory.filter(e => e.examType === 'training').length;
        const finalExams = examHistory.filter(e => e.examType === 'final').length;

        const totalScore = examHistory.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const averageScore = totalExams > 0 ? Math.round(totalScore / totalExams) : 0;

        const examStats = {
            total: totalExams,
            passed: passedExams,
            failed: failedExams,
            averageScore,
            trainingExams,
            finalExams
        };

        // 2. Fetch Video Progress
        // Based on the format inside VideoProgress controller
        const videoProgressList = await VideoProgress.find({ user: studentId });

        const totalVideosWatched = videoProgressList.length;
        const completedVideos = videoProgressList.filter(v => v.isCompleted).length;
        const completionRate = totalVideosWatched > 0
            ? Math.round((completedVideos / totalVideosWatched) * 100) + '%'
            : '0%';

        const totalWatchSeconds = videoProgressList.reduce((acc, curr) => {
            const watchMax = curr.highestWatchedTime || 0;
            return acc + watchMax;
        }, 0);

        const totalWatchTimeHours = (totalWatchSeconds / 3600).toFixed(1);

        // Calculate active days
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentActivity = videoProgressList.filter(v => v.lastWatchedAt >= last30Days);
        const uniqueActiveDays = new Set(
            recentActivity.map(v => new Date(v.lastWatchedAt).toLocaleDateString())
        ).size;

        const videoStats = {
            totalVideosWatched,
            completedVideos,
            completionRate,
            totalWatchTimeHours,
            activeDaysLast30: uniqueActiveDays
        };

        res.status(200).json({
            success: true,
            message: 'تم جلب إحصائيات الطالب بنجاح',
            data: {
                student,
                examStats,
                examHistory,
                videoStats
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};
