import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectToDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/baba', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔄 MongoDB connection closed through app termination');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.log('💡 Make sure MongoDB is running and your connection string is correct');
        process.exit(1);
    }
}

export default connectToDb;