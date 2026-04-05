import { getCollection } from 'astro:content';
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
  const normalized = id.replace(/\\/g, '/');
  const segment = normalized.split('/')[0];
  const found = locales.find(l => l.toLowerCase() === segment.toLowerCase());
  return (found && found !== defaultLocale) ? found : defaultLocale;
}

/** Strip the locale prefix from a content ID to get the bare slug. */
export function getContentSlug(id: string): string {
  const normalized = id.replace(/\\/g, '/');
  const parts = normalized.split('/');
  const isLocalePrefix = parts.length > 1 &&
    locales.some(l => l.toLowerCase() === parts[0].toLowerCase() && l !== defaultLocale);
  return (isLocalePrefix ? parts.slice(1).join('/') : normalized).replace(/\.mdx?$/, '');
}

type Subject = 'maths' | 'science' | 'finance' | 'filmmaking';

/** Returns articles anchored to the English set, substituting locale translations where available. */
export async function getLocaleArticles(locale: Locale, options?: { subject?: Subject; limit?: number }) {
  const all = await getCollection('articles', a => !a.data.draft);
  let english = all
    .filter(a => getContentLocale(a.id) === 'en')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  if (options?.subject) english = english.filter(a => a.data.subjects.includes(options.subject!));
  if (options?.limit)   english = english.slice(0, options.limit);

  return english.map(enEntry => {
    const slug = getContentSlug(enEntry.id);
    return all.find(a => getContentLocale(a.id) === locale && getContentSlug(a.id) === slug) ?? enEntry;
  });
}

/** Returns apps anchored to the English set, substituting locale translations where available. */
export async function getLocaleApps(locale: Locale, options?: { subject?: Subject }) {
  const all = await getCollection('apps');
  const english = all.filter(
    a => getContentLocale(a.id) === 'en' &&
    (!options?.subject || a.data.subjects?.includes(options.subject))
  );

  return english.map(enEntry => {
    const slug = getContentSlug(enEntry.id);
    return all.find(a => getContentLocale(a.id) === locale && getContentSlug(a.id) === slug) ?? enEntry;
  });
}

/** Returns projects anchored to the English set, substituting locale translations where available. */
export async function getLocaleProjects(locale: Locale, options?: { subject?: Subject }) {
  const all = await getCollection('projects');
  let english = all
    .filter(p => getContentLocale(p.id) === 'en')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  if (options?.subject) english = english.filter(p => p.data.subjects?.includes(options.subject!));

  return english.map(enEntry => {
    const slug = getContentSlug(enEntry.id);
    return all.find(p => getContentLocale(p.id) === locale && getContentSlug(p.id) === slug) ?? enEntry;
  });
}
