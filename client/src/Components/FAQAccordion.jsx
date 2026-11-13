import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqData = [
  {
    id: 1,
    question: "كيف أبدأ مع الدورات؟",
    answer: "البدء سهل! ما عليك سوى إنشاء حساب، تصفح كتالوج الدورات لدينا، وسجل في الدورات التي تهمك. يمكنك البدء في التعلم فوراً بعد التسجيل. جميع الدورات ذاتية السرعة، لذا يمكنك التعلم بالسرعة التي تناسبك."
  },
  {
    id: 2,
    question: "ما هي طرق الدفع التي تقبلونها؟",
    answer: "نحن نقبل Instapay transfer وVodafone Cash كطرق دفع رئيسية. كما نقبل جميع بطاقات الائتمان الرئيسية وبطاقات الخصم. جميع المدفوعات تتم معالجتها بأمان من خلال شركائنا الموثوقين في الدفع. كما نقدم خطط تقسيط لبعض الدورات."
  },
  {
    id: 3,
    question: "هل يمكنني الوصول الكورسات  بدون إنترنت؟",
    answer: "حالياً، دوراتنا متاحة عبر الإنترنت فقط للحصول على أفضل تجربة تعليمية. ومع ذلك، يمكنك تحميل المواد التعليمية والملفات PDF والموارد للاستخدام بدون إنترنت. نحن نعمل على تحميل الفيديوهات بدون إنترنت للأعضاء المميزين."
  },
  {
    id: 6,
    question: "كيف أحصل على المساعدة إذا واجهت مشاكل تقنية؟",
    answer: "فريق الدعم لدينا متاح على مدار الساعة طوال أيام الأسبوع لمساعدتك في أي مشاكل تقنية. يمكنك الوصول إلينا من خلال الدردشة المباشرة أو البريد الإلكتروني أو منتدى المجتمع. كما لدينا مركز مساعدة شامل مع دروس تعليمية وأدلة."
  },
  {
    id: 8,
    question: "هل يمكنني التفاعل مع المدربين والطلاب الآخرين؟",
    answer: "نعم! منصتنا تتضمن منتديات مناقشة وجلسات أسئلة وأجوبة مباشرة ورسائل مباشرة مع المدربين. يمكنك أيضاً الانضمام إلى مجموعات الدراسة والمشاركة في تحديات المجتمع لتعزيز تجربة التعلم الخاصة بك."
  }
];

const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => onToggle(item.id)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white pr-4">
          {item.question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <FaChevronUp className="w-5 h-5 text-green-600 dark:text-green-400 transition-transform duration-200" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200" />
          )}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.answer}
            </p>
            {isOpen && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>إجابة مفيدة</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = () => {
  const [openItems, setOpenItems] = useState(new Set([1])); // First item open by default
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (itemId) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const toggleShowAll = () => {
    if (showAll) {
      setOpenItems(new Set([1])); // Keep only first item open
    } else {
      setOpenItems(new Set(faqData.map(item => item.id))); // Open all items
    }
    setShowAll(!showAll);
  };

  // Filter FAQ items based on search term
  const filteredItems = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="البحث في الأسئلة الشائعة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredItems.length} نتيجة
            </span>
          </div>
        )}
      </div>

      {displayedItems.length > 0 ? (
        <>
          {displayedItems.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openItems.has(item.id)}
              onToggle={toggleItem}
            />
          ))}
          
          {filteredItems.length > 4 && (
            <div className="text-center pt-4">
              <button
                onClick={toggleShowAll}
                className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors duration-200"
              >
                {showAll ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    عرض أقل
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    عرض جميع الأسئلة
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            لم يتم العثور على أسئلة
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            حاول تعديل مصطلحات البحث أو تصفح جميع الأسئلة أدناه.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
          >
            مسح البحث
          </button>
        </div>
      )}
    </div>
  );
};

export default FAQAccordion; 