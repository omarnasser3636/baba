# 🔄 Redux State Management

This document explains how Redux Toolkit is used for state management in the application.

## Store Configuration

The Redux store is configured in `Redux/store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/AuthSlice';
import courseReducer from './Slices/CourseSlice';
// ... other reducers

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    // ... other reducers
  },
});
```

## Available Slices

### Authentication (`AuthSlice.js`)

Manages user authentication state.

**State:**
```javascript
{
  isLoggedIn: boolean,
  role: string,
  data: object,  // User data
  loading: boolean,
  error: string | null
}
```

**Actions:**
| Action | Description |
|--------|-------------|
| `login` | Authenticate user |
| `logout` | Clear session |
| `signup` | Register new user |
| `getUserData` | Fetch current user |
| `updateProfile` | Update user profile |

**Usage:**
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../Redux/Slices/AuthSlice';

// In component
const { isLoggedIn, data: user, role } = useSelector(state => state.auth);
const dispatch = useDispatch();

// Login
dispatch(login({ email, password }));

// Logout
dispatch(logout());
```

---

### Courses (`CourseSlice.js`)

Manages course data.

**State:**
```javascript
{
  courses: array,
  selectedCourse: object | null,
  loading: boolean,
  error: string | null
}
```

**Actions:**
| Action | Description |
|--------|-------------|
| `getAllCourses` | Fetch all courses |
| `getCourseById` | Fetch single course |
| `createCourse` | Create new course |
| `updateCourse` | Update course |
| `deleteCourse` | Delete course |

---

### Admin Users (`AdminUserSlice.js`)

Manages users for admin dashboard.

**State:**
```javascript
{
  users: array,
  selectedUser: object | null,
  pagination: object,
  loading: boolean,
  error: string | null
}
```

**Actions:**
| Action | Description |
|--------|-------------|
| `getAllUsers` | Fetch paginated users |
| `getUserById` | Fetch single user |
| `createUser` | Create new user |
| `updateUser` | Update user |
| `deleteUser` | Delete user |
| `toggleUserStatus` | Activate/deactivate user |

---

### Groups (`GroupsSlice.js`)

Manages student groups.

**State:**
```javascript
{
  groups: array,
  selectedGroup: object | null,
  loading: boolean
}
```

---

### Attendance (`AttendanceSlice.js`)

Manages attendance records.

---

### Live Meetings (`LiveMeetingSlice.js`)

Manages online class sessions.

---

### Financial (`FinancialSlice.js`)

Manages financial transactions.

---

### Video Progress (`VideoProgressSlice.js`)

Tracks user video watching progress.

---

### Wallet (`WalletSlice.js`)

Manages user wallet and recharge.

---

## Creating a New Slice

Template for creating a new slice:

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Initial state
const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchItems = createAsyncThunk(
  'feature/fetchItems',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/items', { params });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createItem = createAsyncThunk(
  'feature/createItem',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/items', data);
      toast.success('Created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Slice
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      // Create item
      .addCase(createItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.data);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearSelectedItem, clearError } = featureSlice.actions;
export default featureSlice.reducer;
```

## Best Practices

1. **Use createAsyncThunk** for all API calls
2. **Handle loading states** in components with proper UI feedback
3. **Show toast notifications** for user feedback on success/error
4. **Normalize data** when dealing with complex nested structures
5. **Keep slices focused** - one slice per feature domain
6. **Use selectors** for complex state selection
7. **Don't mutate state directly** - Redux Toolkit handles immutability

## Common Patterns

### Loading State
```jsx
const { loading, data, error } = useSelector(state => state.feature);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
return <DataDisplay data={data} />;
```

### Refetching Data
```jsx
useEffect(() => {
  dispatch(fetchItems());
}, [dispatch]);
```

### Optimistic Updates
```jsx
// Update local state immediately, then sync with server
const handleToggle = async (id) => {
  dispatch(toggleItem(id)); // Optimistic update
  try {
    await axiosInstance.put(`/api/items/${id}/toggle`);
  } catch (error) {
    dispatch(fetchItems()); // Revert on error
  }
};
```
