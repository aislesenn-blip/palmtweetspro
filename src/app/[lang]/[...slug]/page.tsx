import React from 'react';
import { getPlaceBySlug, getWeather } from '@/lib/db';
import WeatherCard from '@/components/WeatherCard';
import TimeCard from '@/components/TimeCard';
import LogisticsCard from '@/components/LogisticsCard';
import MapCard from '@/components/MapCard';
import IdentityCard from '@/components/IdentityCard';
import ComparisonCard from '@/components/ComparisonCard';

export default async function Page({ params }: { params: { lang: string; slug: string[] } }) {
  const slugStr = params.slug.join('/');

  // This will now auto-init DB and fetch from API if needed
  const place = await getPlaceBySlug(slugStr);

  let weather = null;
  if (place) {
    weather = await getWeather(place.latitude, place.longitude);
  }

  // Format a fallback title if place is missing (though getPlaceBySlug should try its best)
  const displayName = place?.name || slugStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
        <p className="text-lg text-gray-500">{place?.country || place?.description || 'Details unavailable'}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WeatherCard
          temperature={weather?.temperature}
          weatherCode={weather?.weatherCode}
        />
        <TimeCard
          time={weather?.time}
          // OpenMeteo gives us time, but not timezone name directly in "current",
          // but we can assume local time is what we got.
          // Or we could fetch timezone info. For now, let's just pass the time.
          timezone={place?.description?.match(/Timezone: (.*)\)/)?.[1]}
        />
        <LogisticsCard
          lat={place?.latitude}
          lng={place?.longitude}
        />
        <div className="lg:col-span-2">
           <MapCard />
        </div>
        <IdentityCard country={place?.country} />
        <ComparisonCard />
      </div>
    </div>
  );
}
