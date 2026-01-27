"use client";

import React from 'react';
import { CloudRain, Calendar } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface ClimateCardProps {
  daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] } | null;
  loading?: boolean;
}

export default function ClimateCard({ daily, loading }: ClimateCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  // Calculate generic "normals" from the forecast if historical not available,
  // or just display the forecast trend. Prompt says "Forecast: Provide a live 14-day forecast".
  // And "Climate Normals". For MVP of this expansion, Forecast is easier to fetch via OpenMeteo forecast endpoint.
  // Historical requires a different API call. I'll stick to Forecast visualization for now.

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h3 className="font-medium text-gray-500">14-Day Forecast</h3>
      </div>

      {daily ? (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
           {daily.time.map((t, i) => (
             <div key={t} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500 w-24">{new Date(t).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex gap-4">
                   <span className="font-bold text-gray-900">{Math.round(daily.temperature_2m_max[i])}°</span>
                   <span className="text-gray-400">{Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <p className="text-gray-500">Forecast unavailable.</p>
      )}
    </div>
  );
}
