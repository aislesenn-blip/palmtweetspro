"use client";

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

export default function MapCard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
     return <SkeletonLoader className="h-96 w-full" />;
  }

  return (
    <div className="h-96 w-full overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md relative">
       <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 flex flex-col items-center">
             <MapPin className="h-12 w-12 mb-2" />
             Map Placeholder
          </span>
       </div>
    </div>
  );
}
