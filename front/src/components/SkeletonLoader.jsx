// src/components/SkeletonLoader.jsx
// Composant réutilisable pour afficher des skeletons lors du chargement

import Skeleton from './ui/Skeleton';
import SkeletonTableRow from './ui/SkeletonTableRow';
import SkeletonCard from './ui/SkeletonCard';

export const TableSkeleton = ({ rows = 5, columns = 3 }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const CardGridSkeleton = ({ cards = 4, cols = 4 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${cols} gap-6`}>
    {Array.from({ length: cards }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const AvatarSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} type="avatar" className="bg-white rounded-xl shadow-md p-4" />
    ))}
  </div>
);

export default { Skeleton, SkeletonTableRow, SkeletonCard, TableSkeleton, CardGridSkeleton, AvatarSkeleton };
