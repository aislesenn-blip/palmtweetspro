"use client";

import React, { useEffect, useState } from 'react';
import { Flag, AlertCircle } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface IdentityCardProps {
  countryName: string;
}

export default function IdentityCard({ countryName }: IdentityCardProps) {
  const [region, setRegion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!countryName) {
        if (mounted) {
           setError(true);
           setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}?fields=region`, { timeout: 5000 });
        if (mounted && response.data && response.data.length > 0) {
          setRegion(response.data[0]?.region ?? 'Unknown Region');
        } else {
           throw new Error("No country data");
        }
      } catch (e) {
        console.error("Client Identity Fetch Error", e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [countryName]);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  if (error) {
     return (
      <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">Region Unavailable</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Flag className="h-5 w-5 text-red-500" />
        <h3 className="font-medium text-gray-500">Identity</h3>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">{countryName ?? 'Unknown'}</div>
        <p className="text-gray-500">{region}</p>
      </div>
    </div>
  );
}
