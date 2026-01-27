export const locales = ['en', 'sw', 'pt'];
export const defaultLocale = 'en';

export function getLocalizedPath(path: string, locale: string) {
  return `/${locale}${path.startsWith('/') ? '' : '/'}${path}`;
}
