import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-gray-500">
      <div className="mx-auto max-w-7xl px-6">
        <p>&copy; {new Date().getFullYear()} Palmtweets. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-400">Global Location OS</p>
      </div>
    </footer>
  );
}
