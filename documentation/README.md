# 📚 Mr. baba - Educational Platform Documentation

Welcome to the documentation for the Mr. baba educational platform. This documentation is designed to help developers understand and maintain the codebase.

## 🏗️ Project Overview

Mr. baba is a comprehensive educational platform built with:
- **Frontend**: React.js with Redux Toolkit for state management
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **UI Framework**: TailwindCSS with DaisyUI components

## 📁 Project Structure

```
baba/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── Components/     # Reusable UI components
│   │   ├── Pages/          # Page components
│   │   ├── Redux/          # State management
│   │   ├── Helpers/        # Utility functions
│   │   ├── Hooks/          # Custom React hooks
│   │   ├── Layout/         # Layout components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   └── ...
├── backend/                # Backend Express API
│   ├── controllers/        # Route handlers
│   ├── models/             # MongoDB models
│   ├── routes/             # API route definitions
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
└── documentation/          # This documentation folder
    ├── frontend/           # Frontend documentation
    └── backend/            # Backend documentation
```

## 📖 Documentation Index

### Frontend Documentation
- [Setup Guide](./frontend/SETUP.md)
- [Architecture Overview](./frontend/ARCHITECTURE.md)
- [Components Guide](./frontend/COMPONENTS.md)
- [State Management (Redux)](./frontend/REDUX.md)
- [Styling Guide](./frontend/STYLING.md)

### Backend Documentation
- [Setup Guide](./backend/SETUP.md)
- [API Reference](./backend/API.md)
- [Database Models](./backend/MODELS.md)
- [Authentication](./backend/AUTHENTICATION.md)
- [Deployment Guide](./backend/DEPLOYMENT.md)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas)
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd baba
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🔑 Key Features

- 📚 **Course Management** - Create and manage courses with units, lessons, videos, PDFs
- 📝 **Exams & Training** - Multiple choice exams with automatic grading
- 👥 **User Management** - Role-based access (Student, Admin, Super Admin)
- 💳 **Payments & Wallet** - Integrated payment system with wallet functionality
- 📊 **Analytics** - Exam results, video progress tracking
- 📱 **Device Management** - Control user device access
- 💬 **Live Meetings** - Online class scheduling and management
- 📖 **Blog System** - Content management for articles
- ❓ **Q&A System** - Questions and answers functionality

## 🌐 URLs

- **Development Frontend**: http://localhost:5173
- **Development Backend**: http://localhost:8045
- **Production Frontend**: https://mena-el-eryan.com
- **Production Backend**: https://api.mena-el-eryan.com

## 👤 Author

This documentation was created for the Mr. baba educational platform.

---

**Last Updated**: December 2025
