# 🏛️ Frontend Architecture

This document explains the overall architecture and design patterns used in the frontend application.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library |
| Vite | 4.x | Build tool |
| Redux Toolkit | Latest | State management |
| React Router | 6.x | Routing |
| TailwindCSS | 3.x | Styling |
| Axios | Latest | HTTP client |

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        main.jsx                              │
│                    (Application Entry)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Redux Provider                            │
│                 (Global State Store)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      App.jsx                                 │
│               (Router Configuration)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Router                            │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              Page Components                   │  │    │
│  │  │     (HomePage, Login, Dashboard, etc.)        │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure Overview

### `/Components` - Reusable UI Components

Components that are used across multiple pages:

- **Navbar.jsx** - Main navigation bar with theme toggle
- **Footer.jsx** - Site footer with links
- **Sidebar.jsx** - Admin dashboard sidebar
- **ExamModal.jsx** - Modal for taking exams
- **CourseCards.jsx** - Course display cards
- **LoadingSpinner.jsx** - Loading indicators

### `/Pages` - Route Components

Each major route has its own page component:

```
Pages/
├── HomePage.jsx           # Landing page
├── Login.jsx              # User login
├── Signup.jsx             # User registration
├── Dashboard/             # Admin dashboard
│   ├── AdminDashboard.jsx
│   ├── UsersDashboard.jsx
│   ├── CoursesDashboard.jsx
│   ├── CourseExamsDashboard.jsx
│   └── ...
├── Courses/
│   ├── CourseList.jsx
│   └── CourseDetail.jsx
├── User/
│   └── Profile.jsx
└── ...
```

### `/Redux` - State Management

Redux Toolkit slices organize state by feature:

```
Redux/
├── store.js              # Store configuration
└── Slices/
    ├── AuthSlice.js      # Authentication state
    ├── CourseSlice.js    # Courses data
    ├── AdminUserSlice.js # Admin user management
    └── ...
```

### `/Helpers` - Utility Functions

```
Helpers/
├── axiosInstance.js      # Configured Axios instance
└── useScrollToTop.js     # Custom hook
```

## Authentication Flow

```
┌───────────────┐     ┌─────────────────┐     ┌──────────────┐
│   User Login  │────▶│  Backend API    │────▶│  JWT Token   │
└───────────────┘     └─────────────────┘     └──────┬───────┘
                                                      │
                                                      ▼
┌───────────────────────────────────────────────────────────────┐
│                    Token Storage                               │
│         ┌─────────────────┬──────────────────┐                │
│         │   localStorage  │    Redux Store   │                │
│         │   (persistent)  │   (runtime)      │                │
│         └─────────────────┴──────────────────┘                │
└───────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌───────────────────────────────────────────────────────────────┐
│                axiosInstance Interceptor                       │
│          (Automatically adds token to requests)                │
└───────────────────────────────────────────────────────────────┘
```

## Routing Structure

Routes are defined in `App.jsx`:

| Route | Component | Access |
|-------|-----------|--------|
| `/` | HomePage | Public |
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/courses` | CourseList | Public |
| `/courses/:id` | CourseDetail | Public |
| `/profile` | Profile | Authenticated |
| `/admin` | AdminDashboard | Admin only |
| `/admin/users` | UsersDashboard | Admin only |
| `/admin/courses` | CoursesDashboard | Admin only |

### Route Protection

Protected routes use the following pattern:

```jsx
<Route 
  element={
    <RequireAuth allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminLayout />
    </RequireAuth>
  }
>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

## Data Flow

1. **User Action** → Component triggers Redux action
2. **Redux Thunk** → Async action calls API
3. **API Response** → Redux updates store
4. **Component Re-render** → useSelector triggers update

Example:
```jsx
// Component dispatches action
dispatch(getAllCourses());

// Slice handles async action
export const getAllCourses = createAsyncThunk(
  'course/getAll',
  async (_, { rejectWithValue }) => {
    const response = await axiosInstance.get('/courses');
    return response.data;
  }
);

// Component uses selector
const { courses, loading } = useSelector(state => state.course);
```

## Theme System

The app supports light and dark modes:

- Theme state managed in `Navbar.jsx`
- Stored in `localStorage` under key "theme"
- Applied via `dark` class on `<html>` element
- TailwindCSS handles dark mode variants (`dark:bg-gray-800`)

## Best Practices

1. **Component Organization**: Keep components small and focused
2. **State Management**: Use Redux for global state, local state for UI
3. **API Calls**: Always use `axiosInstance` for consistent error handling
4. **Styling**: Use TailwindCSS classes, avoid inline styles
5. **RTL Support**: Use RTL-aware properties (start/end instead of left/right)
