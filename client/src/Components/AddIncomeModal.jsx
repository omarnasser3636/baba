import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaTimes, FaUser, FaUsers, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { getAllGroups, getInstructors } from '../Redux/Slices/GroupsSlice';
import { getAllUsers } from '../Redux/Slices/UsersSlice';
import { axiosInstance } from '../Helpers/axiosInstance';

const AddIncomeModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const { groups: groupsData, instructors: instructorsData, loading: groupsLoading } = useSelector((state) => state.groups);
  const { users: usersData, loading: usersLoading } = useSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userPaymentStatus, setUserPaymentStatus] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Toast functions
  const showSuccessToast = (message) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const showErrorToast = (message) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getAllGroups());
      dispatch(getAllUsers({ role: 'USER' }));
    }
  }, [isOpen, dispatch]);

  // Check payment status for users when group is selected
  useEffect(() => {
    if (selectedGroup && usersData && usersData.length > 0) {
      checkUserPaymentStatus();
    }
  }, [selectedGroup, usersData]);

  // Debug group data
  useEffect(() => {
    if (selectedGroup && groupsData) {

      const foundGroup = groupsData.find(g => (g._id || g.id) === selectedGroup);

    }
  }, [selectedGroup, groupsData]);

  const checkUserPaymentStatus = async () => {
    if (!selectedGroup) return;
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const response = await axiosInstance.get(
        `/financial/group/${selectedGroup}/payment-status?month=${currentMonth}&year=${currentYear}`
      );
      
      if (response.data.success) {
        const paymentStatus = response.data.data.paymentStatus;

        const statusMap = {};
        
        paymentStatus.forEach(status => {

          statusMap[status.student._id] = {
            hasPaid: status.hasPaid,
            totalPaid: status.totalPaid,
            remainingAmount: status.remainingAmount,
            paymentDate: status.paymentDate,
            amount: status.amount,
            status: status.status,
            paymentCount: status.paymentCount
          };
        });

        setUserPaymentStatus(statusMap);
      }
    } catch (error) {
    }
  };

  // Filter users based on search and group selection
  useEffect(() => {
    if (!usersData || !groupsData) return;

    let filtered = usersData;

    // Filter by group if selected
    if (selectedGroup) {
      // Find the selected group to get its students array
      const selectedGroupData = groupsData.find(group => 
        (group._id || group.id) === selectedGroup
      );

      if (selectedGroupData && selectedGroupData.students) {
        // Get the IDs of students in this group
        const studentIds = selectedGroupData.students.map(student => 
          student._id || student.id || student
        );
        
        // Filter users to only include those who are in this group
        filtered = filtered.filter(user => 
          studentIds.includes(user._id || user.id)
        );
      } else {
        // If no group data or no students, show no users
        filtered = [];
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedGroup, usersData, groupsData]);

  // Auto-fill amount when group is selected
  useEffect(() => {
    if (selectedGroup && groupsData) {
      const selectedGroupData = groupsData.find(group => 
        (group._id || group.id) === selectedGroup
      );
      
      if (selectedGroupData && selectedGroupData.price) {
        setAmount(selectedGroupData.price.toString());
      }
    } else {
      // Clear amount when no group is selected
      setAmount('');
    }
  }, [selectedGroup, groupsData]);

  // Update amount when user is selected to show remaining amount
  useEffect(() => {
    if (selectedUser && selectedGroup && userPaymentStatus[selectedUser._id]) {
      const paymentInfo = userPaymentStatus[selectedUser._id];
      const remainingAmount = paymentInfo.remainingAmount || 0;
      
      if (remainingAmount > 0) {
        setAmount(remainingAmount.toString());
      } else {
        // If fully paid, show group price for additional payment
        const selectedGroupData = groupsData?.find(g => (g._id || g.id) === selectedGroup);
        setAmount(selectedGroupData?.price?.toString() || '');
      }
    }
  }, [selectedUser, selectedGroup, userPaymentStatus, groupsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !amount) {
      alert('يرجى اختيار طالب وإدخال المبلغ');
      return;
    }

    setLoading(true);
    
    try {
      const incomeData = {
        userId: selectedUser._id || selectedUser.id,
        groupId: selectedGroup,
        amount: parseFloat(amount),
        description,
        category: 'group_fees',
        transactionDate: paymentDate,
        paymentMethod: 'cash',
        notes: ''
      };

      // Make API call to save the income
      const response = await axiosInstance.post('/financial/income', incomeData);

      if (response.data.success) {
        const savedIncome = response.data.data;

        const incomeInfo = {
          userId: savedIncome.userId?._id || savedIncome.userId,
          userName: savedIncome.userId?.fullName || 'غير محدد',
          groupId: savedIncome.groupId?._id || savedIncome.groupId,
          groupName: savedIncome.groupId?.name || 'غير محدد',
          amount: savedIncome.amount,
          description: savedIncome.description,
          paymentDate: savedIncome.transactionDate,
          type: 'income'
        };

        // Show success message
        // Show success toast
        showSuccessToast(`تم إضافة الإيراد بنجاح: ${incomeInfo.amount} جنيه من ${incomeInfo.userName}`);
        
        onSubmit(incomeInfo);
        handleClose();
      } else {
        throw new Error(response.data.message || 'فشل في إضافة الإيراد');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء إضافة الإيراد';
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedGroup('');
    setSelectedUser(null);
    setAmount('');
    setDescription('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setUserPaymentStatus({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3 space-x-reverse">
            <FaMoneyBillWave className="text-2xl text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              إضافة إيراد جديد
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - User Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                اختيار الطالب
              </h3>

              {/* Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تصفية حسب المجموعة
                </label>
                                 <select
                   value={selectedGroup}
                   onChange={(e) => setSelectedGroup(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                   disabled={groupsLoading}
                 >
                   <option value="">جميع المجموعات</option>
                   {groupsData && groupsData.map(group => {
                     // Handle instructor display - it might be an object or string
                     let instructorName = 'غير محدد';
                     if (group.instructor) {
                       if (typeof group.instructor === 'string') {
                         instructorName = group.instructor;
                       } else if (group.instructor.name) {
                         instructorName = group.instructor.name;
                       }
                     } else if (group.instructorId && group.instructorId.name) {
                       instructorName = group.instructorId.name;
                     }
                     
                     return (
                       <option key={group._id || group.id} value={group._id || group.id}>
                         {group.name} - {instructorName}
                       </option>
                     );
                   })}
                 </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البحث عن الطالب
                </label>
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Users List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    الطلاب المتاحون ({filteredUsers.length})
                  </label>
                  {selectedGroup && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      دفعات شهر {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                                 <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                   {usersLoading ? (
                     <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                       جاري تحميل الطلاب...
                     </div>
                   ) : filteredUsers.length === 0 ? (
                     <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                       لا توجد نتائج
                     </div>
                   ) : (
                     filteredUsers.map(user => {
                       const hasPaid = userPaymentStatus[user._id]?.hasPaid;
                       
                       return (
                         <div
                           key={user._id || user.id}
                           onClick={() => setSelectedUser(user)}
                           className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                             (selectedUser?._id || selectedUser?.id) === (user._id || user.id) ? 'bg-red-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
                           }`}
                         >
                         <div className="flex items-center space-x-3 space-x-reverse">
                           <div className={`p-2 rounded-full ${
                             (selectedUser?._id || selectedUser?.id) === (user._id || user.id)
                               ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                               : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                           }`}>
                             <FaUser className="text-sm" />
                           </div>
                           <div className="flex-1">
                             <h4 className="font-medium text-gray-900 dark:text-white">
                               {user.fullName || user.name}
                             </h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400">
                               {user.email}
                             </p>
                             <p className="text-sm text-gray-500 dark:text-gray-500">
                               {user.phoneNumber || user.phone || 'لا يوجد رقم هاتف'}
                               {selectedGroup && groupsData && (
                                 <span> • {groupsData.find(g => (g._id || g.id) === selectedGroup)?.name || 'غير محدد'}</span>
                               )}
                             </p>
                             {selectedGroup && (
                               <div className="mt-1">
                                 {(() => {
                                   const foundGroup = groupsData?.find(g => (g._id || g.id) === selectedGroup);
                                   const groupPrice = foundGroup?.price || 0;
                                   const paymentInfo = userPaymentStatus[user._id];

                                   if (paymentInfo && paymentInfo.totalPaid > 0) {
                                     const totalPaid = paymentInfo.totalPaid;
                                     const remainingAmount = groupPrice - totalPaid;
                                     
                                     if (totalPaid >= groupPrice) {
                                       return (
                                         <div className="flex flex-col gap-1">
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                             ✓ مدفوع هذا الشهر - {totalPaid} جنيه
                                           </span>
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                             ⚠️ يمكن إضافة دفعة إضافية
                                           </span>
                                         </div>
                                       );
                                     } else if (totalPaid > 0) {
                                       return (
                                         <div className="flex flex-col gap-1">
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                             💰 مدفوع جزئياً هذا الشهر - {totalPaid} جنيه
                                           </span>
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                             📝 المتبقي - {remainingAmount} جنيه
                                           </span>
                                         </div>
                                       );
                                     } else {
                                       return (
                                         <div className="flex flex-col gap-1">
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                             💰 مدفوع جزئياً هذا الشهر - {totalPaid} جنيه
                                           </span>
                                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                             📝 المتبقي - {remainingAmount} جنيه
                                           </span>
                                         </div>
                                       );
                                     }
                                   } else {
                                     // No payment info or totalPaid is 0
                                     return (
                                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                         💰 لم يدفع هذا الشهر - {groupPrice} جنيه
                                       </span>
                                     );
                                   }
                                 })()}
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                       );
                     })
                   )}
                 </div>
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                تفاصيل الدفع
              </h3>

              {/* Selected User Display */}
              {selectedUser && (
                <div className="bg-red-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <FaUsers className="text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        الطالب المحدد
                      </h4>
                                             <p className="text-sm text-green-700 dark:text-green-300">
                         {selectedUser.fullName || selectedUser.name}
                         {selectedGroup && groupsData && (
                           <span> - {groupsData.find(g => (g._id || g.id) === selectedGroup)?.name || 'غير محدد'}</span>
                         )}
                       </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المبلغ (جنيه) *
                  {selectedGroup && groupsData && (
                    <span className="text-xs text-green-600 dark:text-green-400 mr-2">
                      (تم ملؤه تلقائياً من سعر المجموعة)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {selectedGroup && groupsData && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    يمكنك تعديل المبلغ حسب الحاجة
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف الدفع
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: رسوم دورة البرمجة - شهر يناير"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ الدفع
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 space-x-reverse mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUser || !amount}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <FaMoneyBillWave />
                  <span>إضافة الإيراد</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="fixed top-4 right-4 z-50"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className={`flex items-center p-4 rounded-lg shadow-lg max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="mr-3 flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: '', type: toast.type })}
              className="flex-shrink-0 mr-2 text-white hover:text-gray-200 focus:outline-none focus:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AddIncomeModal;
