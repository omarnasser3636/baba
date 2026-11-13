#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

// Load environment variables
dotenv.config();

// Lightweight CLI args parsing
const argv = process.argv.slice(2);
const findArg = (key) => {
  const pref = `--${key}=`;
  const hit = argv.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : undefined;
};

const flag = (key) => argv.includes(`--${key}`);

// Create readline interface (only if interactive)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    return null;
};

const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

const createAdminAccount = async () => {
    console.log("🚀 api Admin Account Creator");
    console.log("=============================\n");
    
    // Prefer CLI overrides first
    let uri = findArg('uri');

    try {
        // Determine DB connection string with reasonable fallbacks
        uri = uri || process.env.MONGO_URI_ATLAS || 
                    process.env.MONGO_URI_COMPASS || 
                    process.env.MONGO_URI_COMMUNITY || 
                    process.env.MONGO_URI || 
                    process.env.MONGODB_URI ||
                    'mongodb://127.0.0.1:27017/baba
        
        const dbType = process.env.DB_TYPE || 'atlas';
        console.log(`📊 Database Type: ${dbType.toUpperCase()}`);
        console.log(`🔗 Using Mongo URI: ${uri}`);
        
        console.log(`🔗 Connecting to database...`);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database connected successfully!\n");
        
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // Non-interactive environments: default to quick mode
        const nonInteractive = !process.stdin.isTTY || flag('quick');
        if (nonInteractive) {
            await createQuickAdmin({ clientUrl });
            return;
        }
        
        console.log("📋 Choose creation mode:");
        console.log("1. Quick Admin (default credentials)");
        console.log("2. Custom Admin (interactive)");
        console.log("3. Bulk Admin (multiple accounts)");
        
        const mode = await askQuestion("\nEnter mode (1-3, default: 1): ") || "1";
        
        switch (mode) {
            case "1":
                await createQuickAdmin({ clientUrl });
                break;
            case "2":
                await createCustomAdmin({ clientUrl });
                break;
            case "3":
                await createBulkAdmins({ clientUrl });
                break;
            default:
                console.log("❌ Invalid mode selected. Using Quick Admin mode.");
                await createQuickAdmin({ clientUrl });
        }
        
    } catch (error) {
        console.error("❌ Error creating admin account:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log("1. Check your database connection");
        console.log("2. Verify your .env file settings");
        console.log("3. Ensure database server is running");
        console.log("4. Check if the User model is properly defined");
        console.log("5. Verify your MongoDB connection string");
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        rl.close();
    }
};

const createQuickAdmin = async ({ clientUrl }) => {
    console.log("\n⚡ Quick Admin Mode");
    console.log("==================\n");
    
    const username = findArg('username') || 'admin';
    const email = findArg('email') || 'admin@api.com';
    const passwordArg = findArg('password');

    const adminData = {
        fullName: "System Administrator",
        username,
        email,
        password: passwordArg || "Admin123!",
        role: "ADMIN",
        isActive: true
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
        $or: [
            { email: adminData.email.toLowerCase() },
            { email: adminData.email.toLowerCase() }
        ]
    });
    
    if (existingAdmin) {
        console.log("⚠️ Admin account already exists!");
        console.log(`📧 Email: ${existingAdmin.email}`);
        console.log(`🔑 Role: ${existingAdmin.role}`);
        return;
    }
    
    console.log("👤 Creating admin account...");
    const admin = new User({
        ...adminData,
        email: adminData.email.toLowerCase(),
    });
    await admin.save();
    
    console.log("✅ Admin account created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🔐 Password: ${adminData.password}`);
    console.log("\n💡 You can now login with these credentials");
    console.log(`🌐 Go to: ${clientUrl}/login`);
};

const createCustomAdmin = async ({ clientUrl }) => {
    console.log("\n🎨 Custom Admin Mode");
    console.log("===================\n");
    
    console.log("📝 Please enter admin details:");
    
    const fullName = await askQuestion("Full Name: ");
    const username = await askQuestion("Username: ");
    const email = await askQuestion("Email: ");
    
    // Ask for password or generate one
    const passwordChoice = await askQuestion("Generate random password? (y/n, default: n): ") || "n";
    let password;
    
    if (passwordChoice.toLowerCase() === 'y' || passwordChoice.toLowerCase() === 'yes') {
        password = generateRandomPassword();
        console.log(`🔐 Generated password: ${password}`);
    } else {
        password = await askQuestion("Password: ");
        const passwordError = validatePassword(password);
        if (passwordError) {
            console.log(`⚠️ ${passwordError}`);
            const continueChoice = await askQuestion("Continue anyway? (y/n): ");
            if (continueChoice.toLowerCase() !== 'y' && continueChoice.toLowerCase() !== 'yes') {
                console.log("❌ Admin account creation cancelled.");
                return;
            }
        }
    }
    
    if (!fullName || !username || !email || !password) {
        throw new Error("All fields are required!");
    }
    if (!isValidEmail(email)) {
        throw new Error("Invalid email format!");
    }
    
    const existingAdmin = await User.findOne({ 
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
        ]
    });
    
    if (existingAdmin) {
        console.log("\n⚠️ Admin account already exists!");
        console.log(`📧 Email: ${existingAdmin.email}`);
        console.log(`🔑 Role: ${existingAdmin.role}`);
        return;
    }
    
    const confirm = await askQuestion("\n❓ Do you want to create this admin account? (y/n): ");
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log("❌ Admin account creation cancelled.");
        return;
    }
    
    console.log("\n👤 Creating admin account...");
    const admin = new User({
        fullName: fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        role: "ADMIN",
        isActive: true
    });
    await admin.save();
    
    console.log("✅ Admin account created successfully!");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🔐 Password: ${password}`);
    console.log("\n💡 You can now login with these credentials");
    console.log(`🌐 Go to: ${clientUrl}/login`);
};

const createBulkAdmins = async ({ clientUrl }) => {
    console.log("\n📦 Bulk Admin Mode");
    console.log("==================\n");
    
    const count = parseInt(await askQuestion("How many admin accounts to create? (default: 3): ") || "3");
    if (count < 1 || count > 10) {
        console.log("❌ Please enter a number between 1 and 10.");
        return;
    }
    
    console.log(`\n📝 Creating ${count} admin accounts...\n`);
    const createdAdmins = [];
    
    for (let i = 1; i <= count; i++) {
        console.log(`\n--- Admin Account ${i}/${count} ---`);
        const fullName = await askQuestion(`Full Name for Admin ${i}: `);
        const username = await askQuestion(`Username for Admin ${i}: `);
        const email = await askQuestion(`Email for Admin ${i}: `);
        const password = generateRandomPassword();
        
        if (!fullName || !username || !email) {
            console.log(`⚠️ Skipping Admin ${i} - missing required fields`);
            continue;
        }
        if (!isValidEmail(email)) {
            console.log(`⚠️ Skipping Admin ${i} - invalid email format`);
            continue;
        }
        
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        if (existingAdmin) {
            console.log(`⚠️ Admin ${i} already exists!`);
            continue;
        }
        
        try {
            const admin = new User({
                fullName: fullName,
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password: password,
                role: "ADMIN",
                isActive: true
            });
            await admin.save();
            createdAdmins.push({ fullName, username: admin.username, email: admin.email, password });
            console.log(`✅ Admin ${i} created successfully!`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👤 Username: ${admin.username}`);
            console.log(`   🔐 Password: ${password}`);
        } catch (error) {
            console.log(`❌ Error creating Admin ${i}: ${error.message}`);
        }
    }
    
    console.log("\n📊 Summary:");
    console.log(`✅ Successfully created ${createdAdmins.length} admin accounts`);
    console.log(`❌ Failed to create ${count - createdAdmins.length} admin accounts`);
    
    if (createdAdmins.length > 0) {
        console.log("\n📋 Created Admin Accounts:");
        createdAdmins.forEach((admin, index) => {
            console.log(`\n${index + 1}. ${admin.fullName}`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👤 Username: ${admin.username}`);
            console.log(`   🔐 Password: ${admin.password}`);
        });
        console.log("\n💡 You can now login with any of these credentials");
        console.log(`🌐 Go to: ${clientUrl}/login`);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminAccount();
}

export default createAdminAccount;
