import mongoose from 'mongoose';
import stageModel from '../models/stage.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI_ATLAS || 
                   process.env.MONGO_URI_COMPASS || 
                   process.env.MONGO_URI_COMMUNITY || 
                   'mongodb://127.0.0.1:27017/baba';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Create sample stages
const createSampleStages = async () => {
  try {
    console.log('📚 Creating sample stages...');
    
    const sampleStages = [
      { name: '1 ابتدائي', type: 'national', status: 'active' },
      { name: '2 ابتدائي', type: 'national', status: 'active' },
      { name: '3 ابتدائي', type: 'national', status: 'active' },
      { name: '4 ابتدائي', type: 'national', status: 'active' },
      { name: '5 ابتدائي', type: 'national', status: 'active' },
      { name: '6 ابتدائي', type: 'national', status: 'active' },
      { name: '1 إعدادي', type: 'national', status: 'active' },
      { name: '2 إعدادي', type: 'national', status: 'active' },
      { name: '3 إعدادي', type: 'national', status: 'active' },
      { name: '1 ثانوي', type: 'national', status: 'active' },
      { name: '2 ثانوي', type: 'national', status: 'active' },
      { name: '3 ثانوي', type: 'national', status: 'active' },
      { name: '1 جامعة', type: 'national', status: 'active' },
      { name: '2 جامعة', type: 'national', status: 'active' },
      { name: '3 جامعة', type: 'national', status: 'active' },
      { name: '4 جامعة', type: 'national', status: 'active' }
    ];
    
    for (const stageData of sampleStages) {
      const existingStage = await stageModel.findOne({ name: stageData.name });
      if (!existingStage) {
        const stage = await stageModel.create(stageData);
        console.log(`✅ Created stage: ${stage.name}`);
      } else {
        console.log(`⏭️ Stage already exists: ${stageData.name}`);
      }
    }
    
    console.log('✅ Sample stages creation completed!');
  } catch (error) {
    console.error('❌ Error creating stages:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await createSampleStages();
    console.log('🎉 All operations completed successfully!');
  } catch (error) {
    console.error('❌ Error in main:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
main(); 