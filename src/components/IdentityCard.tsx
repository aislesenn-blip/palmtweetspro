import React from 'react';
import { Flag } from 'lucide-react';

export default function IdentityCard({
  loading = false,
  country
}: {
  loading?: boolean,
  country?: string
}) {
  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }
  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Flag className="h-5 w-5 text-red-500" />
        <h3 className="font-medium text-gray-500">Identity</h3>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">{country || 'Unknown'}</div>
        <p className="text-gray-500">Global Region</p>
      </div>
    </div>
  );
}
