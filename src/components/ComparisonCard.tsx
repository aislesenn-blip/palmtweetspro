"use client";

import React, { useState } from 'react';
import { ArrowRightLeft, Search } from 'lucide-react';
import Link from 'next/link';
import SkeletonLoader from './SkeletonLoader';
import { useRouter } from 'next/navigation';

interface ComparisonCardProps {
  loading?: boolean;
}

export default function ComparisonCard({ loading }: ComparisonCardProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (loading) {
     return <SkeletonLoader className="h-48 w-full" />;
  }

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const targetSlug = query.trim().toLowerCase().replace(/\s+/g, '-');
      const currentPath = window.location.pathname.split('/');
      const currentCity = currentPath[currentPath.length - 1] || currentPath[currentPath.length - 2];
      router.push(`compare/${currentCity}-vs-${targetSlug}`);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="h-5 w-5 text-purple-500" />
        <h3 className="font-medium text-gray-500">Compare</h3>
      </div>

      <form onSubmit={handleCompare} className="relative">
        <input
          type="text"
          placeholder="Compare with (e.g. Tokyo)..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
      </form>

      <div className="mt-4 text-xs text-gray-400">
        Start a side-by-side comparison.
      </div>
    </div>
  );
}
