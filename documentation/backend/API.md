# 📡 API Reference

This document provides an overview of all available API endpoints.

## Base URL

- **Development**: `http://localhost:8045/api/v1`
- **Production**: `https://api.mena-el-eryan.com/api/v1`

## Authentication

Most endpoints require authentication via JWT token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Or via Cookie:**
The token is automatically sent via `token` cookie.

---

## Authentication Endpoints

### POST `/user/register`
Register a new user.

**Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string",
  "stage": "stageId"
}
```

**Response:** User data with JWT token

---

### POST `/user/login`
Login user.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** User data with JWT token

---

### GET `/user/me`
Get current user profile.

**Auth Required:** Yes

**Response:** User data

---

### POST `/user/logout`
Logout user (clears token cookie).

---

## Course Endpoints

### GET `/courses`
Get all courses (filtered by user's stage).

**Auth Required:** Optional (for stage filtering)

**Query Params:**
- `search`: Search in title/description
- `stage`: Filter by stage ID
- `subject`: Filter by subject ID

---

### GET `/courses/:id`
Get single course by ID.

---

### GET `/admin/all`
Get all courses (admin view with full data).

**Auth Required:** Yes (Admin only)

**Query Params:**
- `search`: Search term
- `instructor`: Filter by instructor
- `stage`: Filter by stage
- `featured`: Boolean
- `isPublished`: Boolean

---

### POST `/courses`
Create new course.

**Auth Required:** Yes (Admin only)

**Body (multipart/form-data):**
- `title`: string
- `description`: string
- `instructor`: instructorId
- `stage`: stageId
- `subject`: subjectId
- `image`: file (optional)

---

### PUT `/courses/:id`
Update course.

**Auth Required:** Yes (Admin only)

---

### DELETE `/courses/:id`
Delete course.

**Auth Required:** Yes (Admin only)

---

## User Management (Admin)

### GET `/admin/users`
Get all users with pagination.

**Auth Required:** Yes (Admin only)

**Query Params:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `role`: Filter by role
- `stage`: Filter by stage

---

### POST `/admin/users`
Create new user.

**Auth Required:** Yes (Admin only)

---

### PUT `/admin/users/:id`
Update user.

**Auth Required:** Yes (Admin only)

---

### DELETE `/admin/users/:id`
Delete user.

**Auth Required:** Yes (Admin only)

---

## Exam Endpoints

### POST `/exams/submit/:examId`
Submit exam answers.

**Auth Required:** Yes

**Body:**
```json
{
  "answers": [
    { "questionIndex": 0, "selectedAnswer": 1 },
    { "questionIndex": 1, "selectedAnswer": 0 }
  ]
}
```

---

### GET `/exams/results/:examId`
Get exam results.

**Auth Required:** Yes

---

## Stage Endpoints

### GET `/stages`
Get all stages.

---

### POST `/stages`
Create new stage.

**Auth Required:** Yes (Admin only)

---

### PUT `/stages/:id`
Update stage.

**Auth Required:** Yes (Admin only)

---

### DELETE `/stages/:id`
Delete stage.

**Auth Required:** Yes (Admin only)

---

## Subject Endpoints

### GET `/subjects`
Get all subjects.

---

### POST `/subjects`
Create new subject.

**Auth Required:** Yes (Admin only)

---

## Instructor Endpoints

### GET `/instructors`
Get all instructors.

---

### GET `/instructors/:id`
Get instructor by ID.

---

### POST `/instructors`
Create new instructor.

**Auth Required:** Yes (Admin only)

---

## Attendance Endpoints

### GET `/attendance`
Get attendance records.

**Auth Required:** Yes (Admin only)

---

### POST `/attendance`
Record attendance.

**Auth Required:** Yes (Admin only)

---

## Live Meeting Endpoints

### GET `/live-meetings`
Get all live meetings.

**Auth Required:** Yes

---

### POST `/live-meetings`
Create new meeting.

**Auth Required:** Yes (Admin only)

---

## Financial Endpoints

### GET `/financial/transactions`
Get financial transactions.

**Auth Required:** Yes (Admin only)

---

### GET `/financial/report`
Get financial report.

**Auth Required:** Yes (Admin only)

---

## Wallet Endpoints

### GET `/wallet/balance`
Get user wallet balance.

**Auth Required:** Yes

---

### POST `/wallet/recharge`
Recharge wallet using code.

**Auth Required:** Yes

**Body:**
```json
{
  "code": "string"
}
```

---

## Blog Endpoints

### GET `/blogs`
Get all blog posts.

---

### GET `/blogs/:id`
Get single blog post.

---

### POST `/blogs`
Create new blog post.

**Auth Required:** Yes (Admin only)

---

## Q&A Endpoints

### GET `/qa`
Get all Q&A items.

---

### POST `/qa`
Create new question.

**Auth Required:** Yes

---

### POST `/qa/:id/answer`
Answer a question.

**Auth Required:** Yes (Admin only)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Pagination

Paginated endpoints return:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```
