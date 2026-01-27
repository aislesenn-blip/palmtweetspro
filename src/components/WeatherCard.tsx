import React from 'react';
import { CloudSun, CloudRain, Sun, Cloud, Snowflake } from 'lucide-react';

export default function WeatherCard({
  loading = false,
  temperature,
  weatherCode
}: {
  loading?: boolean,
  temperature?: number,
  weatherCode?: number
}) {
  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }

  // Simple WMO code mapping
  const getWeatherIcon = (code?: number) => {
    if (code === undefined) return <CloudSun className="h-5 w-5 text-blue-500" />;
    if (code <= 1) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (code <= 3) return <CloudSun className="h-5 w-5 text-blue-500" />;
    if (code <= 48) return <Cloud className="h-5 w-5 text-gray-500" />;
    if (code <= 67) return <CloudRain className="h-5 w-5 text-blue-600" />;
    if (code <= 77) return <Snowflake className="h-5 w-5 text-cyan-500" />;
    return <CloudSun className="h-5 w-5 text-blue-500" />;
  };

  const getWeatherDescription = (code?: number) => {
    if (code === undefined) return "Unknown";
    if (code <= 1) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    return "Variable";
  };

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        {getWeatherIcon(weatherCode)}
        <h3 className="font-medium text-gray-500">Weather</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">
          {temperature !== undefined ? `${temperature}°C` : '--'}
        </div>
        <p className="text-gray-500">{getWeatherDescription(weatherCode)}</p>
      </div>
    </div>
  );
}
