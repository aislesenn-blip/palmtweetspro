"use client";

import React from 'react';
import { Phone } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface TelecomCardProps {
  data?: { idd: { root: string; suffixes: string[] } } | null;
  loading?: boolean;
}

export default function TelecomCard({ data, loading }: TelecomCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  const root = data?.idd?.root || '';
  const suffix = data?.idd?.suffixes?.[0] || '';
  const dialCode = root + suffix || 'N/A';

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Phone className="h-5 w-5 text-indigo-500" />
        <h3 className="font-medium text-gray-500">Telecom</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{dialCode}</div>
        <p className="text-gray-500">International Dialing Code</p>
      </div>
    </div>
  );
}
