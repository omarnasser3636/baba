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

const createSuperAdmin = async () => {
  try {
    await connectToDb();
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      console.log('⚠️ Super admin already exists:', existingSuperAdmin.email);
      console.log('👑 Role:', existingSuperAdmin.role);
      return;
    }
    
    // Create super admin user
    const superAdminData = {
      fullName: 'Super Administrator',
      email: 'superadmin@api.com',
      password: 'SuperAdmin123!',
      role: 'SUPER_ADMIN',
      adminPermissions: [
        'CREATE_ADMIN',
        'DELETE_ADMIN', 
        'MANAGE_USERS',
        'MANAGE_COURSES',
        'MANAGE_PAYMENTS',
        'VIEW_ANALYTICS'
      ],
      isActive: true
    };

    const superAdmin = new User(superAdminData);
    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔐 Password:', superAdminData.password);
    console.log('👑 Role:', superAdmin.role);
    console.log('🔑 Permissions:', superAdmin.adminPermissions);
    console.log('\n💡 You can now login with these credentials');
    console.log('🌐 Go to: http://localhost:5173/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
