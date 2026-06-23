// src/components/calendar/SkeletonLoader.jsx
import React from 'react';

// ✅ Export nommé pour CardGridSkeleton si nécessaire
export const CardGridSkeleton = ({ cards = 4, cols = 4 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${Math.min(cols, 4)} gap-6`}>
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-32 bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Composant principal du skeleton
const SkeletonLoader = () => {
  // Générer des positions aléatoires pour les événements skeleton
  const generateRandomTop = () => 60 + Math.random() * 400;
  const generateRandomHeight = () => 60 + Math.random() * 120;

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-[70px]">
              <div className="h-6 w-full bg-gray-200 animate-pulse"></div>
              <div className="h-10 w-12 bg-gray-200 m-1 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-gray-200 bg-gray-50/30">
          <div className="py-3"></div>
          {[1, 2, 3, 4, 5].map((_, idx) => (
            <div key={idx} className="py-3 text-center">
              <div className="h-4 w-10 mx-auto bg-gray-200 rounded animate-pulse"></div>
              <div className="h-7 w-8 mx-auto mt-1 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto relative">
          <div className="relative min-h-[720px]">
            <div className="absolute inset-0 grid grid-cols-[80px_repeat(5,1fr)]">
              <div className="border-r border-gray-100 bg-white z-10"></div>
              {[1, 2, 3, 4, 5].map((_, idx) => (
                <div key={idx} className="border-r border-gray-100"></div>
              ))}
            </div>

            <div className="absolute inset-0 pointer-events-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, i) => (
                <div 
                  key={i} 
                  className="border-b border-dashed border-gray-200" 
                  style={{ top: `${i * 60}px`, position: 'absolute', left: 0, right: 0 }} 
                />
              ))}
            </div>

            <div className="absolute left-0 top-0 w-20 flex flex-col z-20 pointer-events-none">
              {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((hour, idx) => (
                <div key={idx} className="h-[60px] flex justify-center items-start pt-2">
                  <span className="text-[11px] text-gray-300 font-medium">{hour}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[80px_repeat(5,1fr)] h-full relative z-10">
              <div className="col-start-1"></div>
              {[1, 2, 3, 4, 5].map((_, dayIdx) => (
                <div key={dayIdx} className="relative min-h-[720px]">
                  {[1, 2].map((_, eventIdx) => {
                    const top = generateRandomTop();
                    const height = generateRandomHeight();
                    return (
                      <div
                        key={eventIdx}
                        className="absolute left-1 right-1 rounded-xl p-2.5"
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          minHeight: '55px',
                        }}
                      >
                        <div className="w-full h-full bg-gray-200 rounded-xl animate-pulse">
                          <div className="flex flex-col h-full p-2">
                            <div className="flex justify-between items-start">
                              <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
                              <div className="h-2 w-12 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                            <div className="h-3 w-20 bg-gray-300 rounded mt-1 animate-pulse"></div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-5 h-5 rounded-full bg-gray-300 animate-pulse"></div>
                              <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                              <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-2 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="fixed bottom-8 right-8 w-14 h-14 bg-gray-200 rounded-full shadow-lg animate-pulse"></div>
      <div className="fixed bottom-8 right-28 w-14 h-14 bg-gray-200 rounded-full shadow-lg animate-pulse"></div>
    </div>
  );
};

// ✅ Export par défaut avec le bon nom
export default SkeletonLoader;