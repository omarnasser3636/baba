import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.FAWATERK_API_KEY;

const URLS = {
    STAGING: 'https://staging.fawaterk.com/api/v2',
    PRODUCTION: 'https://app.fawaterk.com/api/v2'
};

async function testConnection(url, name) {
    try {
        console.log(`\nTesting ${name} (${url})...`);
        const response = await axios.get(`${url}/getPaymentmethods`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ ${name} Connection Successful!`);
        console.log('Payment Methods Found:', response.data.data.length);
        return true;
    } catch (error) {
        console.log(`❌ ${name} Connection Failed`);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

async function runTests() {
    console.log('--- Fawaterk Connection Test ---');
    console.log(`API Key (first 10 chars): ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'undefined'}`);

    const stagingSuccess = await testConnection(URLS.STAGING, 'STAGING');
    const productionSuccess = await testConnection(URLS.PRODUCTION, 'PRODUCTION');

    if (stagingSuccess) {
        console.log('\nRECOMMENDATION: Use STAGING URL in .env');
        console.log('FAWATERK_BASE_URL=https://staging.fawaterk.com/api/v2');
    } else if (productionSuccess) {
        console.log('\nRECOMMENDATION: Use PRODUCTION URL in .env');
        console.log('FAWATERK_BASE_URL=https://app.fawaterk.com/api/v2');
    } else {
        console.log('\nRECOMMENDATION: Check your API Key. It failed on both environments.');
    }
}

runTests();
