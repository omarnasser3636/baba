import mongoose from 'mongoose';
import Stage from './models/stage.model.js';
import User from './models/user.model.js';

// Connect to MongoDB (you'll need to set your connection string)
const MONGODB_URI = 'mongodb://127.0.0.1:27017/baba'; // Update this with your actual connection string

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createStages = async () => {
  try {
    const stages = [
      { name: 'الصف الأول الثانوي', status: 'active' },
      { name: 'الصف الثاني الثانوي', status: 'active' },
      { name: 'الصف الثالث الثانوي', status: 'active' },
      { name: 'الصف الأول الإعدادي', status: 'active' },
      { name: 'الصف الثاني الإعدادي', status: 'active' },
      { name: 'الصف الثالث الإعدادي', status: 'active' }
    ];

    const createdStages = [];
    for (const stageData of stages) {
      const existingStage = await Stage.findOne({ name: stageData.name });
      if (!existingStage) {
        const stage = new Stage(stageData);
        await stage.save();
        createdStages.push(stage);
        console.log(`✅ Created stage: ${stage.name}`);
      } else {
        createdStages.push(existingStage);
        console.log(`ℹ️  Stage already exists: ${existingStage.name}`);
      }
    }

    return createdStages;
  } catch (error) {
    console.error('❌ Error creating stages:', error);
    throw error;
  }
};

const updateUsersWithStages = async (stages) => {
  try {
    const users = await User.find({ role: 'USER' });
    console.log(`📊 Found ${users.length} users to update`);

    for (let i = 0; i < users.length; i++) {
      const stageIndex = i % stages.length;
      const user = users[i];
      
      if (!user.stage) {
        user.stage = stages[stageIndex]._id;
        await user.save();
        console.log(`✅ Updated user ${user.fullName} with stage: ${stages[stageIndex].name}`);
      } else {
        console.log(`ℹ️  User ${user.fullName} already has stage: ${user.stage}`);
      }
    }

    console.log('✅ All users updated with stages');
  } catch (error) {
    console.error('❌ Error updating users:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting stage creation script...');
    await connectDB();
    
    console.log('📚 Creating stages...');
    const stages = await createStages();
    
    console.log('👥 Updating users with stages...');
    await updateUsersWithStages(stages);
    
    console.log('🎉 Script completed successfully!');
    console.log('💡 Now refresh your Achievements page to see the stage filter working!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
};

main();
