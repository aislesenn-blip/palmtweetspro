"use client";

import React from 'react';
import { Wallet, TrendingUp, Info } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface FinancialCardProps {
  details?: Record<string, string>; // "Meal: $15", "Rent: $1200"
  countryCode: string;
  loading?: boolean;
}

export default function FinancialCard({ details, countryCode, loading }: FinancialCardProps) {
  if (loading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  // Standard IBAN lengths (simplified)
  const ibanLength = countryCode === 'GB' ? 22 : countryCode === 'FR' ? 27 : countryCode === 'DE' ? 22 : 'Varies';

  const hasData = details && Object.values(details).some(x => x !== null);

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="h-5 w-5 text-emerald-600" />
        <h3 className="font-medium text-gray-500">Financial & Cost</h3>
      </div>

      <div className="space-y-6">
        {/* Cost Index */}
        {hasData ? (
           <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Costs</p>
              {Object.entries(details!).map(([key, val]) => (
                 val && (
                   <div key={key} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-bold text-gray-900">{val}</span>
                   </div>
                 )
              ))}
           </div>
        ) : (
           <div className="bg-gray-50 p-4 rounded-xl text-center">
              <TrendingUp className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cost of Living data unavailable for this specific location.</p>
           </div>
        )}

        {/* Banking */}
        <div>
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Banking Standard</p>
           <div className="bg-emerald-50 p-3 rounded-xl flex justify-between items-center">
              <span className="text-sm text-emerald-800 font-medium">IBAN Format</span>
              <span className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-600 border border-emerald-100">
                 {countryCode}XX ({ibanLength} chars)
              </span>
           </div>
           <div className="flex gap-2 mt-2 text-[10px] text-gray-400">
               <Info className="h-3 w-3" />
               <span>Always verify with local banks.</span>
           </div>
        </div>
      </div>
    </div>
  );
}
