# 🗄️ Database Models

This document describes the MongoDB models used in the application.

## Overview

The application uses Mongoose ODM with the following models:

| Model | Description |
|-------|-------------|
| User | User accounts and authentication |
| Course | Courses with units, lessons, exams |
| Stage | Educational stages/grades |
| Subject | Course subjects |
| Instructor | Instructor profiles |
| Group | Student groups |
| Attendance | Attendance records |
| LiveMeeting | Online class sessions |
| Blog | Blog posts |
| QA | Q&A items |
| Financial | Financial transactions |
| Payment | Payment records |
| ExamResult | Exam results (separate collection) |

---

## User Model (`user.model.js`)

```javascript
const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'USER'
  },
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
  isActive: { type: Boolean, default: true },
  avatar: {
    public_id: String,
    secure_url: String
  },
  wallet: { type: Number, default: 0 },
  purchasedLessons: [{ type: Schema.Types.ObjectId }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**Key Features:**
- Password is hashed before saving
- Password field is excluded from queries by default
- References Stage for filtering courses

---

## Course Model (`course.model.js`)

```javascript
const courseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: Schema.Types.ObjectId, ref: 'Instructor' },
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  image: {
    public_id: String,
    secure_url: String
  },
  featured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  
  // Nested structure
  units: [unitSchema],
  directLessons: [lessonSchema],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Nested Schemas

**Unit Schema:**
```javascript
const unitSchema = new Schema({
  title: String,
  description: String,
  price: { type: Number, default: 0 },
  lessons: [lessonSchema]
});
```

**Lesson Schema:**
```javascript
const lessonSchema = new Schema({
  title: String,
  description: String,
  price: { type: Number, default: 0 },
  content: String,
  videos: [videoSchema],
  pdfs: [pdfSchema],
  exams: [examSchema],
  trainings: [trainingSchema],
  entryExam: entryExamSchema,
  requireExamToUnlock: { type: Boolean, default: false }
});
```

**Exam Schema:**
```javascript
const examSchema = new Schema({
  title: String,
  description: String,
  timeLimit: { type: Number, default: 30 }, // minutes
  openDate: Date,
  closeDate: Date,
  questions: [questionSchema],
  userAttempts: [attemptSchema]
});
```

**Question Schema:**
```javascript
const questionSchema = new Schema({
  question: String,
  options: [String],
  correctAnswer: Number, // Index of correct option
  explanation: String,
  image: String,
  numberOfOptions: { type: Number, default: 4 }
});
```

**User Attempt Schema:**
```javascript
const attemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  takenAt: { type: Date, default: Date.now },
  score: Number,
  totalQuestions: Number,
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }]
});
```

---

## Stage Model (`stage.model.js`)

```javascript
const stageSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
```

---

## Subject Model (`subject.model.js`)

```javascript
const subjectSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
  isActive: { type: Boolean, default: true }
});
```

---

## Instructor Model (`instructor.model.js`)

```javascript
const instructorSchema = new Schema({
  name: { type: String, required: true },
  bio: String,
  specialization: String,
  avatar: {
    public_id: String,
    secure_url: String
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  isActive: { type: Boolean, default: true }
});
```

---

## Group Model (`group.model.js`)

```javascript
const groupSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});
```

---

## Attendance Model (`attendance.model.js`)

```javascript
const attendanceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  notes: String,
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});
```

---

## Live Meeting Model (`liveMeeting.model.js`)

```javascript
const liveMeetingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  meetingUrl: String,
  startTime: Date,
  endTime: Date,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});
```

---

## Blog Model (`blog.model.js`)

```javascript
const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: String,
  image: {
    public_id: String,
    secure_url: String
  },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
```

---

## Financial Model (`financial.model.js`)

```javascript
const financialSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['income', 'expense', 'recharge', 'purchase'],
    required: true
  },
  amount: { type: Number, required: true },
  description: String,
  reference: String,
  createdAt: { type: Date, default: Date.now }
});
```

---

## Relationships Diagram

```
┌─────────────┐       ┌─────────────┐
│    Stage    │◄──────│    User     │
└─────────────┘       └──────┬──────┘
       │                     │
       │                     │ purchases
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   Subject   │       │   Lesson    │
└─────────────┘       └─────────────┘
       │
       │
       ▼
┌─────────────┐       ┌─────────────┐
│   Course    │──────▶│ Instructor  │
└──────┬──────┘       └─────────────┘
       │
       │ contains
       ▼
┌─────────────┐
│    Unit     │
└──────┬──────┘
       │
       │ contains
       ▼
┌─────────────┐
│   Lesson    │
└──────┬──────┘
       │
       │ contains
       ▼
┌─────────────────────────────────────┐
│  Videos │ PDFs │ Exams │ Trainings  │
└─────────────────────────────────────┘
```

---

## Indexes

Create indexes for frequently queried fields:

```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ stage: 1 });

// Course indexes
courseSchema.index({ stage: 1 });
courseSchema.index({ featured: 1 });
courseSchema.index({ isPublished: 1 });

// Attendance indexes
attendanceSchema.index({ user: 1, date: 1 });
attendanceSchema.index({ group: 1, date: 1 });
```

---

## Common Query Patterns

### Get courses for a stage
```javascript
const courses = await Course.find({ stage: stageId })
  .populate('instructor', 'name')
  .populate('stage', 'name')
  .populate('subject', 'title');
```

### Get user with stage
```javascript
const user = await User.findById(userId)
  .populate('stage', 'name');
```

### Get exam with populated user attempts
```javascript
const courses = await Course.find()
  .populate({
    path: 'units.lessons.exams.userAttempts.userId',
    select: 'fullName email phoneNumber'
  });
```
