import React from 'react';
import { getPlaceBySlug } from '@/lib/db';
import WeatherCard from '@/components/WeatherCard';

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
             <WeatherCard />
           </div>
        </div>
        <div>
           <h2 className="text-xl font-bold mb-4">{place2?.name || slug2}</h2>
           <div className="space-y-4">
             <WeatherCard />
           </div>
        </div>
      </div>
    </div>
  );
}
