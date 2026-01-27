import React from 'react';
import { Truck } from 'lucide-react';

export default function LogisticsCard({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }
  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-green-500" />
        <h3 className="font-medium text-gray-500">Logistics</h3>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-900">Zip: 12345</div>
        <p className="text-gray-500">Express Delivery Available</p>
      </div>
    </div>
  );
}
