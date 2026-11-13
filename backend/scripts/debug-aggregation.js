import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from '../models/user.model.js';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/baba';

mongoose.connect(uri).then(async () => {
    console.log('Connected to MongoDB');

    // 2. Run the exact pipeline used in controller
    const pipeline = [
        { $unwind: "$wallet.transactions" },
        { $match: { "wallet.transactions.type": "recharge" } },
        { $sort: { "wallet.transactions.date": -1 } }
    ];

    const results = await User.aggregate(pipeline);

    const output = {
        count: results.length,
        firstResult: results.length > 0 ? results[0].wallet.transactions : null
    };

    fs.writeFileSync('scripts/debug-aggregation-result.json', JSON.stringify(output, null, 2));
    console.log('Done');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
