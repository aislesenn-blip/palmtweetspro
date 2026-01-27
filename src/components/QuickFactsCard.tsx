"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface QuickFactsCardProps {
  name: string;
  country: string;
  lat: number;
  lng: number;
  initialWeatherTime?: string;
  initialCurrency?: any;
  initialIdd?: any;
}

export default function QuickFactsCard({ name, country, lat, lng, initialWeatherTime, initialCurrency, initialIdd }: QuickFactsCardProps) {
  const [summary, setSummary] = useState<string>('');
  const [wikiExtract, setWikiExtract] = useState<string | null>(null);
  const [wikiUrl, setWikiUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function generateSummary() {
      try {
        setLoading(true);

        let currencyName = "Unknown Currency";
        let dialCode = "Unknown Code";
        let time = initialWeatherTime || "Unknown Time";

        // Parallel Fetch: Wiki & Missing Data
        const promises: Promise<any>[] = [];

        // 1. Wiki Fetch
        promises.push(
            axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${name}`)
                 .catch(() => null) // Ignore wiki errors
        );

        // 2. Fetch Country Info if needed
        if (!initialCurrency || !initialIdd) {
             promises.push(axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies,idd`));
        } else {
             promises.push(Promise.resolve(null));
        }

        // 3. Fetch Time if needed
        if (!initialWeatherTime) {
            promises.push(axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&current=time`));
        } else {
            promises.push(Promise.resolve(null));
        }

        const [wikiRes, countryRes, timeRes] = await Promise.all(promises);

        if (mounted) {
            // Process Wiki
            if (wikiRes && wikiRes.data) {
                setWikiExtract(wikiRes.data.extract);
                setWikiUrl(wikiRes.data.content_urls?.desktop?.page);
            }

            // Process Country
            if (countryRes && countryRes.data && countryRes.data.length > 0) {
                 const cData = countryRes.data[0];
                 if (cData.currencies) {
                     const cCode = Object.keys(cData.currencies)[0];
                     currencyName = `${cData.currencies[cCode].name} (${cCode})`;
                 }
                 if (cData.idd) {
                     dialCode = `${cData.idd.root}${cData.idd.suffixes?.[0] || ''}`;
                 }
            } else if (initialCurrency && initialIdd) {
                 const cCode = Object.keys(initialCurrency)[0];
                 currencyName = `${initialCurrency[cCode].name} (${cCode})`;
                 dialCode = `${initialIdd.root}${initialIdd.suffixes?.[0] || ''}`;
            }

            // Process Time
            if (timeRes && timeRes.data?.current?.time) {
                 const date = new Date(timeRes.data.current.time);
                 time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (initialWeatherTime) {
                 const date = new Date(initialWeatherTime);
                 if (!isNaN(date.getTime())) {
                      time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                 } else {
                      time = initialWeatherTime;
                 }
            }

            setSummary(`${name} is a key location in ${country}. The local dial code is ${dialCode}, and the currency used is ${currencyName}. Current time: ${time}.`);
        }

      } catch (e) {
          console.error("QuickFacts Error", e);
          if (mounted) setSummary(`Explore data for ${name}, ${country}.`);
      } finally {
          if (mounted) setLoading(false);
      }
    }

    generateSummary();
    return () => { mounted = false; };
  }, [name, country, lat, lng, initialWeatherTime, initialCurrency, initialIdd]);

  if (loading) {
      return <SkeletonLoader className="h-48 w-full mb-8" />;
  }

  return (
    <div className="mb-8 rounded-3xl bg-blue-50 p-6 shadow-sm border border-blue-100">
       <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-2">Quick Insights</h2>
       <p className="text-lg text-blue-900 font-medium leading-relaxed mb-4">
         {summary}
       </p>

       {wikiExtract && (
         <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-blue-800">
            <p className="line-clamp-2">{wikiExtract}</p>
            {wikiUrl && (
                <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 font-semibold hover:underline">
                    Source: Wikipedia
                </a>
            )}
         </div>
       )}
    </div>
  );
}
