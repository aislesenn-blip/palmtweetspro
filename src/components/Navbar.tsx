"use client";

import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const params = useParams();

  // Handle language from params, default to 'en'
  const lang = (params?.lang as string) || 'en';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const slug = query.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/${lang}/${slug}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex flex-col rounded-2xl bg-white/70 px-6 py-3 shadow-sm backdrop-blur-md border border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/${lang}`)}>
              <div className="h-8 w-8 rounded-full bg-black/10"></div>
              <span className="text-lg font-semibold tracking-tight text-gray-900">Palmtweets</span>
            </div>

            {/* Desktop Search */}
            <div className="hidden flex-1 items-center justify-center px-8 md:flex">
              <form onSubmit={handleSearch} className="relative w-full max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full rounded-full bg-gray-100/50 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Search places..."
                />
              </form>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full p-2 hover:bg-black/5 md:hidden"
              >
                {isOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu & Search */}
          {isOpen && (
            <div className="mt-4 flex flex-col gap-4 md:hidden pb-2">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full rounded-full bg-gray-100/50 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Search globally..."
                  autoFocus
                />
              </form>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                 <a href={`/${lang}/london`} className="p-2 hover:bg-gray-100 rounded-lg">London</a>
                 <a href={`/${lang}/tokyo`} className="p-2 hover:bg-gray-100 rounded-lg">Tokyo</a>
                 <a href={`/${lang}/new-york`} className="p-2 hover:bg-gray-100 rounded-lg">New York</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
