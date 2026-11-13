import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.FAWATERK_BASE_URL;
const API_KEY = process.env.FAWATERK_API_KEY;

console.log('--- Fawaterk Payment Methods ---');
console.log(`Base URL: ${BASE_URL}`);

async function listMethods() {
    try {
        const response = await axios.get(`${BASE_URL}/getPaymentmethods`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Available Payment Methods:');
        console.log(JSON.stringify(response.data.data, null, 2));
    } catch (error) {
        console.error('❌ Failed to list methods');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

listMethods();
