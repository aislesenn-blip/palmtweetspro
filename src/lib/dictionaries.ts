import 'server-only';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  sw: () => import('@/dictionaries/sw.json').then((module) => module.default),
  pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
  fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
  de: () => import('@/dictionaries/en.json').then((module) => module.default), // Fallback for DE if not created
  zh: () => import('@/dictionaries/zh.json').then((module) => module.default),
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
  hi: () => import('@/dictionaries/hi.json').then((module) => module.default),
  ru: () => import('@/dictionaries/ru.json').then((module) => module.default),
  ja: () => import('@/dictionaries/ja.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  if (dictionaries[locale as keyof typeof dictionaries]) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  return dictionaries['en']();
};
