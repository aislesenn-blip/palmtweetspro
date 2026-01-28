"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface WhatToExpectProps {
  cityName: string;
  population?: number;
  costLevel?: 'Low' | 'Medium' | 'High' | 'Very High' | string;
  language?: string;
  temp?: number;
  loading?: boolean;
}

export default function WhatToExpectCard({ cityName, population, costLevel, language, temp, loading }: WhatToExpectProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  // Synthesis Logic
  const density = population && population > 5000000 ? "bustling, high-density metropolis" :
                  population && population > 1000000 ? "large urban center" :
                  population && population > 100000 ? "moderately sized city" : "quiet town";

  const weatherVibe = temp !== undefined ? (
      temp > 25 ? "warm and sunny atmosphere" :
      temp < 10 ? "crisp, cool environment" : "mild and comfortable climate"
  ) : "pleasant atmosphere";

  const costVibe = costLevel ? `Living costs are considered ${costLevel}.` : "";
  const langVibe = language ? `${language} is primarily spoken.` : "Local languages are widely used.";

  const narrative = `Expect a ${density} with a ${weatherVibe}. ${costVibe} ${langVibe}`;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 p-6 shadow-md text-white">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-200" />
        <h3 className="font-medium text-purple-100 opacity-90">Vibe Check</h3>
      </div>

      <p className="text-xl font-medium leading-relaxed opacity-95">
        "{narrative}"
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
         {population && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">Pop: {(population/1000000).toFixed(1)}M</span>}
         {costLevel && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">Cost: {costLevel}</span>}
         {temp !== undefined && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">{temp}°C</span>}
      </div>
    </div>
  );
}
