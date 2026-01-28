"use client";

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import TimeCard from './TimeCard';
import IdentityCard from './IdentityCard';
import LogisticsCard from './LogisticsCard';
import TelecomCard from './TelecomCard';
import CurrencyCard from './CurrencyCard';
import GovernmentCard from './GovernmentCard';
import TravelCard from './TravelCard';
import FinancialCard from './FinancialCard';
import AstronomyCard from './AstronomyCard';
import ClimateCard from './ClimateCard';
import { Place } from '@/lib/db';
import { calculateDistance } from '@/lib/distance';

interface ComparisonDashboardProps {
  place1: Place;
  place2: Place;
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
    // Silent fail
  }
  return null;
}

function SingleCityColumn({ place, otherPlace }: { place: Place, otherPlace: Place }) {
  const [data, setData] = useState<any>({
    weather: null,
    time: null,
    identity: null,
    telecom: null,
    currency: null,
    climate: null,
    cost: null
  });
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      const results = await Promise.allSettled([
        axios.get(`https://api.open-meteo.com/v1/forecast`, {
          params: { latitude: place.latitude, longitude: place.longitude, current: 'temperature_2m,weather_code', daily: 'temperature_2m_max,temperature_2m_min', timezone: 'auto' }
        }),
        axios.get(`https://restcountries.com/v3.1/name/${place.country}?fields=currencies,idd,region,subregion,flags,languages,car,cca2`),
        axios.get(`https://overpass-api.de/api/interpreter`, {
          params: { data: `[out:json];node(around:100000,${place.latitude},${place.longitude})[aeroway=aerodrome][iata];out;` }
        }),
        fetchTeleportData(place.latitude, place.longitude)
      ]);

      if (mounted) {
        const newData = { ...data };
        if (results[0].status === 'fulfilled') {
           const res = results[0].value.data;
           newData.weather = { temp: res.current.temperature_2m, code: res.current.weather_code };
           newData.time = { timezone: res.timezone };
           newData.climate = res.daily;
        }
        if (results[1].status === 'fulfilled' && results[1].value.data.length > 0) {
           const res = results[1].value.data[0];
           newData.identity = { region: res.region, subregion: res.subregion, flags: res.flags, languages: res.languages, cca2: res.cca2, carSide: res.car?.side };
           newData.telecom = { idd: res.idd };
           newData.currency = { currencies: res.currencies };
        }
        if (results[2].status === 'fulfilled') {
           setNodes(results[2].value.data.elements);
        }
        if (results[3].status === 'fulfilled' && results[3].value) {
            newData.cost = results[3].value;
        }
        setData(newData);
        setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [place]);

  const airports = useMemo(() => {
    return nodes.map((node: any) => ({
      name: node.tags.name, iata: node.tags.iata,
      distance: calculateDistance(place.latitude, place.longitude, node.lat, node.lon)
    })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 3);
  }, [nodes, place.latitude, place.longitude]);

  const distanceToOther = calculateDistance(place.latitude, place.longitude, otherPlace.latitude, otherPlace.longitude);

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-900 mb-4">{place.name}</h2>
       <WeatherCard data={data.weather} loading={loading} />
       <TimeCard data={data.time} loading={loading} />
       <IdentityCard countryName={place.country} data={data.identity} loading={loading} />
       <TelecomCard data={data.telecom} loading={loading} />
       <CurrencyCard data={data.currency} loading={loading} />
       <GovernmentCard countryCode={data.identity?.cca2} carSide={data.identity?.carSide} loading={loading} />
       <TravelCard
          airports={airports}
          cityName={place.name}
          countryName={place.country}
          comparisonMode
          distanceToOther={distanceToOther}
          loading={loading}
       />
       <FinancialCard countryCode={data.identity?.cca2} details={data.cost} loading={loading} />
       <AstronomyCard lat={place.latitude} lng={place.longitude} loading={loading} />
       <ClimateCard daily={data.climate} loading={loading} />
       <LogisticsCard lat={place.latitude} lng={place.longitude} loading={loading} />
    </div>
  );
}

export default function ComparisonDashboard({ place1, place2 }: ComparisonDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
       <SingleCityColumn place={place1} otherPlace={place2} />
       <SingleCityColumn place={place2} otherPlace={place1} />
    </div>
  );
}
