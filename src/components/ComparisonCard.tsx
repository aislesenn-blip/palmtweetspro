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
      // Assuming current page is the "base" city, but we need to know it?
      // Actually, standard Compare URL is /compare/city1-vs-city2
      // The current page is /city1. So we just need to grab the current city slug from the URL or props.
      // But this component is generic.
      // Let's just navigate to a search page or assume we can construct it.
      // For now, simple input that redirects to a "vs" page.
      // Better UX: "Compare with..." input.
      // User types "Tokyo". We go to `current_url_slug-vs-tokyo`.
      // Getting current slug in client component: usePathname

      // Let's keep it simple: "Search for a city to compare".
      const targetSlug = query.trim().toLowerCase().replace(/\s+/g, '-');
      // We need the *current* city slug to form the URL.
      // We can get it from window location or props.
      // Let's rely on the user being on a city page.

      const currentPath = window.location.pathname.split('/');
      // /en/london -> london is last (or second to last if trailing slash)
      const currentCity = currentPath[currentPath.length - 1] || currentPath[currentPath.length - 2];

      router.push(`compare/${currentCity}-vs-${targetSlug}`);
    }
  };

  return (
    <div className="h-full w-full rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
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
