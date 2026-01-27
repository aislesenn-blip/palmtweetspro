"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import TimeCard from './TimeCard';
import IdentityCard from './IdentityCard';
import LogisticsCard from './LogisticsCard';
import TelecomCard from './TelecomCard';
import CurrencyCard from './CurrencyCard';
import { Place } from '@/lib/db';

interface ComparisonDashboardProps {
  place1: Place;
  place2: Place;
}

function SingleCityColumn({ place }: { place: Place }) {
  const [data, setData] = useState<any>({
    weather: null,
    time: null,
    identity: null,
    telecom: null,
    currency: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      // Reuse logic from Dashboard (simplified)
      const results = await Promise.allSettled([
        axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: { latitude: place.latitude, longitude: place.longitude, current: 'temperature_2m,weather_code', timezone: 'auto' }
        }),
        axios.get(`https://restcountries.com/v3.1/name/${place.country}?fields=currencies,idd,region,subregion,flags,languages`)
      ]);

      if (mounted) {
        const newData = { ...data };
        if (results[0].status === 'fulfilled') {
           const res = results[0].value.data;
           newData.weather = { temp: res.current.temperature_2m, code: res.current.weather_code };
           newData.time = { timezone: res.timezone };
        }
        if (results[1].status === 'fulfilled' && results[1].value.data.length > 0) {
           const res = results[1].value.data[0];
           newData.identity = { region: res.region, subregion: res.subregion, flags: res.flags, languages: res.languages };
           newData.telecom = { idd: res.idd };
           newData.currency = { currencies: res.currencies };
        }
        setData(newData);
        setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [place]);

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-900 mb-4">{place.name}</h2>
       <WeatherCard data={data.weather} loading={loading} />
       <TimeCard data={data.time} loading={loading} />
       <IdentityCard countryName={place.country} data={data.identity} loading={loading} />
       <TelecomCard data={data.telecom} loading={loading} />
       <CurrencyCard data={data.currency} loading={loading} />
       <LogisticsCard lat={place.latitude} lng={place.longitude} loading={loading} />
    </div>
  );
}

export default function ComparisonDashboard({ place1, place2 }: ComparisonDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
       <SingleCityColumn place={place1} />
       <SingleCityColumn place={place2} />
    </div>
  );
}
