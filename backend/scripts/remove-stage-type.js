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

// Remove type field from all stages
const removeStageType = async () => {
  try {
    console.log('🗑️ Removing type field from stages...');
    
    // Update all stages to remove the type field
    const result = await stageModel.updateMany(
      {}, // match all documents
      { $unset: { type: "" } } // remove the type field
    );
    
    console.log(`✅ Successfully removed type field from ${result.modifiedCount} stages`);
    
    // Verify the changes
    const stages = await stageModel.find({});
    console.log('📋 Current stages:');
    stages.forEach(stage => {
      console.log(`  - ${stage.name} (ID: ${stage._id})`);
    });
    
  } catch (error) {
    console.error('❌ Error removing stage type:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await removeStageType();
    console.log('🎉 Stage type removal completed successfully!');
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