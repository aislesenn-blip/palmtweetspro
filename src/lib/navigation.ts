export const locales = ['en', 'zh', 'es', 'ar', 'hi', 'fr', 'ru', 'pt', 'sw', 'ja'];
export const defaultLocale = 'en';

export function getLocalizedPath(path: string, locale: string) {
  // Remove existing locale prefix if present
  const segments = path.split('/').filter(Boolean);
  if (locales.includes(segments[0])) {
      segments.shift();
  }
  const cleanPath = segments.join('/');
  return `/${locale}/${cleanPath}`;
}
