import React from 'react';

export default function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-3xl ${className || 'h-full w-full'}`}></div>
  );
}
