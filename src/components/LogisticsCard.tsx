"use client";

import React, { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import axios from 'axios';

interface LogisticsCardProps {
  lat: number;
  lng: number;
  countryName: string;
}

export default function LogisticsCard({ lat, lng, countryName }: LogisticsCardProps) {
  // Use client fetch if we want to get specific postal code via reverse geocoding API,
  // but OpenMeteo/RESTCountries doesn't always give precise zip for a generic lat/long query easily without keys.
  // However, we can display coordinates immediately and fetch generic country info.
  // Or we can just display coordinates as "Instant" data.

  // Let's simulate a fetch or just use what we have to be safe and fast.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for UI consistency or fetch something extra
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
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
