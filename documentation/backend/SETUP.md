# 🖥️ Backend Setup Guide

This guide explains how to set up and run the backend API server.

## Prerequisites

- **Node.js**: >= 18.x
- **MongoDB**: Local installation or MongoDB Atlas
- **npm**: >= 9.x

## Installation

1. **Navigate to the backend directory**
   ```bash
   cd baba/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file (or copy from `.env.example`):
   
   ```env
   # Server
   PORT=8045
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URL=mongodb://127.0.0.1:27017/baba
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRY=7d
   
   # Client URLs
   CLIENT_URL=http://localhost:5173
   FRONTEND_URL=http://localhost:5173
   
   # Production URLs (optional)
   PRODUCTION_BACKEND_URL=https://api.mena-el-eryan.com
   PRODUCTION_CLIENT_URL=https://mena-el-eryan.com
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The API will be available at `http://localhost:8045`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server with nodemon (auto-reload) |
| `npm run dev` | Alternative dev command |

## Project Structure

```
backend/
├── server.js            # Entry point
├── app.js               # Express app configuration
├── config/              # Configuration files
│   └── db.config.js     # Database connection
├── controllers/         # Route handlers
│   ├── user.controller.js
│   ├── course.controller.js
│   └── ...
├── models/              # Mongoose models
│   ├── user.model.js
│   ├── course.model.js
│   └── ...
├── routes/              # Route definitions
│   ├── user.routes.js
│   ├── course.routes.js
│   └── ...
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   └── ...
├── utils/               # Utility functions
│   ├── error.utils.js
│   └── ...
└── uploads/             # File uploads directory
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT authentication |
| `bcryptjs` | Password hashing |
| `cors` | Cross-origin resource sharing |
| `multer` | File uploads |
| `nodemon` | Development auto-reload |
| `cookie-parser` | Cookie handling |

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRY` | Token expiry duration | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Database Setup

### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://127.0.0.1:27017/baba`

### MongoDB Atlas

1. Create a cluster on MongoDB Atlas
2. Create a database user
3. Whitelist your IP address
4. Get connection string and update `.env`

## Testing the Server

After starting the server, you can test it:

```bash
# Check if server is running
curl http://localhost:8045/api/v1/health

# Or use a REST client like Postman
```

## Common Issues

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string format
- Verify network access (for Atlas)

### Port Already in Use
```bash
# Kill process on port 8045
npx kill-port 8045
```

### CORS Errors
- Check `CLIENT_URL` in `.env`
- Verify the origin is in the allowed list in `app.js`

## Next Steps

- Read the [API Reference](./API.md)
- Explore [Database Models](./MODELS.md)
- Understand [Authentication](./AUTHENTICATION.md)
