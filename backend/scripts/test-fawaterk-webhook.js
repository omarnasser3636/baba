import axios from 'axios';

const API_URL = 'http://localhost:8045/api/v1';

async function testFawaterkWebhook() {
    console.log('Testing Fawaterk Webhook...');
    try {
        const response = await axios.post(`${API_URL}/fawaterk/webhook`, {
            invoice_id: 123456,
            invoice_status: 'paid',
            hashKey: 'test_hash',
            payment_method: "Visa"
        });
        console.log('Webhook Response:', response.data);
        if (response.status === 200) {
            console.log('✅ Webhook endpoint is reachable and returning 200 OK.');
        } else {
            console.log('❌ Webhook endpoint returned unexpected status:', response.status);
        }
    } catch (error) {
        console.error('❌ Webhook test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFawaterkWebhook();
