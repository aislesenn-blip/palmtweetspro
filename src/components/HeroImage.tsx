"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface HeroImageProps {
  query: string;
  fallbackQuery?: string;
}

export default function HeroImage({ query, fallbackQuery }: HeroImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
          if (response.data && Array.isArray(response.data.results) && response.data.results.length > 0) {
            const url = response.data.results[0]?.urls?.regular;
            if (typeof url === 'string') {
                 setImageUrl(url);
            } else {
                 throw new Error("Invalid image URL format");
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
    <div className={`relative h-[400px] w-full overflow-hidden ${!imageUrl ? fallbackClass : 'bg-gray-900'}`}>
      {imageUrl && typeof imageUrl === 'string' && (
        <img
          src={imageUrl}
          alt={typeof query === 'string' ? `${query} travel` : 'Travel destination'}
          className={`h-full w-full object-cover transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-60'}`}
          onError={() => setImageUrl(null)} // Handle broken image links
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
  );
}
