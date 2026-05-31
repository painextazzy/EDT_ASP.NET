// src/components/ui/Skeleton.jsx
const Skeleton = ({ className = '', lines = 3, type = 'text' }) => {
  if (type === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-2/3 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-5/6 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="h-12 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-1/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md animate-pulse ${
            i === lines - 1 ? 'w-5/6' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

export default Skeleton;
