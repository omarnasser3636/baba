import axios from 'axios';
import crypto from 'crypto';

class FawaterkService {
    constructor() {
        this.baseUrl = process.env.FAWATERK_BASE_URL || 'https://staging.fawaterk.com/api/v2';
        this.apiKey = process.env.FAWATERK_API_KEY;
        this.vendorKey = process.env.FAWATERK_VENDOR_KEY;

        console.log('--- FawaterkService Initialized ---');
        console.log('Base URL:', this.baseUrl);
        console.log('API Key:', this.apiKey ? (this.apiKey.substring(0, 10) + '...') : 'undefined');
    }

    /**
     * Get available payment methods
     * @returns {Promise<Array>}
     */
    async getPaymentMethods() {
        try {
            const response = await axios.get(`${this.baseUrl}/getPaymentmethods`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Fawaterk getPaymentMethods Error:', error.response?.data || error.message);
            throw new Error('Failed to fetch payment methods');
        }
    }

    /**
     * Initiate a payment directly
     * @param {Object} data - Payment data
     * @returns {Promise<Object>}
     */
    async executePayment(data) {
        try {
            const { paymentMethodId, amount, user, description, phoneNumber: inputPhoneNumber } = data;

            // Validate phone number
            const phoneNumber = inputPhoneNumber || user.phoneNumber || '01000000000';
            if (!phoneNumber) {
                console.warn('Using dummy phone number for payment');
            }

            // Base user data
            const customer = {
                first_name: user.fullName ? user.fullName.split(' ')[0] : 'User',
                last_name: user.fullName && user.fullName.split(' ').length > 1 ? user.fullName.split(' ').slice(1).join(' ') : 'Customer',
                email: user.email || 'no-email@example.com',
                phone: phoneNumber,
                address: user.governorate || 'Egypt'
            };

            const payload = {
                payment_method_id: paymentMethodId,
                cartTotal: amount.toString(),
                currency: 'EGP',
                customer: customer,
                redirectionUrls: {
                    successUrl: `${process.env.CLIENT_URL}/wallet?status=success`,
                    failUrl: `${process.env.CLIENT_URL}/wallet?status=failed`,
                    pendingUrl: `${process.env.CLIENT_URL}/wallet?status=pending`
                },
                cartItems: [
                    {
                        name: description || 'Wallet Recharge',
                        price: amount.toString(),
                        quantity: '1'
                    }
                ]
            };

            // Add user ID to payload for webhook tracking if needed, 
            // though we usually rely on internal invoiceId mapping
            // Fawaterk allows custom 'payLoad' field
            payload.payLoad = {
                userId: user._id.toString()
            };

            const response = await axios.post(`${this.baseUrl}/invoiceInitPay`, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            // Log full error for debugging
            console.error('Fawaterk executePayment Error:', JSON.stringify(error.response?.data, null, 2) || error.message);

            let errorMessage = 'Payment initiation failed';
            const errorData = error.response?.data;

            if (errorData?.message) {
                if (typeof errorData.message === 'string') {
                    errorMessage = errorData.message;
                } else if (typeof errorData.message === 'object') {
                    // Extract first error message from object values
                    const firstError = Object.values(errorData.message).flat()[0];
                    if (firstError) errorMessage = firstError;
                    else errorMessage = JSON.stringify(errorData.message);
                }
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Validate Webhook Signature
     * @param {Object} data - Webhook body
     * @param {String} requestHash - Hash from header or body
     * @returns {Boolean}
     */
    validateSignature(data, requestHash) {
        /*
        Paid Webhook Hash:
        hash_hmac('sha256' , "InvoiceId=...&InvoiceKey=...&PaymentMethod=..." , secretKey ,false);
        */

        // If data has referenceNumber (Fawry/Aman Expired Callback uses different params), check type
        // But for "Paid" invoice (which is what we care about mostly):

        if (data.invoice_status === 'paid' || (data.invoice_id && data.invoice_key)) {
            const queryParam = `InvoiceId=${data.invoice_id}&InvoiceKey=${data.invoice_key}&PaymentMethod=${data.payment_method}`;
            const hash = crypto.createHmac('sha256', this.vendorKey)
                .update(queryParam)
                .digest('hex');
            return hash === data.hashKey;
        }

        return false;
    }
}

export const fawaterkService = new FawaterkService();
