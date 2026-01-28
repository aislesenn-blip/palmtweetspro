"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface QuickFactsCardProps {
  name: string;
  country: string;
  countryCode?: string; // ISO 2 (cca2)
  lang?: string;
  lat: number;
  lng: number;
  initialWeatherTime?: string;
  initialCurrency?: any;
  initialIdd?: any;
  loading?: boolean;
}

export default function QuickFactsCard({
  name,
  country,
  countryCode,
  lang = 'en',
  lat,
  lng,
  initialWeatherTime,
  initialCurrency,
  initialIdd,
  loading: parentLoading = false
}: QuickFactsCardProps) {

  const [wikiData, setWikiData] = useState<{ extract: string; url?: string } | null | undefined>(undefined);
  const [countryDetails, setCountryDetails] = useState<{ currency: string; dialCode: string } | undefined>(undefined);
  const [timeString, setTimeString] = useState<string | undefined>(undefined);

  // 1. Fetch Wikipedia Data (Could be localized if wiki supports it, sticking to EN for now or mapping)
  useEffect(() => {
    let mounted = true;

    // Reset wiki data when name changes
    setWikiData(undefined);

    // TODO: Use lang-specific wikipedia subdomain (e.g., fr.wikipedia.org) if desired
    const wikiLang = ['en', 'fr', 'es', 'de', 'ru', 'zh', 'ja'].includes(lang) ? lang : 'en';

    axios.get(`https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${name}`)
      .then((res) => {
        if (mounted && res.data) {
          setWikiData({
            extract: res.data.extract,
            url: res.data.content_urls?.desktop?.page
          });
        }
      })
      .catch((e) => {
        // Fallback to English if localized fails
        if (lang !== 'en') {
             axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${name}`)
             .then((res) => {
                if (mounted && res.data) {
                    setWikiData({
                        extract: res.data.extract,
                        url: res.data.content_urls?.desktop?.page
                    });
                }
             }).catch(() => { if (mounted) setWikiData(null); });
        } else {
             if (mounted) setWikiData(null);
        }
      });

    return () => { mounted = false; };
  }, [name, lang]);

  // 2. Determine Country Data (Currency & IDD)
  useEffect(() => {
    let mounted = true;

    // Helper to format data
    const formatData = (currencyObj: any, iddObj: any) => {
        let currencyName = "Unknown Currency";
        let dialCode = "Unknown Code";

        if (currencyObj) {
            const cCode = Object.keys(currencyObj)[0];
            if (currencyObj[cCode]) {
                currencyName = `${currencyObj[cCode].name} (${cCode})`;
            }
        }
        if (iddObj) {
            dialCode = `${iddObj.root}${iddObj.suffixes?.[0] || ''}`;
        }
        return { currency: currencyName, dialCode };
    };

    if (initialCurrency && initialIdd) {
        setCountryDetails(formatData(initialCurrency, initialIdd));
    } else if (!parentLoading) {
        // Only fetch if data is missing AND parent is NOT loading
        axios.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies,idd`)
            .then((res) => {
                if (mounted && res.data && res.data.length > 0) {
                    const cData = res.data[0];
                    setCountryDetails(formatData(cData.currencies, cData.idd));
                } else {
                    if (mounted) setCountryDetails({ currency: "Unknown Currency", dialCode: "Unknown Code" });
                }
            })
            .catch(() => {
                 if (mounted) setCountryDetails({ currency: "Unknown Currency", dialCode: "Unknown Code" });
            });
    }

    return () => { mounted = false; };
  }, [country, initialCurrency, initialIdd, parentLoading]);

  // 3. Determine Time
  useEffect(() => {
      let mounted = true;

      if (initialWeatherTime) {
          const date = new Date(initialWeatherTime);
          if (!isNaN(date.getTime())) {
              setTimeString(date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }));
          } else {
              setTimeString(initialWeatherTime);
          }
      } else {
          // Fetch time if not provided
           axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&current=is_day`)
             .then((res) => {
                 if (mounted && res.data?.current?.time) {
                     const date = new Date(res.data.current.time);
                     setTimeString(date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }));
                 } else {
                     if (mounted) setTimeString("Unknown Time");
                 }
             })
             .catch(() => {
                 if (mounted) setTimeString("Unknown Time");
             });
      }

      return () => { mounted = false; };
  }, [lat, lng, initialWeatherTime, lang]);


  // Derived Loading State
  const isLoading = wikiData === undefined || countryDetails === undefined || timeString === undefined;

  if (isLoading) {
      return <SkeletonLoader className="h-48 w-full mb-8" />;
  }

  // Internationalization of Names
  let displayCountry = country;
  try {
      if (countryCode) {
          const regionNames = new Intl.DisplayNames([lang], { type: 'region' });
          displayCountry = regionNames.of(countryCode) || country;
      }
  } catch (e) {
      // Fallback
  }

  // Construct Summary
  const summary = `${name} is a key location in ${displayCountry}. The local dial code is ${countryDetails?.dialCode}, and the currency used is ${countryDetails?.currency}. Current time: ${timeString}.`;

  return (
    <div className="mb-8 rounded-3xl bg-blue-50 p-6 shadow-sm border border-blue-100">
       <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-2">Quick Insights</h2>
       <p className="text-lg text-blue-900 font-medium leading-relaxed mb-4">
         {summary}
       </p>

       {wikiData?.extract && (
         <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-blue-800">
            <p className="line-clamp-2">{wikiData.extract}</p>
            {wikiData.url && (
                <a href={wikiData.url} target="_blank" rel="noopener noreferrer" className="block mt-2 font-semibold hover:underline">
                    Source: Wikipedia
                </a>
            )}
         </div>
       )}
    </div>
  );
}
