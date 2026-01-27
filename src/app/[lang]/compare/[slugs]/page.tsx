"use client";

import React, { useEffect, useState } from 'react';
import { getPlaceBySlug } from '@/lib/db';
import WeatherCard from '@/components/WeatherCard';
import axios from 'axios';

// Since WeatherCard now expects `data` prop and not `lat`/`lng`, we need to fetch data here too
// or revert WeatherCard to fetch internally.
// BUT the masterplan says "In [city]/page.tsx, you MUST implement a Parallel Client-Side Fetch inside useEffect".
// Comparison page is a different beast.
// To fix the build, I will make a wrapper or just use the new WeatherCard with fetched data.
// Since comparison page wasn't explicitly in the 4-phase plan but is part of the app, I should fix it.
// I'll create a `ComparisonPlace` component that fetches data for one place.

function ComparisonPlace({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Place (Client Side for now to avoid async component issues in sub-tree if complicated)
      // Actually, better to fetch place details.
      // But we can just use the API if we had one.
      // For now, let's just use the WeatherCard properly.
      // Wait, WeatherCard takes `data` object now.

      // I'll leave the comparison page simple: just fetch weather.
      // But I need lat/lng first.

      // We can use the server-side passed place if available.
    }
  }, []);

  return null;
}

// Actually, I will revert to using a FetchingWeatherCard for the comparison page?
// No, I should update the Comparison Page to fetch data properly.
// But time is tight.
// I will just make the Comparison Page use a local fetch or similar.
// Since `page.tsx` is server component, I can fetch place.
// Then I need to fetch weather.
// I will create a `ComparisonColumn` client component.

import ComparisonColumn from './ComparisonColumn';

export default async function Page({ params }: { params: { lang: string; slugs: string } }) {
  const [slug1, slug2] = params.slugs.split('-vs-');

  const place1 = slug1 ? await getPlaceBySlug(slug1) : null;
  const place2 = slug2 ? await getPlaceBySlug(slug2) : null;

  return (
    <div className="mx-auto max-w-7xl px-6">
      <h1 className="mb-8 text-3xl font-bold">Comparison</h1>
      <div className="grid grid-cols-2 gap-8">
        <div>
           <h2 className="text-xl font-bold mb-4">{place1?.name || slug1}</h2>
           <div className="space-y-4">
             {place1 ? <ComparisonColumn place={place1} /> : <p>Invalid Place</p>}
           </div>
        </div>
        <div>
           <h2 className="text-xl font-bold mb-4">{place2?.name || slug2}</h2>
           <div className="space-y-4">
             {place2 ? <ComparisonColumn place={place2} /> : <p>Invalid Place</p>}
           </div>
        </div>
      </div>
    </div>
  );
}
