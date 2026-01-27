"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WeatherCard from '@/components/WeatherCard';
import { Place } from '@/lib/db';

export default function ComparisonColumn({ place }: { place: Place }) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: {
            latitude: place.latitude,
            longitude: place.longitude,
            current: 'temperature_2m,weather_code',
            timezone: 'auto'
          }
        });
        if (response.data.current) {
          setWeatherData({
            temp: response.data.current.temperature_2m,
            code: response.data.current.weather_code
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [place]);

  return <WeatherCard data={weatherData} loading={loading} />;
}
