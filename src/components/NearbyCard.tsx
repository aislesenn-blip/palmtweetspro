"use client";

import React from 'react';
import { MapPin } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { Place } from '@/lib/db';

interface NearbyCardProps {
  data?: Place[] | null;
  loading?: boolean;
}

export default function NearbyCard({ data, loading }: NearbyCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-teal-500" />
        <h3 className="font-medium text-gray-500">Nearby</h3>
      </div>
      <div className="mt-4 space-y-2">
        {data && data.length > 0 ? (
          data.map((place) => (
            <div key={place.slug} className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">{place.name}</span>
              <span className="text-gray-500">{place.country}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No nearby places found.</p>
        )}
      </div>
    </div>
  );
}
