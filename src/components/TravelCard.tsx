"use client";

import React from 'react';
import { Plane, ExternalLink, Route } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import { calculateFlightTime } from '@/lib/distance';

interface Airport {
  name: string;
  iata: string;
  distance: number;
}

interface TravelCardProps {
  airports: Airport[];
  airDistance?: number; // Made optional
  comparisonMode?: boolean;
  distanceToOther?: number;
  cityName: string;
  countryName: string;
  loading?: boolean;
}

export default function TravelCard({ airports, comparisonMode, distanceToOther, cityName, countryName, loading }: TravelCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  const flightTime = distanceToOther ? calculateFlightTime(distanceToOther) : null;

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Plane className="h-5 w-5 text-sky-500" />
        <h3 className="font-medium text-gray-500">Travel & Distance</h3>
      </div>

      <div className="space-y-6">
        {/* Comparison Logic */}
        {comparisonMode && distanceToOther && (
           <div className="bg-sky-50 p-4 rounded-xl mb-4">
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">Direct Connection</p>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-600">Air Distance</span>
                 <span className="text-lg font-bold text-gray-900">{Math.round(distanceToOther)} km</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-600">Est. Flight Time</span>
                 <span className="text-lg font-bold text-gray-900">{flightTime}</span>
              </div>
              <p className="text-[10px] text-sky-400 mt-2 text-right">Based on 850km/h avg</p>
           </div>
        )}

        {/* Airports */}
        <div>
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nearest Airports</p>
           {airports.length > 0 ? (
             <ul className="space-y-3">
               {airports.map((ap, i) => (
                 <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div>
                       <span className="font-bold text-gray-900 block">{ap.iata || '---'}</span>
                       <span className="text-gray-500 text-xs truncate max-w-[120px] block" title={ap.name}>{ap.name}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs whitespace-nowrap">
                       {ap.distance.toFixed(1)} km
                    </span>
                 </li>
               ))}
             </ul>
           ) : (
             <p className="text-sm text-gray-500 italic">No major international airport nearby (200km+)</p>
           )}
        </div>

        {/* Action */}
        <a
          href={`https://www.google.com/flights?q=flights+to+${cityName}+${countryName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
           <ExternalLink className="h-4 w-4" />
           Check Live Fares
        </a>
      </div>
    </div>
  );
}
