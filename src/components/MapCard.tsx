import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapCard({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return <div className="h-96 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }
  return (
    <div className="h-96 w-full overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md relative">
       <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 flex flex-col items-center">
             <MapPin className="h-12 w-12 mb-2" />
             Map Placeholder
          </span>
       </div>
    </div>
  );
}
