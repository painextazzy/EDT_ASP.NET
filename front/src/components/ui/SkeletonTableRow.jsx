// src/components/ui/SkeletonTableRow.jsx
const SkeletonTableRow = ({ columns = 3 }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-6">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md animate-pulse w-full"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonTableRow;
