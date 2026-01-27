"use client";

import React from 'react';
import { Flag } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface IdentityCardProps {
  countryName: string;
  data?: { region: string; subregion: string; flags?: { svg: string }; languages?: Record<string, string> } | null;
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

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        {flagUrl ? (
            <img src={flagUrl} alt={`${countryName} flag`} className="h-6 w-auto rounded-sm shadow-sm" />
        ) : (
            <Flag className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-medium text-gray-500">Identity</h3>
      </div>

      <div className="space-y-1">
        <div className="text-xl font-bold text-gray-900">{countryName}</div>
        <p className="text-gray-500">{region}</p>
        <p className="text-sm text-gray-400">{subregion}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
         <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Official Language</p>
         <p className="text-sm text-gray-700">{languages}</p>
      </div>
    </div>
  );
}
