import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/baba';

mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    const output = {};

    const users = await db.collection('users').find({
        'wallet.transactions.0': { $exists: true }
    }).project({
        fullName: 1,
        email: 1,
        'wallet.balance': 1,
        'wallet.transactions': 1
    }).toArray();

    output.usersWithTransactions = users.length;
    output.users = users.map(u => ({
        name: u.fullName,
        email: u.email,
        balance: u.wallet?.balance,
        transactions: u.wallet?.transactions?.map(t => ({
            type: t.type,
            amount: t.amount,
            status: t.status,
            code: t.code,
            date: t.date
        }))
    }));

    const payments = await db.collection('payments').find({}).toArray();
    output.paymentRecords = payments.length;
    output.payments = payments.map(p => ({
        amount: p.amount,
        status: p.status,
        method: p.paymentMethod,
        txn: p.transactionId
    }));

    fs.writeFileSync('scripts/wallet-data.json', JSON.stringify(output, null, 2), 'utf8');
    console.log('Done - check scripts/wallet-data.json');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
