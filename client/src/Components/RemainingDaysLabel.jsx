import React from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { calculateRemainingDays, formatRemainingDays, getRemainingDaysClass } from '../utils/dateUtils';

const RemainingDaysLabel = ({ accessEndAt, className = '', showExpiredMessage = false }) => {
  if (!accessEndAt) return null;

  const remainingDays = calculateRemainingDays(accessEndAt);
  const formattedText = formatRemainingDays(remainingDays);
  const cssClass = getRemainingDaysClass(remainingDays);

  if (remainingDays === null) return null;

  // If access has expired and we should show expired message
  if (remainingDays < 0 && showExpiredMessage) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 ${className}`}>
        <FaExclamationTriangle className="text-green-600" />
        <span>انتهت صلاحية الوصول - يرجى إدخال كود جديد</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${cssClass} ${className}`}>
      {remainingDays < 0 ? (
        <FaExclamationTriangle className="text-green-600" />
      ) : (
        <FaClock className="text-current" />
      )}
      <span>{formattedText}</span>
    </div>
  );
};

export default RemainingDaysLabel;
