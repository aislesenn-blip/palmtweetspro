import React from 'react';
import { CloudSun } from 'lucide-react';

export default function WeatherCard({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }
  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <CloudSun className="h-5 w-5 text-blue-500" />
        <h3 className="font-medium text-gray-500">Weather</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">24°C</div>
        <p className="text-gray-500">Partly Cloudy</p>
      </div>
    </div>
  );
}
