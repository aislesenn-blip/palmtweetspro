"use client";

import React, { useState } from 'react';
import { Sun, CloudRain, Calendar, ArrowRight } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface ClimateCardProps {
  cityName?: string;
  forecast?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] } | null;
  daily?: any;
  normals?: { avgTemp: string; monthlyPrecip: string }[] | { avgTemp: string; monthlyPrecip: string } | null; // Support Array or Legacy Object
  loading?: boolean;
}

export default function ClimateCard({ cityName, forecast, daily, normals, loading }: ClimateCardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  const effectiveForecast = forecast || daily;

  // Normalize normals to array if legacy object (though API now returns array, need safety)
  const normalsArray = Array.isArray(normals) ? normals : (normals ? [normals] : null);

  // Logic to handle if we only have 1 normals object vs 12
  const currentNormal = normalsArray ? (normalsArray.length > 1 ? normalsArray[selectedMonth] : normalsArray[0]) : null;

  const avgTemp = currentNormal ? parseFloat(currentNormal.avgTemp) : null;
  const precip = currentNormal ? parseFloat(currentNormal.monthlyPrecip) : null;

  // Insight Logic
  const generateInsight = (temp: number, rain: number) => {
      let feeling = "";
      let activity = "";

      if (temp > 28) feeling = "Hot";
      else if (temp > 20) feeling = "Warm";
      else if (temp > 10) feeling = "Mild";
      else if (temp > 0) feeling = "Chilly";
      else feeling = "Freezing";

      if (rain > 150) activity = "Best for Indoor Museums & Cafes";
      else if (rain > 80) activity = "Pack an Umbrella";
      else if (temp > 25) activity = "Perfect for Beach & Safari";
      else if (temp > 15) activity = "Great for City Walking";
      else if (temp < 5) activity = "Good for Winter Sports";
      else activity = "Enjoy the sights";

      return { feeling, activity };
  };

  const insight = (avgTemp !== null && precip !== null) ? generateInsight(avgTemp, precip) : null;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-gray-500">Climate & Forecast</h3>
        </div>

        {/* Month Selector */}
        {normalsArray && normalsArray.length > 1 && (
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="text-xs font-bold text-gray-700 bg-gray-100 border-none rounded-lg py-1 px-2 cursor-pointer outline-none focus:ring-2 focus:ring-orange-200"
            >
                {monthNames.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                ))}
            </select>
        )}
      </div>

      <div className="space-y-6">
         {/* Normals Insight */}
         {currentNormal && insight ? (
             <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-3xl font-bold text-gray-900">{avgTemp}°</span>
                        <span className="text-sm text-gray-500 ml-1">avg</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm font-bold text-blue-600">{Math.round(precip!)}mm</span>
                        <span className="text-[10px] text-gray-400 uppercase">Rainfall</span>
                    </div>
                </div>
                <p className="text-sm text-orange-900 leading-relaxed font-medium">
                   {monthNames[selectedMonth]} is typically <span className="font-bold">{insight.feeling}</span> in {cityName}. {insight.activity}.
                </p>
             </div>
         ) : (
             <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-400 italic text-center">
                 Historical data unavailable for this month.
             </div>
         )}

         {/* Forecast (Only show if current month is selected? No, forecast is always next 7 days.
             Maybe label it distinctively) */}
         <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming 7 Days</p>
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
