"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface HeroImageProps {
  query: string;
  fallbackQuery?: string;
}

export default function HeroImage({ query, fallbackQuery }: HeroImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback gradient (Production safe)
  const fallbackClass = "bg-gradient-to-r from-blue-900 to-indigo-900";

  useEffect(() => {
    let mounted = true;

    async function fetchImage(searchQuery: string, isFallback = false) {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

        // Environment Check - Fail gracefully if missing
        if (!accessKey) {
            console.warn("Unsplash: Key Missing - Rendering fallback.");
            if (mounted) setLoading(false);
            return;
        }

        // Sanity check query
        if (!searchQuery || typeof searchQuery !== 'string') {
            if (mounted) setLoading(false);
            return;
        }

        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: { query: searchQuery, orientation: 'landscape', per_page: 1 },
          headers: { Authorization: `Client-ID ${accessKey}` }
        });

        if (mounted) {
          const results = response.data?.results;
          if (Array.isArray(results) && results.length > 0) {
            const firstImage = results[0];
            const regularUrl = firstImage?.urls?.regular;

            // STRICT CHECK: Only set if it is strictly a string
            if (typeof regularUrl === 'string') {
                 setImageSrc(regularUrl);
            } else {
                 console.warn("Unsplash: Image found but URL is invalid/missing.");
            }
            setLoading(false);
          } else if (!isFallback && fallbackQuery) {
            fetchImage(fallbackQuery, true);
          } else {
            setLoading(false);
          }
        }
      } catch (e: any) {
        // ERROR TRAP: Never let fetch errors crash the UI
        console.warn("Unsplash Fetch Error (handled):", e.message);
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

  return (
    <div className={`relative h-[400px] w-full overflow-hidden ${!imageSrc ? fallbackClass : 'bg-gray-900'}`}>
      {imageSrc && typeof imageSrc === 'string' && (
        <img
          src={imageSrc}
          alt={typeof query === 'string' ? `${query} travel` : 'Travel destination'}
          className={`h-full w-full object-cover transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-60'}`}
          onError={() => setImageSrc(null)} // Handle broken image links
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
  );
}
