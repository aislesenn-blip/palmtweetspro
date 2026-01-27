import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComparisonCard({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return <div className="h-48 w-full animate-pulse rounded-3xl bg-gray-200"></div>;
  }
  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-5 w-5 text-purple-500" />
        <h3 className="font-medium text-gray-500">Compare</h3>
      </div>
      <div className="mt-4">
        <p className="mb-4 text-gray-500">Compare this location with others.</p>
        <Link href="#" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
          Start Comparison
        </Link>
      </div>
    </div>
  );
}
