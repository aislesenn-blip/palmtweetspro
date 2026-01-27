import React from 'react';
import { getPlaceBySlug } from '@/lib/db';
import { generateSpintaxDescription } from '@/lib/spintax';
import SchemaMarkup from '@/components/SchemaMarkup';
import Dashboard from '@/components/Dashboard';

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

  // 1. Fetch Core Place (Server-Side)
  const place = await getPlaceBySlug(slugStr);

  const displayName = place?.name || slugStr.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // 2. SEO Description (Spintax) - Partial data for SEO
  const description = place ? generateSpintaxDescription({
      name: place.name,
      country: place.country,
      timezone: place.description?.match(/Timezone: (.*)\)/)?.[1]
  }) : `Details about ${displayName}`;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-10">
      {place && (
        <SchemaMarkup
          place={place}
          weather={null}
          currency={null}
          idd={null}
          description={description}
        />
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{displayName}</h1>
        <p className="text-lg text-gray-500">{description}</p>
      </div>

      {place ? (
        <Dashboard initialPlace={place} />
      ) : (
        <div className="p-10 text-center">Place not found.</div>
      )}

      {/* Wiki is fetched client-side or we can keep server-side if essential.
          For Mini-Superapp, let's keep it simple or move to Dashboard too.
          Prompt didn't explicitly forbid SSR for Wiki, but for Zero-Failure, Client is safer.
          I'll leave it as a placeholder here or remove if unused.
          Actually, I'll remove the server fetch for wiki to comply with "Client-Side Fetching" mandate.
      */}
    </div>
  );
}
