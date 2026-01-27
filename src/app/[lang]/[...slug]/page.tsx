import React from 'react';
import { getPlaceBySlug } from '@/lib/db';
import { generateSpintaxDescription } from '@/lib/spintax';
import SchemaMarkup from '@/components/SchemaMarkup';
import Dashboard from '@/components/Dashboard';
import HeroImage from '@/components/HeroImage';

// WikiSection component removed as it is now integrated into QuickFactsCard

export default async function Page({ params }: { params: { lang: string; slug: string[] } }) {
  const slugStr = params.slug.join('/');

  const place = await getPlaceBySlug(slugStr);

  const displayName = place?.name || slugStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const description = place ? generateSpintaxDescription({
      name: place.name,
      country: place.country,
      timezone: place.description?.match(/Timezone: (.*)\)/)?.[1]
  }) : `Details about ${displayName}`;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {place && (
        <SchemaMarkup
          place={place}
          weather={null}
          currency={null}
          idd={null}
          description={description}
        />
      )}

      {/* Hero Header */}
      <div className="relative">
         <HeroImage query={place ? `${place.name} ${place.country} travel` : displayName} fallbackQuery={place?.country} />
         <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 mx-auto max-w-7xl">
            <h1 className="text-5xl font-bold text-white shadow-black drop-shadow-lg">{displayName}</h1>
            <p className="text-xl text-gray-200 mt-2 drop-shadow-md max-w-2xl">{description}</p>
         </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 -mt-8 relative z-10">
        {place ? (
          <Dashboard initialPlace={place} />
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl">Place not found.</div>
        )}
      </div>
    </div>
  );
}
