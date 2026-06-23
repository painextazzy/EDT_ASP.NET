// src/components/DashboardSkeleton.jsx
import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="bg-[#F8F9FE] min-h-screen p-8 lg:p-10 pt-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Skeleton KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-6 flex flex-col items-center border border-slate-100 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20 mb-4"></div>
            <div className="relative w-28 h-28 mb-4">
              <div className="w-full h-full rounded-full border-8 border-slate-200"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-12 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Minor KPIs + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-3 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 flex items-center justify-between border border-slate-100 shadow-sm animate-pulse">
              <div>
                <div className="h-3 w-16 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 w-12 bg-slate-200 rounded"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-9 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="h-6 w-48 bg-slate-200 rounded"></div>
            <div className="h-8 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="relative h-64">
            <div className="absolute inset-0 flex">
              <div className="flex flex-col justify-between pr-4 pb-8">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-3 w-8 bg-slate-200 rounded"></div>
                ))}
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between pb-8">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="border-b border-slate-100 w-full h-0"></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((j) => (
                    <div key={j} className="w-6 bg-slate-200 rounded-t h-[40%]"></div>
                  ))}
                </div>
                <div className="absolute bottom-0 w-full flex justify-between px-2 pt-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((j) => (
                    <div key={j} className="h-3 w-6 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Distribution + Top Salles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center border border-slate-100 shadow-sm animate-pulse">
          <div className="w-full flex justify-between items-center mb-8">
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
            <div className="h-5 w-5 bg-slate-200 rounded"></div>
          </div>
          <div className="relative w-48 h-48 mb-8">
            <div className="w-full h-full rounded-full border-8 border-slate-200"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-8 w-16 bg-slate-200 rounded mb-1"></div>
              <div className="h-3 w-12 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="w-full grid grid-cols-3 gap-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-slate-200 mb-1"></div>
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded mb-8"></div>
          <div className="space-y-8">
            {[1, 2, 3].map((j) => (
              <div key={j}>
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-4 w-12 bg-slate-200 rounded"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 rounded-full" style={{ width: `${60 + j * 15}%` }}></div>
                </div>
                <div className="h-3 w-20 bg-slate-200 rounded mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;