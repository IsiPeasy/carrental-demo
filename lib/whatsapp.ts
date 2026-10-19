// Builds the pre-filled WhatsApp message. Shared by every style.
// Always show the text (buildMessage) to the user before the wa.me click.

import { CONTACTS, carById, carName, cityById, type Locale } from './data';
import { translate } from './i18n';
import { formatEUR, type Estimate } from './pricing';
import type { BuilderState } from './store';

export function formatDate(iso: string | null, locale: Locale): string {
  if (!iso) return '[…]';
  const d = new Date(iso + 'T12:00:00');
  return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function buildMessage(s: BuilderState, est: Estimate, locale: Locale): string {
  const t = (k: string, v?: Record<string, string | number>) => translate(locale, k, v);
  const car = carById(s.carId);
  const city = cityById(s.cityId);
  const ret = cityById(s.returnCityId);
  const lines: string[] = [t('wa.hello'), ''];

  lines.push(`• ${t('wa.car')}: ${car ? carName(car) : '[…]'}`);
  lines.push(
    `• ${t('wa.city')}: ${city ? city.name[locale] : '[…]'}${
      s.deliveryType ? ` · ${t(`deliveryTypes.${s.deliveryType}`)}` : ''
    }`,
  );
  lines.push(`• ${t('wa.returnAt')}: ${ret && ret.id !== city?.id ? ret.name[locale] : t('wa.same')}`);
  lines.push(
    `• ${t('wa.dates')}: ${formatDate(s.dateFrom, locale)} → ${formatDate(s.dateTo, locale)}${
      est.days ? ` (${est.days === 1 ? t('builder.dates.day') : t('builder.dates.days', { n: est.days })})` : ''
    }`,
  );
  if (s.extras.length) {
    lines.push(`• ${t('wa.extras')}: ${s.extras.map((x) => t(`services.${x}.name`)).join(', ')}`);
  }
  if (est.total > 0) lines.push(`• ${t('wa.estimate')}: ${formatEUR(est.total, locale)}`);
  if (est.onRequest.length) {
    lines.push(`• ${t('wa.onRequest')}: ${est.onRequest.map((o) => t(o.labelKey)).join(', ')}`);
  }
  lines.push(`• ${t('wa.lang')}: ${t('wa.langName')}`);
  lines.push('', t('wa.thanks'));
  return lines.join('\n');
}

/** wa.me base: no number in the demo (see CONTACTS.whatsappDigits). */
export function waBase(): string {
  return `https://wa.me/${CONTACTS.whatsappDigits ?? ''}`;
}

export function waUrl(text: string): string {
  return `${waBase()}?text=${encodeURIComponent(text)}`;
}

/** Plain contact link without a pre-filled request. */
export function waContactUrl(locale: Locale): string {
  return waUrl(translate(locale, 'wa.hello'));
}
