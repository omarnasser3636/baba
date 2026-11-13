import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllInstructors, 
  createInstructor, 
  updateInstructor, 
  deleteInstructor,
  getInstructorStats
} from '../../Redux/Slices/InstructorSlice';

import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaStar, 
  FaUsers, 
  FaGraduationCap,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaSearch,
  FaFilter,
  FaTimes,
  FaUpload,
  FaCheck,
  FaTimes as FaClose
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Layout from '../../Layout/Layout';
import { generateImageUrl } from "../../utils/fileUtils";

const InstructorDashboard = () => {
  const dispatch = useDispatch();
  const { instructors, loading, pagination } = useSelector((state) => state.instructor);

  const { role } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    specialization: '',
    experience: '',
    education: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      whatsapp: ''
    },
    featured: false,
    photo: null
  });

  useEffect(() => {
    dispatch(getAllInstructors({ page: 1, limit: 50 }));

  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let instructorData = formData;
      
      // If there's a photo file, create FormData
      if (formData.photo) {
        const formDataToSend = new FormData();
        formDataToSend.append('profileImage', formData.photo);
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('bio', formData.bio);
        formDataToSend.append('specialization', formData.specialization);
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('education', formData.education);
        formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
        formDataToSend.append('featured', formData.featured);
        
        instructorData = formDataToSend;
      }
      
      if (editingInstructor) {
        await dispatch(updateInstructor({ 
          id: editingInstructor._id, 
          instructorData: instructorData 
        })).unwrap();
        toast.success('تم تحديث المدرس بنجاح');
      } else {
        await dispatch(createInstructor(instructorData)).unwrap();
        toast.success('تم إنشاء المدرس بنجاح');
      }
      
      setShowModal(false);
      setEditingInstructor(null);
      resetForm();
    } catch (error) {
    }
  };

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      bio: instructor.bio,
      specialization: instructor.specialization,
      experience: instructor.experience,
      education: instructor.education,
      socialLinks: instructor.socialLinks || {
        linkedin: '',
        twitter: '',
        facebook: '',
        whatsapp: ''
      },
      featured: instructor.featured
    });
    setShowModal(true);
  };

  const handleDelete = async (instructorId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المدرس؟')) {
      try {
        await dispatch(deleteInstructor(instructorId)).unwrap();
        toast.success('تم حذف المدرس بنجاح');
      } catch (error) {
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      bio: '',
      specialization: '',
      experience: '',
      education: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        facebook: '',
        whatsapp: ''
      },
      featured: false,
      photo: null
    });
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterFeatured === '' || 
                         (filterFeatured === 'true' && instructor.featured) ||
                         (filterFeatured === 'false' && !instructor.featured);
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`text-sm ${i <= rating ? 'text-green-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-indigo-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            غير مصرح لك بالوصول إلى هذه الصفحة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            يجب أن تكون مدير للوصول إلى لوحة تحكم المدرسين
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-indigo-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              إدارة المدرسين
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة مدرسين المنصة وإعداداتهم
            </p>
          </div>
          <button
            onClick={() => {
              setEditingInstructor(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <FaPlus />
            إضافة مدرس جديد
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في المدرسين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">جميع المدرسين</option>
                <option value="true">المدرسين المميزين</option>
                <option value="false">المدرسين العاديين</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Instructor Header */}
              <div className="relative p-6 bg-gradient-to-r from-green-500 to-green-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {instructor.profileImage?.secure_url ? (
                      <img
                        src={generateImageUrl(instructor.profileImage.secure_url)}
                        alt={instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FaGraduationCap className="text-white text-xl" />
                      </div>
                    )}
                    <div className="mr-3">
                      <h3 className="text-white font-semibold text-right">{instructor.name}</h3>
                      <p className="text-white/80 text-sm text-right">{instructor.specialization}</p>
                    </div>
                  </div>
                  {instructor.featured && (
                    <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-semibold">
                      مميز
                    </span>
                  )}
                </div>
              </div>

              {/* Instructor Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {renderStars(instructor.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                      ({instructor.rating})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {instructor.experience} سنة خبرة
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 text-right">
                  {instructor.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaUsers className="ml-1" />
                    <span>{instructor.totalStudents} طالب</span>
                  </div>
                  
                </div>

                {/* Social Links */}
                {(instructor.socialLinks?.linkedin || instructor.socialLinks?.twitter || instructor.socialLinks?.website) && (
                  <div className="flex items-center justify-center space-x-4 space-x-reverse mb-4">
                    {instructor.socialLinks?.linkedin && (
                      <a
                        href={instructor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        <FaLinkedin />
                      </a>
                    )}
                    {instructor.socialLinks?.twitter && (
                      <a
                        href={instructor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-500 transition-colors"
                      >
                        <FaTwitter />
                      </a>
                    )}
                                         {instructor.socialLinks?.facebook && (
                       <a
                         href={instructor.socialLinks.facebook}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-green-600 hover:text-green-700 transition-colors"
                       >
                         <FaFacebook />
                       </a>
                     )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(instructor)}
                      className="p-2 text-green-600 hover:bg-red-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <FaEdit />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(instructor._id)}
                      className="p-2 text-green-600 hover:bg-red-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {filteredInstructors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              لا توجد مدرسين
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              ابدأ بإضافة مدرسين جدد للمنصة
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingInstructor ? 'تعديل المدرس' : 'إضافة مدرس جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingInstructor(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                      required
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                    صورة الملف الشخصي
                  </label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {/* Current Photo Preview */}
                    {editingInstructor && editingInstructor.profileImage?.secure_url && !formData.photo && (
                      <div className="relative">
                        <img
                          src={generateImageUrl(editingInstructor.profileImage.secure_url)}
                          alt={editingInstructor.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center hidden">
                          <FaGraduationCap className="text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* New Photo Preview */}
                    {formData.photo && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(formData.photo)}
                          alt="New photo"
                          className="w-16 h-16 rounded-full object-cover border-2 border-green-300"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: null })}
                          className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-green-600"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                    
                    {/* File Input */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, photo: file });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {editingInstructor ? 'اختر صورة جديدة لتحديث الصورة الحالية' : 'اختر صورة للملف الشخصي'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                    التخصص
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                      سنوات الخبرة
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                      المؤهل العلمي
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                    السيرة الذاتية
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                  />
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
                    روابط التواصل الاجتماعي
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      placeholder="LinkedIn"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                    />
                    <input
                      type="url"
                      placeholder="Twitter"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                    />
                                         <input
                       type="url"
                       placeholder="Facebook"
                       value={formData.socialLinks.facebook}
                       onChange={(e) => setFormData({
                         ...formData,
                         socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                       })}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                     />
                    <input
                      type="text"
                      placeholder="WhatsApp (e.g., +201234567890)"
                      value={formData.socialLinks.whatsapp}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="featured" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    مدرس مميز
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingInstructor(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {editingInstructor ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      </div>
    </Layout>
  );
};

export default InstructorDashboard; 