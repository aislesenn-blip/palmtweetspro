"use client";

import React from 'react';
import { Truck } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface LogisticsCardProps {
  lat: number;
  lng: number;
  loading?: boolean;
}

export default function LogisticsCard({ lat, lng, loading }: LogisticsCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-green-500" />
        <h3 className="font-medium text-gray-500">Logistics</h3>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">
           {lat.toFixed(2)}, {lng.toFixed(2)}
        </div>
        <p className="text-gray-500">Coordinates</p>
      </div>
    </div>
  );
}
