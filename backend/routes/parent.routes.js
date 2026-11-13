import { Router } from "express";
import { parentLogin, parentLogout, getParentStudentStats } from "../controllers/parent.controller.js";

import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware to protect parent routes
const isParentLoggedIn = async (req, res, next) => {
    // Check for parentToken instead of normal user token
    const token = req.cookies.parentToken;

    if (!token) {
        return next(new AppError("يجب تسجيل الدخول كولي أمر", 401));
    }

    try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

        if (userDetails.role !== 'PARENT') {
            return next(new AppError("الرمز غير صالح، غير مصرح لك كولي أمر", 403));
        }

        req.user = userDetails;
        next();
    } catch (error) {
        return next(new AppError("الرمز غير صالح أو منتهي الصلاحية", 401));
    }
};

router.post('/login', parentLogin);
router.get('/logout', parentLogout);
router.get('/student-stats', isParentLoggedIn, getParentStudentStats);

export default router;
