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
import { Place } from '@/lib/db';
import { calculateDistance } from '@/lib/distance';

interface DashboardProps {
  initialPlace: Place;
  dict?: any;
}

async function fetchTeleportData(lat: number, lng: number) {
  try {
    const locRes = await axios.get(`https://api.teleport.org/api/locations/${lat},${lng}/`);
    const uaUrl = locRes.data?._embedded?.['location:nearest-urban-areas']?.[0]?.['_links']?.['location:nearest-urban-area']?.href;
    if (uaUrl) {
      const detailsRes = await axios.get(`${uaUrl}details/`);
      const categories = detailsRes.data.categories;

      const findCost = (catId: string, itemId: string) => {
        const cat = categories.find((c: any) => c.id === catId);
        const item = cat?.data.find((i: any) => i.id === itemId);
        return item ? `$${item.currency_dollar_value.toFixed(2)}` : null;
      };

      return {
        "Lunch": findCost('COST-OF-LIVING', 'COST-RESTAURANT-MEAL'),
        "Cappuccino": findCost('COST-OF-LIVING', 'COST-CAPPUCCINO'),
        "Apartment (Month)": findCost('HOUSING', 'APARTMENT-RENT-SMALL'),
        "Beer": findCost('COST-OF-LIVING', 'COST-IMPORT-BEER')
      };
    }
  } catch (e) {
    // Silent fail for cost data
  }
  return null;
}

export default function Dashboard({ initialPlace, dict }: DashboardProps) {
  const [data, setData] = useState<any>({
    weather: null,
    time: null,
    identity: null,
    telecom: null,
    currency: null,
    nearby: null,
    rates: null,
    airports: [],
    climate: null,
    cost: null
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
        // 0. Weather & Time & Climate (Forecast)
        axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: { latitude: lat, longitude: lng, current: 'temperature_2m,weather_code', daily: 'temperature_2m_max,temperature_2m_min', timezone: 'auto' }
        }),
        // 1. Identity, Telecom, Currency, Car Side (Government)
        axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies,idd,region,subregion,flags,languages,car,cca2`),
        // 2. Nearby
        axios.get(`/api/places/nearby?lat=${lat}&lng=${lng}`),
        // 3. Rates
        axios.get(`https://open.er-api.com/v6/latest/USD`),
        // 4. Airports (Overpass)
        axios.get(`https://overpass-api.de/api/interpreter`, {
          params: {
            data: `[out:json];node(around:100000,${lat},${lng})[aeroway=aerodrome][iata];out;` // 100km radius, only with IATA
          }
        }),
        // 5. Teleport Cost Data
        fetchTeleportData(lat, lng)
      ]);

      if (mounted) {
        const newData = { ...data };

        // 0. Weather/Time/Climate
        if (results[0].status === 'fulfilled') {
           const res = results[0].value.data;
           newData.weather = {
             temp: res.current.temperature_2m,
             code: res.current.weather_code
           };
           newData.time = {
             timezone: res.timezone
           };
           newData.climate = res.daily;
        }

        // 1. RestCountries
        if (results[1].status === 'fulfilled' && results[1].value.data.length > 0) {
           const res = results[1].value.data[0];
           newData.identity = {
             region: res.region,
             subregion: res.subregion,
             flags: res.flags,
             languages: res.languages,
             cca2: res.cca2,
             carSide: res.car?.side
           };
           newData.telecom = { idd: res.idd };
           newData.currency = { currencies: res.currencies };
        }

        // 2. Nearby
        if (results[2].status === 'fulfilled') {
           newData.nearby = results[2].value.data;
        }

        // 3. Rates
        if (results[3].status === 'fulfilled') {
           newData.rates = results[3].value.data.rates;
        }

        // 4. Airports
        if (results[4].status === 'fulfilled') {
           const nodes = results[4].value.data.elements;
           // Process airports: calc distance, sort, take top 3
           const processed = nodes.map((node: any) => ({
             name: node.tags.name || 'Unknown Airport',
             iata: node.tags.iata,
             distance: calculateDistance(lat, lng, node.lat, node.lon)
           })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 3);
           newData.airports = processed;
        }

        // 5. Teleport
        if (results[5].status === 'fulfilled' && results[5].value) {
            newData.cost = results[5].value;
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
                initialWeatherTime={data.time?.timezone}
            />
        </div>

        <WeatherCard data={data.weather} loading={loading} />
        <TimeCard data={data.time} loading={loading} />
        <IdentityCard countryName={initialPlace.country} data={data.identity} loading={loading} />

        <TelecomCard data={data.telecom} loading={loading} />
        <CurrencyCard data={data.currency} rates={data.rates} loading={loading} />
        <LogisticsCard lat={initialPlace.latitude} lng={initialPlace.longitude} loading={loading} />

        <GovernmentCard countryCode={data.identity?.cca2} carSide={data.identity?.carSide} loading={loading} />
        <TravelCard airports={data.airports} cityName={initialPlace.name} countryName={initialPlace.country} loading={loading} />
        <AstronomyCard lat={initialPlace.latitude} lng={initialPlace.longitude} loading={loading} />

        <FinancialCard countryCode={data.identity?.cca2} details={data.cost} loading={loading} />
        <ClimateCard daily={data.climate} loading={loading} />

        <div className="lg:col-span-2">
           <MapCard lat={initialPlace.latitude} lng={initialPlace.longitude} loading={loading} />
        </div>

        <NearbyCard data={data.nearby} loading={loading} />
        <ComparisonCard loading={loading} />
    </div>
  );
}
