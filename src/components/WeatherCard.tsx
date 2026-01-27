"use client";

import React from 'react';
import { CloudSun, CloudRain, Sun, Cloud, Snowflake, AlertCircle } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface WeatherCardProps {
  data?: { temp: number; code: number } | null;
  loading?: boolean;
}

export default function WeatherCard({ data, loading }: WeatherCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  const getWeatherIcon = (code?: number) => {
    if (code === undefined) return <CloudSun className="h-5 w-5 text-blue-500" />;
    const safeCode = Number(code);
    if (safeCode <= 1) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (safeCode <= 3) return <CloudSun className="h-5 w-5 text-blue-500" />;
    if (safeCode <= 48) return <Cloud className="h-5 w-5 text-gray-500" />;
    if (safeCode <= 67) return <CloudRain className="h-5 w-5 text-blue-600" />;
    if (safeCode <= 77) return <Snowflake className="h-5 w-5 text-cyan-500" />;
    return <CloudSun className="h-5 w-5 text-blue-500" />;
  };

  const getWeatherDescription = (code?: number) => {
    if (code === undefined) return "Unknown";
    const safeCode = Number(code);
    if (safeCode <= 1) return "Clear Sky";
    if (safeCode <= 3) return "Partly Cloudy";
    if (safeCode <= 48) return "Foggy";
    if (safeCode <= 67) return "Rainy";
    if (safeCode <= 77) return "Snowy";
    return "Variable";
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        {getWeatherIcon(data?.code)}
        <h3 className="font-medium text-gray-500">Weather</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">
          {data ? `${data.temp}°C` : '--'}
        </div>
        <p className="text-gray-500">{getWeatherDescription(data?.code)}</p>
      </div>
    </div>
  );
}
