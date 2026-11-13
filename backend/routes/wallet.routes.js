import express from "express";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import {
    getWallet,
    rechargeWallet,
    getTransactionHistory,
    validateRechargeCode,
    rechargeWithFawaterk,
    fawaterkWebhook,
    getAllRecharges
} from "../controllers/wallet.controller.js";

const router = express.Router();

// Public Routes (Webhooks)
router.post("/webhook/fawaterk", fawaterkWebhook);

// All routes below require authentication
router.use(isLoggedIn);

// Get wallet balance and basic info
router.get("/balance", getWallet);

// Recharge wallet with code
router.post("/recharge", rechargeWallet);

// Recharge with Fawaterk
router.post("/recharge/fawaterk", rechargeWithFawaterk);

// Get transaction history
router.get("/transactions", getTransactionHistory);

// Validate recharge code
router.post("/validate-code", validateRechargeCode);

router.get(
    '/admin/recharges',
    authorisedRoles('ADMIN', 'SUPER_ADMIN'),
    getAllRecharges
)

export default router; 