import { getRequestConfig } from 'next-intl/server';

export const locales = ['ko', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !isLocale(locale)) {
    locale = 'ko';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
