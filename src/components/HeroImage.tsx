"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface HeroImageProps {
  query: string;
  fallbackQuery?: string;
}

export default function HeroImage({ query, fallbackQuery }: HeroImageProps) {
  // Rename state to be extremely clear it's a URL string
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback gradient (Production safe)
  const fallbackClass = "bg-gradient-to-r from-blue-900 to-indigo-900";

  useEffect(() => {
    let mounted = true;

    async function fetchImage(searchQuery: string, isFallback = false) {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

        if (!accessKey) {
            if (mounted) setLoading(false);
            return;
        }

        if (!searchQuery || typeof searchQuery !== 'string') {
            if (mounted) setLoading(false);
            return;
        }

        // Use fetch instead of axios to be consistent with rest of app updates (though client-side axios is fine)
        // Sticking to axios as it is already imported and working for client.
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: { query: searchQuery, orientation: 'landscape', per_page: 1 },
          headers: { Authorization: `Client-ID ${accessKey}` }
        });

        if (mounted) {
          // Extra defensive extraction
          const results = response.data?.results;
          if (Array.isArray(results) && results.length > 0) {
            const firstResult = results[0];
            const regular = firstResult?.urls?.regular;
            const small = firstResult?.urls?.small;

            // Prioritize regular, fallback to small, ensure STRING
            const validUrl = (typeof regular === 'string' && regular) || (typeof small === 'string' && small) || null;

            if (validUrl) {
                 setBgImageUrl(validUrl);
            }

            setLoading(false);
          } else if (!isFallback && fallbackQuery) {
            fetchImage(fallbackQuery, true);
          } else {
            setLoading(false);
          }
        }
      } catch (e: any) {
        console.warn("Unsplash handled error");
        if (mounted) setLoading(false);
      }
    }

    if (query) {
        fetchImage(query);
    } else {
        setLoading(false);
    }

    return () => { mounted = false; };
  }, [query, fallbackQuery]);

  const safeAlt = typeof query === 'string' ? `${query} travel` : 'Travel destination';

  return (
    <div className={`relative h-[400px] w-full overflow-hidden ${!bgImageUrl ? fallbackClass : 'bg-gray-900'}`}>
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          alt={safeAlt}
          className={`h-full w-full object-cover transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-60'}`}
          onError={() => setBgImageUrl(null)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
  );
}
