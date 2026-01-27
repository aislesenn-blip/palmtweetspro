"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface QuickFactsCardProps {
  name: string;
  country: string;
  lat: number;
  lng: number;
  // Optional pre-fetched data from SSR
  initialWeatherTime?: string;
  initialCurrency?: any;
  initialIdd?: any;
}

export default function QuickFactsCard({ name, country, lat, lng, initialWeatherTime, initialCurrency, initialIdd }: QuickFactsCardProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function generateSummary() {
      try {
        setLoading(true);
        // We need: Currency, Dial Code, Time.
        // If passed via props (SSR), use them. Else fetch.

        let currencyName = "Unknown Currency";
        let dialCode = "Unknown Code";
        let time = initialWeatherTime || "Unknown Time";

        // 1. Fetch Country Info (Currency, IDD) if needed
        if (!initialCurrency || !initialIdd) {
             try {
                 const countryRes = await axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies,idd`, { timeout: 3000 });
                 if (countryRes.data && countryRes.data.length > 0) {
                     const cData = countryRes.data[0];
                     if (cData.currencies) {
                         const cCode = Object.keys(cData.currencies)[0];
                         currencyName = `${cData.currencies[cCode].name} (${cCode})`;
                     }
                     if (cData.idd) {
                         dialCode = `${cData.idd.root}${cData.idd.suffixes?.[0] || ''}`;
                     }
                 }
             } catch (e) {
                 console.warn("QuickFacts: Failed to fetch country info", e);
             }
        } else {
             const cCode = Object.keys(initialCurrency)[0];
             currencyName = `${initialCurrency[cCode].name} (${cCode})`;
             dialCode = `${initialIdd.root}${initialIdd.suffixes?.[0] || ''}`;
        }

        // 2. Fetch Time if needed
        if (!initialWeatherTime) {
            try {
                 const timeRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&current=time`, { timeout: 3000 });
                 if (timeRes.data?.current?.time) {
                     // Format: 2023-10-10T14:30
                     const date = new Date(timeRes.data.current.time);
                     time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                 }
            } catch (e) {
                 console.warn("QuickFacts: Failed to fetch time", e);
            }
        } else {
             // If initial time is ISO string
             const date = new Date(initialWeatherTime);
             if (!isNaN(date.getTime())) {
                  time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
             } else {
                  time = initialWeatherTime;
             }
        }

        if (mounted) {
            setSummary(`${name} is a key location in ${country}. The local dial code is ${dialCode}, and the currency used is ${currencyName}. Current time: ${time}.`);
        }

      } catch (e) {
          console.error("QuickFacts Error", e);
          if (mounted) setSummary(`Explore data for ${name}, ${country}.`); // Graceful fallback
      } finally {
          if (mounted) setLoading(false);
      }
    }

    generateSummary();
    return () => { mounted = false; };
  }, [name, country, lat, lng, initialWeatherTime, initialCurrency, initialIdd]);

  if (loading) {
      return <SkeletonLoader className="h-24 w-full mb-8" />;
  }

  return (
    <div className="mb-8 rounded-3xl bg-blue-50 p-6 shadow-sm border border-blue-100">
       <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-2">Quick Insights</h2>
       <p className="text-lg text-blue-900 font-medium leading-relaxed">
         {summary}
       </p>
    </div>
  );
}
