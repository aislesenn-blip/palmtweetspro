"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import TimeCard from './TimeCard';
import IdentityCard from './IdentityCard';
import LogisticsCard from './LogisticsCard';
import MapCard from './MapCard';
import ComparisonCard from './ComparisonCard';
import TelecomCard from './TelecomCard';
import CurrencyCard from './CurrencyCard';
import NearbyCard from './NearbyCard';
import QuickFactsCard from './QuickFactsCard';
import { Place } from '@/lib/db';

interface DashboardProps {
  initialPlace: Place;
}

export default function Dashboard({ initialPlace }: DashboardProps) {
  const [data, setData] = useState<any>({
    weather: null,
    time: null,
    identity: null,
    telecom: null,
    currency: null,
    nearby: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!initialPlace) return;
      setLoading(true);

      const lat = initialPlace.latitude;
      const lng = initialPlace.longitude;
      const country = initialPlace.country;

      // Parallel Fetch
      const results = await Promise.allSettled([
        // Weather & Time
        axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: { latitude: lat, longitude: lng, current: 'temperature_2m,weather_code', timezone: 'auto' }
        }),
        // Identity, Telecom, Currency
        axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies,idd,region,subregion`),
        // Nearby (Internal API)
        axios.get(`/api/places/nearby?lat=${lat}&lng=${lng}`)
      ]);

      if (mounted) {
        const newData = { ...data };

        // 1. Weather & Time
        if (results[0].status === 'fulfilled') {
           const res = results[0].value.data;
           newData.weather = {
             temp: res.current.temperature_2m,
             code: res.current.weather_code
           };
           newData.time = {
             timezone: res.timezone
           };
        }

        // 2. Identity, Telecom, Currency
        if (results[1].status === 'fulfilled' && results[1].value.data.length > 0) {
           const res = results[1].value.data[0];
           newData.identity = {
             region: res.region,
             subregion: res.subregion
           };
           newData.telecom = {
             idd: res.idd
           };
           newData.currency = {
             currencies: res.currencies
           };
        }

        // 3. Nearby
        if (results[2].status === 'fulfilled') {
           newData.nearby = results[2].value.data;
        }

        setData(newData);
        setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [initialPlace]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Facts (Top) */}
        <div className="lg:col-span-3">
            <QuickFactsCard
                name={initialPlace.name}
                country={initialPlace.country}
                lat={initialPlace.latitude}
                lng={initialPlace.longitude}
                initialCurrency={data.currency?.currencies}
                initialIdd={data.telecom?.idd}
                initialWeatherTime={data.time?.timezone} // Just passing TZ to trigger logic if needed, or null
            />
        </div>

        <WeatherCard data={data.weather} loading={loading} />
        <TimeCard data={data.time} loading={loading} />
        <IdentityCard countryName={initialPlace.country} data={data.identity} loading={loading} />

        <TelecomCard data={data.telecom} loading={loading} />
        <CurrencyCard data={data.currency} loading={loading} />
        <LogisticsCard lat={initialPlace.latitude} lng={initialPlace.longitude} loading={loading} />

        <div className="lg:col-span-2">
           <MapCard loading={loading} />
        </div>

        <NearbyCard data={data.nearby} loading={loading} />
        <ComparisonCard loading={loading} />
    </div>
  );
}
