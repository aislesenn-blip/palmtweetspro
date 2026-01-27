import 'server-only';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  sw: () => import('@/dictionaries/sw.json').then((module) => module.default),
  pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  if (dictionaries[locale as keyof typeof dictionaries]) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  return dictionaries['en']();
};
