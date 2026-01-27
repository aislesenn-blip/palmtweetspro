"use client";

import React, { useEffect, useState } from 'react';
import { CloudSun, CloudRain, Sun, Cloud, Snowflake, AlertCircle } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface WeatherCardProps {
  lat: number;
  lng: number;
}

export default function WeatherCard({ lat, lng }: WeatherCardProps) {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        // Defensive: Check lat/lng
        if (lat === undefined || lng === undefined) throw new Error("Missing coordinates");

        const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: {
            latitude: lat,
            longitude: lng,
            current: 'temperature_2m,weather_code',
            timezone: 'auto'
          },
          timeout: 5000 // 5s timeout
        });

        if (mounted && response?.data?.current) {
          setData({
            temp: response.data.current.temperature_2m,
            code: response.data.current.weather_code
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (e) {
        console.error("Client Weather Fetch Error", e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [lat, lng]);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  if (error) {
    return (
      <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">Weather Unavailable</p>
      </div>
    );
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

  const tempDisplay = data?.temp ?? '--';
  const codeDisplay = data?.code;

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        {getWeatherIcon(codeDisplay)}
        <h3 className="font-medium text-gray-500">Weather</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">
          {typeof tempDisplay === 'number' ? `${tempDisplay}°C` : tempDisplay}
        </div>
        <p className="text-gray-500">{getWeatherDescription(codeDisplay)}</p>
      </div>
    </div>
  );
}
