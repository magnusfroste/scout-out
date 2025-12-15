import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      {/* Stepper skeleton */}
      <div className="mb-6">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <Skeleton className="h-2 w-full rounded-full mb-6" />
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <Skeleton className="h-3 w-16 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
