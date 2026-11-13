import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { axiosInstance } from "../../Helpers/axiosInstance";
import {
    FaMoneyBillWave,
    FaShoppingCart,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaUser,
    FaCreditCard,
    FaFileInvoiceDollar
} from "react-icons/fa";

export default function AdminInvoicesDashboard() {
    const [activeTab, setActiveTab] = useState("recharges");
    const [loading, setLoading] = useState(false);

    // Recharges state
    const [recharges, setRecharges] = useState([]);
    const [rechargesPagination, setRechargesPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    // Purchases state
    const [purchases, setPurchases] = useState([]);
    const [purchasesPagination, setPurchasesPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

    // Filter state
    const [search, setSearch] = useState("");

    const fetchRecharges = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/wallet/admin/recharges?page=${page}&limit=${rechargesPagination.limit}&search=${search}`);
            if (response.data.success) {
                setRecharges(response.data.data.recharges);
                setRechargesPagination(response.data.data.pagination);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "فشل في جلب بيانات الشحن");
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchases = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/payments/admin/purchases?page=${page}&limit=${purchasesPagination.limit}&search=${search}`);
            if (response.data.success) {
                setPurchases(response.data.data.purchases);
                setPurchasesPagination(response.data.data.pagination);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "فشل في جلب بيانات المشتريات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "recharges") {
            fetchRecharges(1);
        } else {
            fetchPurchases(1);
        }
    }, [activeTab]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (activeTab === "recharges") {
            fetchRecharges(1);
        } else {
            fetchPurchases(1);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <FaFileInvoiceDollar className="text-green-600" />
                            سجل الفواتير والمعاملات
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            عرض ومتابعة عمليات شحن المحفظة وشراء الكورسات
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-reverse space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab("recharges")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "recharges"
                                ? "bg-green-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <FaCreditCard />
                            عمليات الشحن
                        </button>
                        <button
                            onClick={() => setActiveTab("purchases")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "purchases"
                                ? "bg-green-600 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <FaShoppingCart />
                            المشتريات
                        </button>
                    </div>

                    {/* Search Filter */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute right-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="بحث باسم الطالب، البريد الإلكتروني، أو رقم العملية..."
                                    className="w-full pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                بحث
                            </button>
                        </form>
                    </div>

                    {/* Content Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">رقم العملية</th>
                                            <th className="px-6 py-4">الطالب</th>
                                            {activeTab === 'purchases' && <th className="px-6 py-4">العملية</th>}
                                            <th className="px-6 py-4">المبلغ</th>
                                            <th className="px-6 py-4">التاريخ</th>
                                            <th className="px-6 py-4">طريقة الدفع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {(activeTab === "recharges" ? recharges : purchases).map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm">
                                                    {item.code || item.transactionId || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                                            <FaUser className="text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{item.userName || 'مستخدم غير معروف'}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.userEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {activeTab === 'purchases' && (
                                                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                                                        {item.courseTitle}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                                                    {item.amount} {item.currency || 'EGP'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        {formatDate(item.date || item.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                                        {item.paymentMethod || (activeTab === 'recharges' ? 'شحن محفظة' : 'شراء مباشر')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(activeTab === "recharges" ? recharges : purchases).length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                    لا توجد بيانات متاحة حالياً
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
                            {/* Simplified pagination for now */}
                            <button
                                disabled={(activeTab === 'recharges' ? rechargesPagination.page : purchasesPagination.page) <= 1}
                                onClick={() => activeTab === 'recharges' ? fetchRecharges(rechargesPagination.page - 1) : fetchPurchases(purchasesPagination.page - 1)}
                                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                السابق
                            </button>
                            <span className="px-4 py-2">
                                الصفحة {(activeTab === 'recharges' ? rechargesPagination.page : purchasesPagination.page)} من {(activeTab === 'recharges' ? rechargesPagination.pages : purchasesPagination.pages)}
                            </span>
                            <button
                                disabled={(activeTab === 'recharges' ? rechargesPagination.page : purchasesPagination.page) >= (activeTab === 'recharges' ? rechargesPagination.pages : purchasesPagination.pages)}
                                onClick={() => activeTab === 'recharges' ? fetchRecharges(rechargesPagination.page + 1) : fetchPurchases(purchasesPagination.page + 1)}
                                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
