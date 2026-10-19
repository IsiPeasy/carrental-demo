// QA: screenshots of "/" and, for every style, home, collezione and configura?step=0..4
// at 1440×900 and 390×844 → qa/screenshots/. Also collects console errors and
// verifies the generated WhatsApp link on the summary step.
//
// Usage:  npm run build && npx serve out -l 4321 &   then   npm run qa
//   env:  BASE=http://localhost:4321  STYLES=nocturne,riserva  ONLY=home,collezione,configura
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const STYLES = (process.env.STYLES ?? 'nocturne,riserva,grand-prix,itinerary,marque').split(',');
const ONLY = (process.env.ONLY ?? 'landing,home,collezione,configura').split(',');
const OUT = new URL('./screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

// A complete builder state so every step can be reached.
const future = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};
const BUILDER = {
  state: {
    carId: 'f8-spider',
    cityId: 'costa-smeralda',
    deliveryType: 'villa',
    returnCityId: null,
    dateFrom: future(20),
    dateTo: future(27),
    extras: ['chauffeur', 'jet', 'yacht'],
    step: 0,
  },
  version: 1,
};

const report = { errors: [], overflow: [], whatsapp: [] };
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  await ctx.addInitScript((b) => {
    try {
      localStorage.setItem('rr-builder', JSON.stringify(b));
    } catch {}
  }, BUILDER);
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && report.errors.push(`${vp.name} ${page.url()} :: ${m.text()}`));
  page.on('pageerror', (e) => report.errors.push(`${vp.name} ${page.url()} :: ${e.message}`));

  const shoot = async (path, file) => {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (ow > 1) report.overflow.push(`${vp.name} ${path} overflow ${ow}px`);
    await page.screenshot({ path: `${OUT}${file}-${vp.name}.png`, fullPage: true });
  };

  if (ONLY.includes('landing')) await shoot('/', '00-landing');
  for (const s of STYLES) {
    if (ONLY.includes('home')) await shoot(`/${s}/`, `${s}-1-home`);
    if (ONLY.includes('collezione')) await shoot(`/${s}/collezione/`, `${s}-2-collezione`);
    if (ONLY.includes('configura'))
      for (let i = 0; i <= 4; i++) {
        await shoot(`/${s}/configura/?step=${i}`, `${s}-3-configura-${i}`);
        if (i === 4) {
          const hrefs = await page.$$eval('a[href^="https://wa.me/"][href*="text="]', (as) => as.map((a) => a.href));
          for (const h of hrefs) {
            const u = new URL(h);
            const text = u.searchParams.get('text') ?? '';
            const ok = u.pathname === '/393202934909' && text.includes('F8 Spider') && text.includes('Costa Smeralda');
            report.whatsapp.push({ style: s, vp: vp.name, ok, length: text.length });
          }
          if (!hrefs.length) report.whatsapp.push({ style: s, vp: vp.name, ok: false, reason: 'no wa.me link' });
        }
      }
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
