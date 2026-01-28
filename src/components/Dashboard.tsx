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
import GovernmentCard from './GovernmentCard';
import TravelCard from './TravelCard';
import FinancialCard from './FinancialCard';
import AstronomyCard from './AstronomyCard';
import ClimateCard from './ClimateCard';
import DistanceCalculator from './DistanceCalculator';
import WhatToExpectCard from './WhatToExpectCard';
import { Place } from '@/lib/db';

interface DashboardProps {
  initialPlace: Place;
  dict?: any;
  lang?: string;
}

export default function Dashboard({ initialPlace, dict, lang = 'en' }: DashboardProps) {
  const [data, setData] = useState<any>({
    weather: null,
    time: null,
    identity: null,
    telecom: null,
    currency: null,
    nearby: null,
    rates: null,
    airports: [],
    climate: null, // Forecast
    climateNormals: null, // Normals
    cost: null,
    logistics: null,
    government: null,
    travelMetrics: null
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

      // Parallel Fetch (BFF Pattern)
      const results = await Promise.allSettled([
        // 0. Climate (Forecast, Current, Normals)
        axios.get(`/api/modules/climate?lat=${lat}&lng=${lng}`),
        // 1. Travel (Airports, Metrics)
        axios.get(`/api/modules/travel?lat=${lat}&lng=${lng}`),
        // 2. Cost (Teleport + Fallback) - Pass country name for fallback resolution
        axios.get(`/api/modules/cost?lat=${lat}&lng=${lng}&countryName=${encodeURIComponent(country)}`),
        // 3. Logistics (Overpass Infrastructure)
        axios.get(`/api/modules/logistics?lat=${lat}&lng=${lng}`),
        // 4. Identity (RestCountries + Holidays)
        axios.get(`/api/modules/identity?country=${country}`),
        // 5. Government (Visa, Driving) - Pass country name for resolution
        axios.get(`/api/modules/government?country=${country}`),
        // 6. Nearby (Internal)
        axios.get(`/api/places/nearby?lat=${lat}&lng=${lng}`),
        // 7. Rates (External - could be moved to BFF but keeping for now)
        axios.get(`https://open.er-api.com/v6/latest/USD`),
      ]);

      if (mounted) {
        const newData = { ...data };

        // 0. Climate
        if (results[0].status === 'fulfilled') {
           const res = results[0].value.data;
           if (res.current) {
               newData.weather = {
                   temp: res.current.temperature_2m,
                   code: res.current.weather_code
               };
           }
           // Pass currentTime if available, else just timezone
           newData.time = {
               timezone: res.timezone,
               currentTime: res.current?.time
           };
           newData.climate = res.forecast; // Daily forecast
           newData.climateNormals = res.normals;
        }

        // 1. Travel
        if (results[1].status === 'fulfilled') {
           const res = results[1].value.data;
           newData.airports = res.airports || [];
           newData.travelMetrics = res.metrics;
        }

        // 2. Cost
        if (results[2].status === 'fulfilled') {
           newData.cost = results[2].value.data;
        }

        // 3. Logistics
        if (results[3].status === 'fulfilled') {
           newData.logistics = results[3].value.data;
        }

        // 4. Identity
        if (results[4].status === 'fulfilled') {
           const res = results[4].value.data;
           newData.identity = res; // Contains population, holidays, flags, etc.
           newData.telecom = { idd: res.idd };
           newData.currency = { currencies: res.currencies };
        }

        // 5. Government
        if (results[5].status === 'fulfilled') {
           newData.government = results[5].value.data;
        }

        // 6. Nearby
        if (results[6].status === 'fulfilled') {
           newData.nearby = results[6].value.data;
        }

        // 7. Rates
        if (results[7].status === 'fulfilled') {
           newData.rates = results[7].value.data.rates;
        }

        setData(newData);
        setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [initialPlace]);

  // Derive simple cost level for Vibe Check
  const getCostLevel = (costData: any) => {
      if (!costData || !costData.costs) return "Medium";
      const lunch = parseFloat(costData.costs["Lunch"]?.replace('$','') || '0');
      if (lunch > 15) return "High";
      if (lunch > 25) return "Very High";
      if (lunch < 8) return "Low";
      return "Medium";
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Facts (Top) */}
        <div className="lg:col-span-3">
            <QuickFactsCard
                name={initialPlace.name}
                country={initialPlace.country} // Keep original name for API lookups
                countryCode={data.identity?.cca2} // Pass code for translation
                lang={lang} // Pass lang for formatting
                lat={initialPlace.latitude}
                lng={initialPlace.longitude}
                initialCurrency={data.currency?.currencies}
                initialIdd={data.telecom?.idd}
                initialWeatherTime={data.time?.currentTime}
                loading={loading}
            />
        </div>

        {/* Vibe Check (New) */}
        <div className="lg:col-span-3">
             <WhatToExpectCard
                cityName={initialPlace.name}
                population={data.identity?.population}
                costLevel={getCostLevel(data.cost)}
                language={data.identity?.languages ? Object.values(data.identity.languages)[0] as string : undefined}
                temp={data.weather?.temp}
                loading={loading}
             />
        </div>

        <WeatherCard data={data.weather} loading={loading} />
        <TimeCard data={data.time} loading={loading} />
        <IdentityCard countryName={initialPlace.country} data={data.identity} loading={loading} />

        <TelecomCard data={data.telecom} loading={loading} />
        <CurrencyCard data={data.currency} rates={data.rates} loading={loading} />

        <LogisticsCard
            lat={initialPlace.latitude}
            lng={initialPlace.longitude}
            postalCode={data.logistics?.postalCode}
            ports={data.logistics?.ports}
            railways={data.logistics?.railways}
            terminals={data.logistics?.terminals}
            loading={loading}
        />

        <GovernmentCard
            countryCode={data.identity?.cca2 || 'Unknown'}
            visa={data.government?.visa}
            driving={data.government?.driving}
            loading={loading}
        />

        <TravelCard
            airports={data.airports}
            metrics={data.travelMetrics}
            cityName={initialPlace.name}
            countryName={initialPlace.country}
            loading={loading}
        />

        {/* Distance Calculator (New) */}
        <div className="lg:col-span-2">
           <DistanceCalculator
               currentCity={initialPlace.name}
               currentLat={initialPlace.latitude}
               currentLng={initialPlace.longitude}
           />
        </div>

        <AstronomyCard lat={initialPlace.latitude} lng={initialPlace.longitude} loading={loading} />

        <FinancialCard details={data.cost} countryCode={data.identity?.cca2 || 'XX'} loading={loading} />

        <ClimateCard
            forecast={data.climate}
            normals={data.climateNormals}
            cityName={initialPlace.name}
            loading={loading}
        />

        <div className="lg:col-span-2">
           <MapCard lat={initialPlace.latitude} lng={initialPlace.longitude} loading={loading} />
        </div>

        <NearbyCard data={data.nearby} loading={loading} />
        <ComparisonCard loading={loading} />
    </div>
  );
}
