"use client";

import React, { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from './SkeletonLoader';

interface LogisticsCardProps {
  lat: number;
  lng: number;
  loading?: boolean;
}

export default function LogisticsCard({ lat, lng, loading }: LogisticsCardProps) {
  const [postalCode, setPostalCode] = useState<string>('Fetching...');
  const [postalLoading, setPostalLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchPostal() {
      if (lat === undefined || lng === undefined) return;

      try {
        setPostalLoading(true);
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
          params: {
            lat: lat,
            lon: lng,
            format: 'json',
            zoom: 10
          }
        });

        if (mounted && response.data && response.data.address) {
           const pc = response.data.address.postcode;
           setPostalCode(pc || 'Not Available');
        } else {
           setPostalCode('Not Available');
        }
      } catch (e) {
        console.warn("Postal Fetch Error", e);
        if (mounted) setPostalCode('Unavailable');
      } finally {
        if (mounted) setPostalLoading(false);
      }
    }

    if (!loading) {
        fetchPostal();
    }

    return () => { mounted = false; };
  }, [lat, lng, loading]);

  if (loading) {
    return <SkeletonLoader className="h-48 w-full" />;
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-green-500" />
        <h3 className="font-medium text-gray-500">Logistics</h3>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">
           {lat.toFixed(2)}, {lng.toFixed(2)}
        </div>
        <p className="text-gray-500 mb-2">Coordinates</p>

        <div className="pt-2 border-t border-gray-100">
           <p className="text-sm font-semibold text-gray-900">
              Postal Code: <span className="font-normal text-gray-600">{postalLoading ? 'Loading...' : postalCode}</span>
           </p>
        </div>
      </div>
    </div>
  );
}
