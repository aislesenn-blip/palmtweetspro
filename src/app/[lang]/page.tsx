import Link from 'next/link';
import HeroSearch from './HeroSearch';

export default function Page({ params: { lang } }: { params: { lang: string } }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mb-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           System Status: Indexing 11,000,000+ Data Points
        </div>

        <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900 max-w-4xl">
          The World's Location Operating System
        </h1>

        <p className="mb-10 text-xl text-gray-500 max-w-2xl">
          Instant access to Postal Codes, Weather, Time, Currency, and Telecom Data for 11 Million+ Locations.
        </p>

        <p className="mb-8 text-lg font-medium text-gray-400">
           Get to know any place in 5 seconds.
        </p>

        {/* Hero Search */}
        <HeroSearch lang={lang} />
      </div>

      {/* Trust Signals / Footer Links */}
      <div className="grid gap-8 border-t pt-10">
         <h2 className="text-2xl font-semibold text-gray-900">Featured Locations</h2>
         <div className="flex flex-wrap gap-4">
            <Link href={`/${lang}/london`} className="text-blue-600 hover:underline">London</Link>
            <Link href={`/${lang}/tokyo`} className="text-blue-600 hover:underline">Tokyo</Link>
            <Link href={`/${lang}/new-york`} className="text-blue-600 hover:underline">New York</Link>
            <Link href={`/${lang}/rio-de-janeiro`} className="text-blue-600 hover:underline">Rio de Janeiro</Link>
            <Link href={`/${lang}/sydney`} className="text-blue-600 hover:underline">Sydney</Link>
         </div>

         <h2 className="text-2xl font-semibold text-gray-900 mt-8">Global Intelligence</h2>
         <div className="flex flex-wrap gap-4">
            <Link href={`/${lang}/compare/london-vs-tokyo`} className="text-blue-600 hover:underline">Compare: London vs Tokyo</Link>
         </div>
      </div>
    </div>
  );
}
