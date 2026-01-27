"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import SunCalc from 'suncalc';

interface AstronomyCardProps {
  lat: number;
  lng: number;
  loading?: boolean;
}

export default function AstronomyCard({ lat, lng, loading }: AstronomyCardProps) {
  const [times, setTimes] = useState<any>(null);
  const [moon, setMoon] = useState<any>(null);

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
       const now = new Date();
       const t = SunCalc.getTimes(now, lat, lng);
       const m = SunCalc.getMoonIllumination(now);
       setTimes(t);
       setMoon(m);
    }
  }, [lat, lng]);

  if (loading || !times) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Moon className="h-5 w-5 text-indigo-900" />
        <h3 className="font-medium text-gray-500">Astronomy</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center mb-6">
         <div className="bg-orange-50 p-3 rounded-2xl">
            <Sun className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Sunrise</p>
            <p className="text-lg font-bold text-gray-900">{formatTime(times.sunrise)}</p>
         </div>
         <div className="bg-indigo-50 p-3 rounded-2xl">
            <Moon className="h-6 w-6 text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Sunset</p>
            <p className="text-lg font-bold text-gray-900">{formatTime(times.sunset)}</p>
         </div>
      </div>

      <div className="bg-gray-900 text-white p-4 rounded-xl flex justify-between items-center">
         <div>
            <p className="text-xs text-gray-400 uppercase">Moon Phase</p>
            <p className="font-medium">
               {(moon.phase * 100).toFixed(0)}% Illumination
            </p>
         </div>
         <div className="h-8 w-8 rounded-full bg-gray-700 relative overflow-hidden">
            <div
              className="absolute bg-white h-full w-full rounded-full"
              style={{ left: `${(moon.phase - 0.5) * 200}%`, opacity: 0.8 }}
            />
         </div>
      </div>
    </div>
  );
}
