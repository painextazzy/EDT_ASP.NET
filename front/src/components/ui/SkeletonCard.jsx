// src/components/ui/SkeletonCard.jsx
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-6">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-6 w-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-5/6 animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-4/6 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
