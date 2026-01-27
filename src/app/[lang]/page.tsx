import Link from 'next/link';

export default function Page({ params: { lang } }: { params: { lang: string } }) {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <h1 className="mb-6 text-4xl font-bold">Welcome to Palmtweets</h1>
      <p className="mb-8 text-lg text-gray-500">Global Location OS</p>

      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold">Demo Cities</h2>
        <div className="flex flex-wrap gap-4">
          <Link href={`/${lang}/london`} className="text-blue-600 hover:underline">London</Link>
          <Link href={`/${lang}/tokyo`} className="text-blue-600 hover:underline">Tokyo</Link>
          <Link href={`/${lang}/new-york`} className="text-blue-600 hover:underline">New York</Link>
          <Link href={`/${lang}/arusha`} className="text-blue-600 hover:underline">Arusha</Link>
          <Link href={`/${lang}/nakilongosi`} className="text-blue-600 hover:underline">Nakilongosi</Link>
        </div>

        <h2 className="mt-8 text-2xl font-semibold">Comparisons</h2>
        <div className="flex flex-wrap gap-4">
           <Link href={`/${lang}/compare/london-vs-tokyo`} className="text-blue-600 hover:underline">London vs Tokyo</Link>
        </div>
      </div>
    </div>
  );
}
