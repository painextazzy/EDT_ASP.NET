// src/components/ui/SalleCardSkeleton.jsx
import React from 'react';

const SalleCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
    <div className="h-1 bg-gray-200" />
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-3 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mb-2" />
          <div className="h-7 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

export default SalleCardSkeleton;