"use client";

import React, { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface LogisticsCardProps {
  lat: number;
  lng: number;
  countryName: string;
}

export default function LogisticsCard({ lat, lng, countryName }: LogisticsCardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to ensure skeleton is seen and consistent with other cards
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  // Safe display values
  const latDisplay = lat?.toFixed(2) ?? '0.00';
  const lngDisplay = lng?.toFixed(2) ?? '0.00';

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-green-500" />
        <h3 className="font-medium text-gray-500">Logistics</h3>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">
           {latDisplay}, {lngDisplay}
        </div>
        <p className="text-gray-500">Coordinates</p>
      </div>
    </div>
  );
}
