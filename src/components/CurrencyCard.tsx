"use client";

import React from 'react';
import { Banknote } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface CurrencyCardProps {
  data?: { currencies: Record<string, { name: string; symbol: string }> } | null;
  loading?: boolean;
}

export default function CurrencyCard({ data, loading }: CurrencyCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  let currencyDisplay = 'N/A';
  let currencyName = 'Unknown';

  if (data?.currencies) {
    const code = Object.keys(data.currencies)[0];
    if (code) {
      currencyDisplay = code;
      currencyName = `${data.currencies[code].name} (${data.currencies[code].symbol})`;
    }
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Banknote className="h-5 w-5 text-emerald-600" />
        <h3 className="font-medium text-gray-500">Currency</h3>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{currencyDisplay}</div>
        <p className="text-gray-500">{currencyName}</p>
      </div>
    </div>
  );
}
