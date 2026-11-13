import userModel from "../models/user.model.js";
import rechargeCodeModel from "../models/rechargeCode.model.js";
import AppError from "../utils/error.utils.js";

// Get wallet balance and transactions
const getWallet = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Initialize wallet if it doesn't exist
        if (!user.wallet) {
            user.wallet = {
                balance: 0,
                transactions: []
            };
            await user.save();
        }

        // Sort transactions by date (newest first)
        const sortedTransactions = (user.wallet.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            message: "Wallet retrieved successfully",
            data: {
                balance: user.wallet.balance || 0,
                transactions: sortedTransactions
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Recharge wallet with code
const rechargeWallet = async (req, res, next) => {
    try {
        const { code, amount } = req.body;
        const userId = req.user.id;

        if (!code) {
            return next(new AppError("Code is required", 400));
        }

        // Find and validate the recharge code
        const rechargeCode = await rechargeCodeModel.validateCode(code);

        if (!rechargeCode) {
            return next(new AppError("Invalid or expired recharge code", 400));
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Initialize wallet if it doesn't exist
        if (!user.wallet) {
            user.wallet = {
                balance: 0,
                transactions: []
            };
        }

        // Mark code as used
        rechargeCode.isUsed = true;
        rechargeCode.usedBy = userId;
        rechargeCode.usedAt = new Date();
        await rechargeCode.save();

        // Add transaction to history
        const transaction = {
            type: 'recharge',
            amount: rechargeCode.amount,
            code: code,
            description: `Wallet recharged with code: ${code}`,
            date: new Date(),
            status: 'completed'
        };

        user.wallet.transactions.push(transaction);
        user.wallet.balance += rechargeCode.amount;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Wallet recharged successfully",
            data: {
                balance: user.wallet.balance,
                transaction: transaction
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get transaction history
const getTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select('wallet');

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const transactions = user.wallet?.transactions || [];

        // Sort transactions by date (newest first)
        const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            message: "Transaction history retrieved successfully",
            data: {
                transactions: sortedTransactions,
                totalTransactions: sortedTransactions.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Validate recharge code
const validateRechargeCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code) {
            return next(new AppError("Code is required", 400));
        }

        // Check if code exists and is valid
        const rechargeCode = await rechargeCodeModel.validateCode(code);

        if (!rechargeCode) {
            return next(new AppError("Invalid or expired recharge code", 400));
        }

        res.status(200).json({
            success: true,
            message: "Code is valid",
            data: {
                isValid: true,
                amount: rechargeCode.amount
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Recharge with Fawaterk
const rechargeWithFawaterk = async (req, res, next) => {
    try {
        const { amount, paymentMethodId, phoneNumber } = req.body; // paymentMethodId: 2 (Visa), 3 (Fawry), 4 (Wallet)
        const userId = req.user.id;

        if (!amount || amount < 10) {
            return next(new AppError("Amount must be at least 10 EGP", 400));
        }

        if (!paymentMethodId) {
            return next(new AppError("Payment method is required", 400));
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Import service dynamically or at top (assuming imported)
        const { fawaterkService } = await import('../utils/fawaterk.service.js');

        const paymentData = await fawaterkService.executePayment({
            paymentMethodId,
            amount,
            user,
            phoneNumber,
            description: "Wallet Recharge"
        });

        // Initialize wallet if needed (to ensure we can save transaction later)
        if (!user.wallet) {
            user.wallet = { balance: 0, transactions: [] };
            await user.save();
        }

        // We might want to create a pending transaction here to track it, 
        // using the invoice_id from response as a reference.
        // Fawaterk response: { status: "success", data: { invoice_id: ..., invoice_key: ..., payment_data: ... } }

        if (paymentData.status === 'success' && paymentData.data) {
            const transaction = {
                type: 'recharge',
                amount: amount,
                code: `FAWATERK_${paymentData.data.invoice_id}`, // Store Invoice ID here
                description: `Pending Fawaterk Recharge (${paymentMethodId})`,
                date: new Date(),
                status: 'pending'
            };

            user.wallet.transactions.push(transaction);
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: paymentData.data
        });

    } catch (error) {
        return next(new AppError(error.message || "Fawaterk payment initiation failed", 500));
    }
};

// Fawaterk Webhook
const fawaterkWebhook = async (req, res, next) => {
    try {
        const { fawaterkService } = await import('../utils/fawaterk.service.js');
        const data = req.body;

        // Log webhook for debugging
        console.log('Fawaterk Webhook:', JSON.stringify(data));

        // Validate Signature
        // Note: You need to extract hash from header or body depending on Fawaterk docs
        // Docs say 'hashKey' is in the body.

        // const isValid = fawaterkService.validateSignature(data);
        // if (!isValid) {
        //    return next(new AppError("Invalid signature", 400));
        // }

        // Check invoice status
        if (data.invoice_status === 'paid') {
            const invoiceId = data.invoice_id;

            // Find user with this pending transaction
            const user = await userModel.findOne({
                'wallet.transactions.code': `FAWATERK_${invoiceId}`
            });

            if (!user) {
                console.error(`User with invoice ${invoiceId} not found`);
                return res.status(200).json({ status: 'ignored', message: 'User/Transaction not found' });
            }

            // Find the specific transaction
            const transaction = user.wallet.transactions.find(t => t.code === `FAWATERK_${invoiceId}`);

            if (transaction && transaction.status === 'pending') {
                transaction.status = 'completed';
                user.wallet.balance += transaction.amount;
                await user.save();
                console.log(`Wallet recharged for user ${user._id} amount ${transaction.amount}`);
            } else {
                console.log(`Transaction ${invoiceId} already processed or not pending`);
            }
        }

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Webhook Error:', error);
        // Always return 200 to Fawaterk to prevent retries if it's our logic error
        res.status(200).json({ status: 'error', message: error.message });
    }
};

// Get all recharges (Admin)
const getAllRecharges = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        const pipeline = [
            { $unwind: "$wallet.transactions" },
            { $match: { "wallet.transactions.type": "recharge" } },
            { $sort: { "wallet.transactions.date": -1 } }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "wallet.transactions.code": { $regex: search, $options: "i" } },
                        { "fullName": { $regex: search, $options: "i" } },
                        { "email": { $regex: search, $options: "i" } }
                    ]
                }
            });
        }

        const totalRecharges = await userModel.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);

        const total = totalRecharges.length > 0 ? totalRecharges[0].total : 0;

        const recharges = await userModel.aggregate([
            ...pipeline,
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    userName: "$fullName",
                    userEmail: "$email",
                    amount: "$wallet.transactions.amount",
                    date: "$wallet.transactions.date",
                    status: "$wallet.transactions.status",
                    code: "$wallet.transactions.code",
                    paymentMethod: "$wallet.transactions.description" // Assuming description contains methods like "Recharge via Visa"
                }
            }
        ]);

        // Format payment methods
        const formattedRecharges = recharges.map(recharge => {
            let method = recharge.paymentMethod;
            if (method) {
                if (method.includes('(2)')) method = 'Visa / MasterCard';
                else if (method.includes('(3)')) method = 'Fawry';
                else if (method.includes('(4)')) method = 'Mobile Wallet';
                else method = method.replace('Pending Fawaterk Recharge', 'Fawaterk');
            }
            return { ...recharge, paymentMethod: method };
        });

        res.status(200).json({
            success: true,
            data: {
                recharges: formattedRecharges,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getWallet,
    rechargeWallet,
    getTransactionHistory,
    validateRechargeCode,
    rechargeWithFawaterk,
    fawaterkWebhook,
    getAllRecharges
}; 