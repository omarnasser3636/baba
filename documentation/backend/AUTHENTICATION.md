# 🔐 Authentication

This document explains the authentication system used in the application.

## Overview

The application uses JWT (JSON Web Tokens) for authentication with cookie-based token storage.

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Registration Flow                          │
└─────────────────────────────────────────────────────────────────┘

    Client                              Server
       │                                   │
       │  POST /user/register              │
       │  { email, password, fullName }    │
       │──────────────────────────────────▶│
       │                                   │
       │                                   │ 1. Validate input
       │                                   │ 2. Check if user exists
       │                                   │ 3. Hash password
       │                                   │ 4. Create user
       │                                   │ 5. Generate JWT
       │                                   │
       │   { user, token } + Set Cookie    │
       │◀──────────────────────────────────│
       │                                   │


┌─────────────────────────────────────────────────────────────────┐
│                        Login Flow                                │
└─────────────────────────────────────────────────────────────────┘

    Client                              Server
       │                                   │
       │  POST /user/login                 │
       │  { email, password }              │
       │──────────────────────────────────▶│
       │                                   │
       │                                   │ 1. Find user by email
       │                                   │ 2. Compare password hash
       │                                   │ 3. Generate JWT
       │                                   │
       │   { user, token } + Set Cookie    │
       │◀──────────────────────────────────│
       │                                   │


┌─────────────────────────────────────────────────────────────────┐
│                    Authenticated Request                         │
└─────────────────────────────────────────────────────────────────┘

    Client                              Server
       │                                   │
       │  GET /protected-route             │
       │  Cookie: token=<jwt>              │
       │  (or Authorization: Bearer <jwt>) │
       │──────────────────────────────────▶│
       │                                   │
       │                                   │ 1. Extract token
       │                                   │ 2. Verify JWT
       │                                   │ 3. Attach user to req
       │                                   │
       │   Protected data                  │
       │◀──────────────────────────────────│
       │                                   │
```

## JWT Token Structure

The JWT token contains:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Password Hashing

Passwords are hashed using bcryptjs with 10 salt rounds:

```javascript
// Hashing (in user.model.js pre-save hook)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparing (in user.model.js method)
userSchema.methods.comparePassword = async function(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};
```

## Auth Middleware (`middleware/auth.middleware.js`)

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/error.utils.js';

export const isLoggedIn = async (req, res, next) => {
  try {
    // Get token from cookie or header
    const token = req.cookies?.token || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(new AppError('Please login to access this resource', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new AppError('User not found', 401));
    }

    next();
  } catch (error) {
    return next(new AppError('Invalid token', 401));
  }
};

// Role-based authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }
    next();
  };
};
```

## Using Authentication in Routes

```javascript
import { isLoggedIn, authorizeRoles } from '../middleware/auth.middleware.js';

// Public route
router.get('/courses', getCourses);

// Authenticated route (any logged in user)
router.get('/profile', isLoggedIn, getProfile);

// Admin only route
router.post('/courses', 
  isLoggedIn, 
  authorizeRoles('ADMIN', 'SUPER_ADMIN'), 
  createCourse
);

// Super admin only route
router.delete('/users/:id', 
  isLoggedIn, 
  authorizeRoles('SUPER_ADMIN'), 
  deleteUser
);
```

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `USER` | Regular student | View courses, take exams, manage profile |
| `ADMIN` | Administrator | Manage courses, users, view reports |
| `SUPER_ADMIN` | Super admin | Full access, manage admins |

## Token Storage

### Server Side
The token is set as an HTTP-only cookie:

```javascript
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

### Client Side
The token is also stored in localStorage via Redux:

```javascript
// In AuthSlice.js
localStorage.setItem('token', action.payload.token);
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('role', action.payload.user.role);
localStorage.setItem('data', JSON.stringify(action.payload.user));
```

## Logout

```javascript
export const logout = async (req, res) => {
  // Clear cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.json({ success: true, message: 'Logged out successfully' });
};
```

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **HTTP-Only Cookies**: Prevent XSS access to tokens
3. **Short Token Expiry**: Balance security with UX (7 days default)
4. **Password Requirements**: Enforce strong passwords
5. **Rate Limiting**: Prevent brute force attacks
6. **Input Validation**: Sanitize all user inputs

## Device Management

The application also tracks user devices:

```javascript
const userDeviceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  deviceId: String,
  deviceInfo: {
    browser: String,
    os: String,
    ip: String
  },
  lastActive: Date,
  isBlocked: { type: Boolean, default: false }
});
```

This allows:
- Limiting simultaneous logins
- Viewing active sessions
- Remotely logging out devices
