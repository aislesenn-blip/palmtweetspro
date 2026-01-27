"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSearch({ lang }: { lang: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/${lang}/${slug}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full rounded-full border-0 bg-white py-6 pl-16 pr-6 text-xl text-gray-900 shadow-xl placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
        placeholder="e.g., Rio de Janeiro, Brazil, 20000..."
        autoFocus
      />
    </form>
  );
}
