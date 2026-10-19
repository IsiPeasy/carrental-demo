// Scans public/brands/ for official logo files ({slug}.svg, placed by hand)
// and writes components/themes/marque/brands-manifest.json so <BrandMark>
// knows which logos exist at build time (no broken-image flash, no runtime
// probing). Missing files → BrandMark typesets the brand name instead.
// Run as `prebuild`. Logos are never drawn or downloaded by this project.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = `${root}public/brands`;
const out = `${root}components/themes/marque/brands-manifest.json`;
const SLUGS = ['ferrari', 'lamborghini', 'porsche', 'mercedes-amg', 'mercedes-benz', 'land-rover', 'abarth'];

const files = existsSync(dir) ? readdirSync(dir) : [];
const available = SLUGS.filter((s) => files.includes(`${s}.svg`));
writeFileSync(out, JSON.stringify({ available }, null, 2) + '\n');
console.log(`[brands-manifest] ${available.length ? available.join(', ') : 'no logo files'} → ${out.replace(root, '')}`);
