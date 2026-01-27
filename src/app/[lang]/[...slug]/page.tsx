import React from 'react';
import { getPlaceBySlug } from '@/lib/db';
import WeatherCard from '@/components/WeatherCard';
import TimeCard from '@/components/TimeCard';
import LogisticsCard from '@/components/LogisticsCard';
import MapCard from '@/components/MapCard';
import IdentityCard from '@/components/IdentityCard';
import ComparisonCard from '@/components/ComparisonCard';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { lang: string; slug: string[] } }) {
  const slugStr = params.slug.join('/');
  const place = await getPlaceBySlug(slugStr);

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{place?.name || slugStr}</h1>
        <p className="text-lg text-gray-500">{place?.country || 'Details unavailable'}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WeatherCard />
        <TimeCard />
        <LogisticsCard />
        <div className="lg:col-span-2">
           <MapCard />
        </div>
        <IdentityCard />
        <ComparisonCard />
      </div>
    </div>
  );
}
