"use client";

import React, { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import axios from 'axios';

interface IdentityCardProps {
  countryName: string;
}

export default function IdentityCard({ countryName }: IdentityCardProps) {
  const [region, setRegion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}?fields=region`);
        if (mounted && response.data.length > 0) {
          setRegion(response.data[0].region);
        }
      } catch (e) {
        console.error("Client Identity Fetch Error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [countryName]);

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
        <div className="text-xl font-bold text-gray-900">{countryName}</div>
        <p className="text-gray-500">{region || 'Unknown Region'}</p>
      </div>
    </div>
  );
}
