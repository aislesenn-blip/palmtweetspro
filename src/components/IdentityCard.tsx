"use client";

import React from 'react';
import { Flag, Users, Calendar, ExternalLink } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface IdentityCardProps {
  countryName: string;
  data?: {
      region: string;
      subregion: string;
      flags?: { svg: string };
      languages?: Record<string, string>;
      population?: number;
      holidays?: { date: string; name: string; localName: string }[];
  } | null;
  loading?: boolean;
}

export default function IdentityCard({ countryName, data, loading }: IdentityCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  const region = data?.region || 'Unknown Region';
  const subregion = data?.subregion || '';
  const flagUrl = data?.flags?.svg;
  const languages = data?.languages ? Object.values(data.languages).join(', ') : 'Unknown';
  const population = data?.population ? data.population.toLocaleString() : 'Unknown';

  const wikiLink = `https://en.wikipedia.org/wiki/${countryName.replace(/ /g, '_')}`;

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        {flagUrl ? (
            <img src={flagUrl} alt={`${countryName} flag`} className="h-6 w-auto rounded-sm shadow-sm" />
        ) : (
            <Flag className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-medium text-gray-500">Identity</h3>
      </div>

      <div className="space-y-1 mb-4">
        <div className="text-xl font-bold text-gray-900">{countryName}</div>
        <p className="text-gray-500">{region}</p>
        <p className="text-sm text-gray-400">{subregion}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 border-t border-gray-100 pt-4">
         <div>
             <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                 <Users className="h-3 w-3" /> Population
             </div>
             <p className="font-bold text-gray-800">{population}</p>
         </div>
         <div>
             <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                 <Flag className="h-3 w-3" /> Language
             </div>
             <p className="font-bold text-gray-800 truncate" title={languages}>{languages}</p>
         </div>
      </div>

      {/* Holidays */}
      {data?.holidays && data.holidays.length > 0 && (
          <div className="mb-4">
             <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                 <Calendar className="h-3 w-3" /> Upcoming Holidays
             </div>
             <ul className="space-y-2">
                {data.holidays.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex justify-between text-sm border-l-2 border-red-200 pl-2">
                        <span className="truncate max-w-[140px]" title={h.name}>{h.name}</span>
                        <span className="text-gray-400 text-xs whitespace-nowrap">{h.date}</span>
                    </li>
                ))}
             </ul>
          </div>
      )}

      {/* Authority Link */}
      <a href={wikiLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-sky-600 transition mt-auto">
          <ExternalLink className="h-3 w-3" />
          <span>Read more on Wikipedia</span>
      </a>
    </div>
  );
}
