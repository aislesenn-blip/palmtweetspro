"use client";

import React from 'react';
import { CloudRain, Calendar, Sun } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface ClimateCardProps {
  cityName?: string;
  forecast?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] } | null;
  daily?: any; // Legacy/Comparison support
  normals?: { avgTemp: string; monthlyPrecip: string } | null;
  loading?: boolean;
}

export default function ClimateCard({ cityName, forecast, daily, normals, loading }: ClimateCardProps) {
  const effectiveForecast = forecast || daily;
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const avgTemp = normals ? parseFloat(normals.avgTemp) : null;
  const precip = normals ? parseFloat(normals.monthlyPrecip) : null;

  let condition = "typical weather";
  if (avgTemp !== null && precip !== null) {
      if (precip > 100) condition = "heavy rainfall";
      else if (precip > 50) condition = "frequent showers";
      else if (precip > 20) condition = "occasional rain";
      else condition = "mostly dry conditions";

      if (avgTemp > 25) condition = `hot temperatures and ${condition}`;
      else if (avgTemp < 5) condition = `freezing temperatures and ${condition}`;
      else if (avgTemp < 15) condition = `cool temperatures and ${condition}`;
      else condition = `mild temperatures and ${condition}`;
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Sun className="h-5 w-5 text-orange-500" />
        <h3 className="font-medium text-gray-500">Climate & Forecast</h3>
      </div>

      <div className="space-y-6">
         {/* Normals Insight */}
         {normals && (
             <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-sm text-orange-900 leading-relaxed">
                   Typically, <span className="font-bold">{cityName}</span> in {currentMonthName} experiences {condition} with an average temp of <span className="font-bold">{avgTemp}°C</span> and about {Math.round(precip!)}mm of rain.
                </p>
             </div>
         )}

         {/* Forecast */}
         <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">14-Day Forecast</p>
            {effectiveForecast ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {effectiveForecast.time.map((t: string, i: number) => (
                    <div key={t} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-500 w-24">{new Date(t).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <div className="flex gap-4">
                        <span className="font-bold text-gray-900">{Math.round(effectiveForecast.temperature_2m_max[i])}°</span>
                        <span className="text-gray-400">{Math.round(effectiveForecast.temperature_2m_min[i])}°</span>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">Forecast unavailable.</p>
            )}
         </div>
      </div>
    </div>
  );
}
