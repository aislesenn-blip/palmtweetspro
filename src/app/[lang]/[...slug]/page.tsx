import React from 'react';
import { fetchLocationData } from '@/lib/data';
import { generateSpintaxDescription } from '@/lib/spintax';
import SchemaMarkup from '@/components/SchemaMarkup';
import WeatherCard from '@/components/WeatherCard';
import TimeCard from '@/components/TimeCard';
import LogisticsCard from '@/components/LogisticsCard';
import MapCard from '@/components/MapCard';
import IdentityCard from '@/components/IdentityCard';
import ComparisonCard from '@/components/ComparisonCard';

function WikiSection({ content, title }: { content: string | null, title: string }) {
  if (!content) return null;
  return (
    <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
       <h2 className="mb-4 text-2xl font-bold text-gray-900">About {title}</h2>
       <div className="prose text-gray-600">
         <p>{content}</p>
       </div>
       <div className="mt-4 border-t pt-4 text-sm text-gray-500">
         <p>
           Source: <a href={`https://en.wikipedia.org/wiki/${title}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wikipedia</a> (CC-BY-SA)
         </p>
       </div>
    </div>
  );
}

export default async function Page({ params }: { params: { lang: string; slug: string[] } }) {
  const slugStr = params.slug.join('/');

  // Best-effort SSR for SEO/Schema, but UI will re-fetch or use props.
  const { place, weather, currency, idd, wiki } = await fetchLocationData(slugStr);

  const displayName = place?.name || slugStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Spintax for SEO description
  const description = place ? generateSpintaxDescription({
      name: place.name,
      country: place.country,
      weather: weather?.weatherCode !== undefined ? 'variable' : undefined,
      timezone: place.description?.match(/Timezone: (.*)\)/)?.[1]
  }) : `Details about ${displayName}`;

  return (
    <div className="mx-auto max-w-7xl px-6">
      {place && (
        <SchemaMarkup
          place={place}
          weather={weather}
          currency={currency}
          idd={idd}
          description={description}
        />
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
        <p className="text-lg text-gray-500">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Client Components for UI Reliability */}
        {place && (
          <>
            <WeatherCard lat={place.latitude} lng={place.longitude} />
            <TimeCard lat={place.latitude} lng={place.longitude} />
            <LogisticsCard lat={place.latitude} lng={place.longitude} countryName={place.country} />
            <div className="lg:col-span-2">
               <MapCard />
            </div>
            <IdentityCard countryName={place.country} />
            <ComparisonCard />
          </>
        )}
      </div>

      <WikiSection content={wiki} title={displayName} />
    </div>
  );
}
