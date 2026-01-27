"use client";

import React, { useEffect, useState } from 'react';
import { CloudSun, CloudRain, Sun, Cloud, Snowflake } from 'lucide-react';
import axios from 'axios';

interface WeatherCardProps {
  lat: number;
  lng: number;
}

export default function WeatherCard({ lat, lng }: WeatherCardProps) {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: {
            latitude: lat,
            longitude: lng,
            current: 'temperature_2m,weather_code',
            timezone: 'auto'
          }
        });
        if (mounted && response.data.current) {
          setData({
            temp: response.data.current.temperature_2m,
            code: response.data.current.weather_code
          });
        }
      } catch (e) {
        console.error("Client Weather Fetch Error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [lat, lng]);

  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }

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
