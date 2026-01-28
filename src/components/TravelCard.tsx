"use client";

import React from 'react';
import { Plane, ExternalLink, Car, PersonStanding, Bike } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface Airport {
  name: string;
  iata: string;
  distance: number;
}

interface TravelMetrics {
  driveTime?: string;
  walkTime?: string;
  cycleTime?: string;
  flightTime?: string;
  airDistance?: number;
  driveDistance?: number;
}

interface TravelCardProps {
  airports: Airport[];
  metrics?: TravelMetrics | null;
  comparisonMode?: boolean;
  cityName: string;
  countryName: string;
  loading?: boolean;
}

export default function TravelCard({ airports, metrics, comparisonMode, cityName, countryName, loading }: TravelCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Plane className="h-5 w-5 text-sky-500" />
        <h3 className="font-medium text-gray-500">Travel & Distance</h3>
      </div>

      <div className="space-y-6">
        {/* Comparison Logic */}
        {comparisonMode && metrics && (
           <div className="bg-sky-50 p-4 rounded-xl mb-4">
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">Estimates</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                      <span className="text-xs text-gray-500 block">Air Distance</span>
                      <span className="font-bold text-gray-900">{metrics.airDistance ? Math.round(metrics.airDistance) : '-'} km</span>
                      <span className="text-xs text-sky-500 block mt-1">Flight: ~{metrics.flightTime}</span>
                  </div>
                  {metrics.driveDistance && (
                      <div>
                          <span className="text-xs text-gray-500 block">Road Distance</span>
                          <span className="font-bold text-gray-900">{Math.round(metrics.driveDistance)} km</span>
                      </div>
                  )}
              </div>

              <div className="flex justify-between items-center border-t border-sky-100 pt-3">
                 <div className="text-center">
                    <Car className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-800">{metrics.driveTime || 'N/A'}</span>
                 </div>
                 <div className="text-center">
                    <Bike className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-800">{metrics.cycleTime || 'N/A'}</span>
                 </div>
                 <div className="text-center">
                    <PersonStanding className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-gray-800">{metrics.walkTime || 'N/A'}</span>
                 </div>
              </div>
           </div>
        )}

        {/* Airports */}
        <div>
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nearest Airports</p>
           {airports.length > 0 ? (
             <ul className="space-y-3">
               {airports.map((ap, i) => {
                   const flightTime = (ap.distance / 850).toFixed(1) + 'h';
                   return (
                     <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                        <div>
                           <span className="font-bold text-gray-900 block">{ap.iata || '---'}</span>
                           <span className="text-gray-500 text-xs truncate max-w-[120px] block" title={ap.name}>{ap.name}</span>
                        </div>
                        <div className="text-right">
                           <span className="block font-medium text-gray-700">{ap.distance.toFixed(0)} km</span>
                           <span className="text-xs text-gray-400">~{flightTime} flight</span>
                        </div>
                     </li>
                   );
               })}
             </ul>
           ) : (
             <p className="text-sm text-gray-500 italic">No major international airport nearby (100km+)</p>
           )}
        </div>

        {/* Action */}
        <a
          href={`https://www.google.com/flights?q=flights+to+${cityName}+${countryName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition text-sm mt-4"
        >
           <ExternalLink className="h-4 w-4" />
           Check Live Fares
        </a>
      </div>
    </div>
  );
}
