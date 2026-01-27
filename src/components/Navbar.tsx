import React from 'react';
import { Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-2xl bg-white/70 px-6 py-3 shadow-sm backdrop-blur-md border border-white/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-black/10"></div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">Palmtweets</span>
          </div>

          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-full bg-gray-100/50 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Search places..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 hover:bg-black/5">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
