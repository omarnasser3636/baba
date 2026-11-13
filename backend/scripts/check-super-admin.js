import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/baba');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

const checkSuperAdmin = async () => {
  try {
    await connectToDb();
    
    // Check for super admin
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (superAdmin) {
      console.log('✅ Super admin found:');
      console.log('👤 Username:', superAdmin.username);
      console.log('📧 Email:', superAdmin.email);
      console.log('👑 Role:', superAdmin.role);
      console.log('🔑 Permissions:', superAdmin.adminPermissions);
      console.log('✅ Is Active:', superAdmin.isActive);
      console.log('🆔 ID:', superAdmin._id);
    } else {
      console.log('❌ No super admin found');
    }
    
    // Check for any admin users
    const adminUsers = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
    console.log('\n📊 Admin users found:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check for regular users
    const regularUsers = await User.find({ role: 'USER' });
    console.log('\n👥 Regular users found:', regularUsers.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking super admin:', error);
    process.exit(1);
  }
};

checkSuperAdmin();
