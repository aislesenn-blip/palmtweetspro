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

  useEffect(() => {
    let mounted = true;

    async function fetchImage(searchQuery: string, isFallback = false) {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            console.error("Unsplash: Key Missing");
            if (mounted) setLoading(false);
            return;
        }

        console.log(`Unsplash: Searching for "${searchQuery}"...`);
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: { query: searchQuery, orientation: 'landscape', per_page: 1 },
          headers: { Authorization: `Client-ID ${accessKey}` }
        });

        if (mounted) {
          if (response.data.results.length > 0) {
            console.log("Unsplash: Found image.");
            setImageUrl(response.data.results[0].urls.regular);
            setLoading(false);
          } else if (!isFallback && fallbackQuery) {
            console.warn("Unsplash: No results. Trying fallback:", fallbackQuery);
            fetchImage(fallbackQuery, true);
          } else {
            console.warn("Unsplash: No results found (even with fallback).");
            setLoading(false);
          }
        }
      } catch (e: any) {
        console.error("Unsplash Fetch Error:", e.response?.status, e.message);
        if (mounted) setLoading(false);
      }
    }

    if (query) {
        fetchImage(query);
    }

    return () => { mounted = false; };
  }, [query, fallbackQuery]);

  const fallback = "bg-gradient-to-r from-blue-900 to-indigo-900";

  return (
    <div className={`relative h-[400px] w-full overflow-hidden ${!imageUrl ? fallback : 'bg-gray-900'}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${query} travel destination`}
          className={`h-full w-full object-cover transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-60'}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
  );
}
