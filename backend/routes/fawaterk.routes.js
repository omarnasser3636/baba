import express from 'express';
import { fawaterkWebhook } from '../controllers/wallet.controller.js';

const router = express.Router();

// Webhook route for Fawaterk callbacks
// Matches: /api/v1/fawaterk/webhook
router.post('/webhook', fawaterkWebhook);

export default router;
