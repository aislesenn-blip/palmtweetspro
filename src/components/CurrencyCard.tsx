"use client";

import React, { useState, useEffect } from 'react';
import { Banknote, ArrowRightLeft } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

interface CurrencyCardProps {
  data?: { currencies: Record<string, { name: string; symbol: string }> } | null;
  rates?: Record<string, number> | null;
  loading?: boolean;
}

export default function CurrencyCard({ data, rates, loading }: CurrencyCardProps) {
  const [amount, setAmount] = useState<string>('1');
  const [converted, setConverted] = useState<string>('...');
  const [currencyCode, setCurrencyCode] = useState<string>('USD');

  // Detect currency code from data
  useEffect(() => {
    if (data?.currencies) {
      const code = Object.keys(data.currencies)[0];
      if (code) setCurrencyCode(code);
    }
  }, [data]);

  // Conversion Logic
  useEffect(() => {
    if (rates && currencyCode && amount) {
      const rate = rates[currencyCode];
      const usdAmount = parseFloat(amount);
      if (rate && !isNaN(usdAmount)) {
        // Rate is USD base -> Local. So 1 USD = rate Local.
        // We want to convert Local Amount to USD? Or USD to Local?
        // Prompt says: "convert from the local currency to USD (and vice-versa)".
        // Let's assume standard: Input USD -> Output Local for travel utility.
        // Or better: show the rate `1 USD = X Local`.
        // And an input for "Amount in USD".

        const val = (usdAmount * rate).toFixed(2);
        setConverted(`${val} ${currencyCode}`);
      }
    }
  }, [rates, currencyCode, amount]);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  let currencyName = 'Unknown';
  let symbol = '$';

  if (data?.currencies && currencyCode) {
      currencyName = data.currencies[currencyCode]?.name || currencyCode;
      symbol = data.currencies[currencyCode]?.symbol || '$';
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Banknote className="h-5 w-5 text-emerald-600" />
        <h3 className="font-medium text-gray-500">Currency Converter</h3>
      </div>

      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between text-sm text-gray-500">
            <span>1 USD = {rates ? rates[currencyCode]?.toFixed(2) : '...'} {currencyCode}</span>
         </div>

         <div className="relative">
            <label className="text-xs text-gray-400 font-semibold uppercase">Amount (USD)</label>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-gray-500">$</span>
               <input
                 type="number"
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 className="w-full border-b border-gray-200 py-1 focus:outline-none focus:border-emerald-500 font-bold text-gray-900"
               />
            </div>
         </div>

         <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl">
            <ArrowRightLeft className="h-4 w-4" />
            <span className="font-bold text-lg">{converted}</span>
         </div>

         <p className="text-xs text-gray-400">{currencyName}</p>
      </div>
    </div>
  );
}
