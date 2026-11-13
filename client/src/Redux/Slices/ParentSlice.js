import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';
import toast from 'react-hot-toast';

const initialState = {
    isLoggedIn: false,
    parentToken: null,
    student: null,
    examStats: null,
    examHistory: [],
    videoStats: null,
    loading: false,
    error: null,
};

export const parentLogin = createAsyncThunk(
    'parent/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post('/parent/login', credentials);

            if (res.data.success) {
                toast.success(res.data.message || 'تم تسجيل الدخول بنجاح');
                return res.data;
            } else {
                return rejectWithValue(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'فشل في تسجيل الدخول');
            return rejectWithValue(error?.response?.data?.message || 'فشل في الطلب');
        }
    }
);

export const parentLogout = createAsyncThunk(
    'parent/logout',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get('/parent/logout');
            if (res.data.success) {
                toast.success(res.data.message || 'تم تسجيل الخروج');
                return res.data;
            } else {
                return rejectWithValue(res.data.message);
            }
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || 'فشل في تسجيل الخروج');
        }
    }
);

export const getParentStudentStats = createAsyncThunk(
    'parent/getStudentStats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get('/parent/student-stats');
            return res.data;
        } catch (error) {
            // Only show toast if it's an API error, no need to show for auth failures on mount
            const errorMessage = error?.response?.data?.message;
            if (error?.response?.status !== 401 && error?.response?.status !== 403) {
                toast.error(errorMessage || 'فشل في جلب الإحصائيات');
            }
            return rejectWithValue(errorMessage);
        }
    }
);

const parentSlice = createSlice({
    name: 'parent',
    initialState,
    reducers: {
        clearParentError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(parentLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(parentLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.parentToken = action.payload.token;
                state.student = action.payload.student;
            })
            .addCase(parentLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
            })
            // Logout
            .addCase(parentLogout.fulfilled, (state) => {
                return { ...initialState };
            })
            // Get Stats
            .addCase(getParentStudentStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getParentStudentStats.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.student = action.payload.data.student;
                state.examStats = action.payload.data.examStats;
                state.examHistory = action.payload.data.examHistory;
                state.videoStats = action.payload.data.videoStats;
            })
            .addCase(getParentStudentStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                if (action.payload === "يجب تسجيل الدخول كولي أمر" || action.payload === "الرمز غير صالح أو منتهي الصلاحية") {
                    state.isLoggedIn = false;
                    state.parentToken = null;
                }
            });
    }
});

export const { clearParentError } = parentSlice.actions;
export default parentSlice.reducer;
