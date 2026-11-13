import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { parentLogin, clearParentError } from "../../Redux/Slices/ParentSlice";
import { AiOutlinePhone } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import Layout from "../../Layout/Layout";

export default function ParentLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, isLoggedIn, error } = useSelector((state) => state.parent);

    const [loginData, setLoginData] = useState({
        fatherPhoneNumber: "",
        studentPhoneNumber: "",
    });

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/parent/statistics");
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearParentError());
        }
    }, [dispatch]);


    const handleUserInput = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value,
        });
    };

    const onSubmitInfo = async (event) => {
        event.preventDefault();

        if (!loginData.fatherPhoneNumber || !loginData.studentPhoneNumber) {
            // Handle client side validation
            return;
        }

        const res = await dispatch(parentLogin(loginData));
        if (res?.payload?.success) {
            navigate("/parent/statistics");
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 
            bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir="rtl">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl 
                shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] 
                dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)] border border-green-100 dark:border-green-900/30">

                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <FaUserCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            بوابة ولي الأمر
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            مرحباً بك، يمكنك متابعة مستوى ومعدل ابنك من هنا
                        </p>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={onSubmitInfo}>
                        <div className="space-y-4 rounded-md shadow-sm">
                            {/* Father Phone Number */}
                            <div className="relative">
                                <label htmlFor="fatherPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    رقم هاتف ولي الأمر
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <AiOutlinePhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="fatherPhoneNumber"
                                        name="fatherPhoneNumber"
                                        type="tel"
                                        required
                                        className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 
                                    pr-10 pl-3 py-3 text-gray-900 dark:text-white placeholder-gray-500 
                                    focus:border-green-500 hover:border-green-400 dark:focus:border-green-400 
                                    focus:ring-2 focus:ring-green-500/20 bg-gray-50 dark:bg-gray-700
                                    transition-all duration-200 outline-none sm:text-sm"
                                        placeholder="01XXXXXXXXX"
                                        value={loginData.fatherPhoneNumber}
                                        onChange={handleUserInput}
                                    />
                                </div>
                            </div>

                            {/* Student Phone Number */}
                            <div className="relative">
                                <label htmlFor="studentPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    رقم هاتف الطالب (للأمان)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <AiOutlinePhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="studentPhoneNumber"
                                        name="studentPhoneNumber"
                                        type="tel"
                                        required
                                        className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 
                                    pr-10 pl-3 py-3 text-gray-900 dark:text-white placeholder-gray-500 
                                    focus:border-green-500 hover:border-green-400 dark:focus:border-green-400 
                                    focus:ring-2 focus:ring-green-500/20 bg-gray-50 dark:bg-gray-700
                                    transition-all duration-200 outline-none sm:text-sm"
                                        placeholder="01XXXXXXXXX"
                                        value={loginData.studentPhoneNumber}
                                        onChange={handleUserInput}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || !loginData.fatherPhoneNumber || !loginData.studentPhoneNumber}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                            text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 
                            dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري الدخول...
                                    </span>
                                ) : (
                                    "دخول منصة ولي الأمر"
                                )}
                            </button>
                        </div>

                        {/* Back to student login */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                طالب؟{" "}
                                <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
                                    تسجيل الدخول كطالب
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
