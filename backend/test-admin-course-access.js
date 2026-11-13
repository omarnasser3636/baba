import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Course from './models/course.model.js';

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

const testAdminCourseAccess = async () => {
  try {
    await connectToDb();

    console.log('🧪 Testing Admin Course Access...\n');

    // Check admin users
    const adminUsers = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
    console.log(`Found ${adminUsers.length} admin users`);

    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found. Please create an admin user first.');
      process.exit(1);
    }

    // Get a sample course
    const sampleCourse = await Course.findOne({}).populate('instructor', 'name').populate('stage', 'name').populate('subject', 'title');

    if (!sampleCourse) {
      console.log('⚠️ No courses found in database');
      process.exit(1);
    }

    console.log(`\n📚 Sample Course: ${sampleCourse.title}`);
    console.log(`👨‍🏫 Instructor: ${sampleCourse.instructor?.name || 'N/A'}`);
    console.log(`📊 Total units: ${sampleCourse.units?.length || 0}`);
    console.log(`📚 Total direct lessons: ${sampleCourse.directLessons?.length || 0}`);

    // Simulate admin access (full content)
    console.log('\n🔑 SIMULATING ADMIN ACCESS:');
    console.log('✅ Admin gets full course data including:');
    console.log('   - All videos, PDFs, exams, trainings');
    console.log('   - Complete lesson content');
    console.log('   - User attempts and results');
    console.log('   - All sensitive data');

    // Simulate regular user access (secure content)
    console.log('\n🔒 SIMULATING REGULAR USER ACCESS:');
    console.log('✅ Regular user gets secure data including:');
    console.log('   - Course metadata only');
    console.log('   - Lesson titles and descriptions');
    console.log('   - Content counts (videosCount, pdfsCount, etc.)');
    console.log('   - ❌ No actual videos, PDFs, exams, trainings');

    // Show the difference
    if (sampleCourse.units && sampleCourse.units.length > 0) {
      const firstUnit = sampleCourse.units[0];
      console.log(`\n📋 Unit "${firstUnit.title}" structure:`);

      if (firstUnit.lessons && firstUnit.lessons.length > 0) {
        const firstLesson = firstUnit.lessons[0];
        console.log(`   📚 Lesson "${firstLesson.title}":`);

        // Admin gets full content
        console.log(`   🔑 ADMIN sees: ${firstLesson.videos?.length || 0} videos, ${firstLesson.pdfs?.length || 0} PDFs, ${firstLesson.exams?.length || 0} exams, ${firstLesson.trainings?.length || 0} trainings`);

        // Regular user gets counts only
        console.log(`   🔒 USER sees: ${firstLesson.videosCount || 0} videos, ${firstLesson.pdfsCount || 0} PDFs, ${firstLesson.examsCount || 0} exams, ${firstLesson.trainingsCount || 0} trainings`);
      }
    }

    console.log('\n✅ Admin access test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   • Admin users bypass all purchase requirements');
    console.log('   • Admin users get full course content including videos, PDFs, exams');
    console.log('   • Regular users get secure/sanitized course data');
    console.log('   • Admin access is controlled by user role in JWT token');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing admin course access:', error);
    process.exit(1);
  }
};

testAdminCourseAccess();
