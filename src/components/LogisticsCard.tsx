"use client";

import React from 'react';
import { Truck, Anchor, Train, Plane } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface LogisticsItem {
  name: string;
  distance: number;
}

interface LogisticsCardProps {
  lat: number;
  lng: number;
  postalCode?: string;
  ports?: LogisticsItem[];
  terminals?: LogisticsItem[];
  railways?: LogisticsItem[];
  loading?: boolean;
}

export default function LogisticsCard({ lat, lng, postalCode, ports, terminals, railways, loading }: LogisticsCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-green-500" />
        <h3 className="font-medium text-gray-500">Logistics</h3>
      </div>

      <div className="space-y-4">
         {/* Coords & Postal */}
         <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
            <div>
               <p className="text-xs text-gray-400 uppercase tracking-wide">Coordinates</p>
               <p className="font-mono text-sm font-bold text-gray-700">{lat.toFixed(3)}, {lng.toFixed(3)}</p>
            </div>
            <div className="text-right">
               <p className="text-xs text-gray-400 uppercase tracking-wide">Postal Code</p>
               <p className="font-mono text-sm font-bold text-gray-700">{postalCode || '---'}</p>
            </div>
         </div>

         {/* Infrastructure Lists */}
         <div className="space-y-3">
            {ports && ports.length > 0 && (
               <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                     <Anchor className="h-3 w-3" /> Ports
                  </div>
                  <ul className="text-sm space-y-1">
                     {ports.map((p, i) => (
                        <li key={i} className="flex justify-between">
                           <span className="truncate text-gray-700 max-w-[180px]">{p.name}</span>
                           <span className="text-gray-400 text-xs">{Math.round(p.distance)} km</span>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {railways && railways.length > 0 && (
               <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                     <Train className="h-3 w-3" /> Railways
                  </div>
                  <ul className="text-sm space-y-1">
                     {railways.map((r, i) => (
                        <li key={i} className="flex justify-between">
                           <span className="truncate text-gray-700 max-w-[180px]">{r.name}</span>
                           <span className="text-gray-400 text-xs">{Math.round(r.distance)} km</span>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {terminals && terminals.length > 0 && (
               <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                     <Plane className="h-3 w-3" /> Terminals
                  </div>
                   <ul className="text-sm space-y-1">
                     {terminals.map((t, i) => (
                        <li key={i} className="flex justify-between">
                           <span className="truncate text-gray-700 max-w-[180px]">{t.name}</span>
                           <span className="text-gray-400 text-xs">{Math.round(t.distance)} km</span>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {(!ports?.length && !railways?.length && !terminals?.length) && (
                <p className="text-xs text-gray-400 italic mt-2">No major infrastructure hubs detected nearby.</p>
            )}
         </div>
      </div>
    </div>
  );
}
