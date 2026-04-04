import { ui, defaultLocale, locales, languages, type Locale } from './ui';

export { type Locale, defaultLocale, locales, languages };

export function useTranslations(locale: Locale) {
  return function t(key: keyof typeof ui[typeof defaultLocale]): string {
    return ((ui[locale] as Record<string, string>)[key]) ?? ui[defaultLocale][key];
  };
}

/** Map a locale to a BCP 47 tag for Intl / html lang */
export const localeToBcp47: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  ja: 'ja-JP',
};

/** Extract the locale prefix from a URL path, defaulting to 'en'. */
export function getLocaleFromPath(path: string): Locale {
  const first = path.split('/').filter(Boolean)[0];
  return (locales as readonly string[]).includes(first) && first !== 'en'
    ? (first as Locale)
    : defaultLocale;
}

/** Strip the locale prefix from a path. */
export function stripLocale(path: string): string {
  const first = path.split('/').filter(Boolean)[0];
  if ((locales as readonly string[]).includes(first) && first !== 'en') {
    return path.replace(`/${first}`, '') || '/';
  }
  return path;
}

/** Build a locale-prefixed path. English has no prefix (prefixDefaultLocale: false). */
export function localePath(path: string, locale: Locale): string {
  const clean = stripLocale(path);
  if (locale === defaultLocale) return clean || '/';
  return `/${locale}${clean === '/' ? '' : clean}`;
}

/** Return the locale prefix embedded in a content ID, or 'en' if none. */
export function getContentLocale(id: string): Locale {
  const match = id.match(/^([a-z]{2}(?:-[A-Z]{2})?)\//);
  return match ? (match[1] as Locale) : 'en';
}

/** Strip the locale prefix from a content ID to get the bare slug. */
export function getContentSlug(id: string): string {
  return id.replace(/^[a-z]{2}(?:-[A-Z]{2})?\//, '').replace(/\.mdx?$/, '');
}
