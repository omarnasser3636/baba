import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/baba';

mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;

    // User: mohamed
    const userId = new mongoose.Types.ObjectId('698dec10e03f9448c6b862f9');

    // Course: sdf
    const courseId = new mongoose.Types.ObjectId('698df023045bb4b423da00ee');

    const payment = {
        user: userId,
        course: courseId,
        amount: 10,
        currency: 'EGP',
        status: 'completed',
        paymentMethod: 'wallet',
        transactionId: 'TEST_PURCHASE_' + Date.now(),
        description: 'Test purchase for admin dashboard verification',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
            courseTitle: 'sdf',
            coursePrice: 10,
            userEmail: 'superdfdf@api.com',
            userName: 'mohamed عبدالمجيد el araby'
        }
    };

    await db.collection('payments').insertOne(payment);
    console.log('Inserted test purchase record');

    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
