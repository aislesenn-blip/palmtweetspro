"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface HeroImageProps {
  query: string;
}

export default function HeroImage({ query }: HeroImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchImage() {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            console.warn("Unsplash Key missing");
            setLoading(false);
            return;
        }

        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: { query, orientation: 'landscape', per_page: 1 },
          headers: { Authorization: `Client-ID ${accessKey}` }
        });

        if (mounted && response.data.results.length > 0) {
          setImageUrl(response.data.results[0].urls.regular);
        }
      } catch (e) {
        console.error("Unsplash Fetch Error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (query) fetchImage();
    return () => { mounted = false; };
  }, [query]);

  // Gradient Fallback
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
      {!imageUrl && !loading && (
         <div className="absolute inset-0 bg-black/30"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
  );
}
