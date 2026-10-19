// Crops Natural Earth 50m admin-0 countries to a Europe bbox, clips rings
// (Sutherland–Hodgman on a rectangle), rounds coordinates. Output: public/geo/europe.json
// Usage: node scripts/crop-geo.mjs <ne_50m_admin_0_countries.geojson>
import { readFileSync, writeFileSync } from 'node:fs';

const [W, S, E, N] = [-12, 34, 32, 62];
const src = JSON.parse(readFileSync(process.argv[2], 'utf8'));

function clip(ring) {
  const edges = [
    (p) => p[0] >= W, (p) => p[0] <= E, (p) => p[1] >= S, (p) => p[1] <= N,
  ];
  const inter = [
    (a, b) => [W, a[1] + ((b[1] - a[1]) * (W - a[0])) / (b[0] - a[0])],
    (a, b) => [E, a[1] + ((b[1] - a[1]) * (E - a[0])) / (b[0] - a[0])],
    (a, b) => [a[0] + ((b[0] - a[0]) * (S - a[1])) / (b[1] - a[1]), S],
    (a, b) => [a[0] + ((b[0] - a[0]) * (N - a[1])) / (b[1] - a[1]), N],
  ];
  let out = ring;
  for (let i = 0; i < 4; i++) {
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const cur = input[j], prev = input[(j + input.length - 1) % input.length];
      const ci = edges[i](cur), pi = edges[i](prev);
      if (ci) { if (!pi) out.push(inter[i](prev, cur)); out.push(cur); }
      else if (pi) out.push(inter[i](prev, cur));
    }
    if (!out.length) return null;
  }
  const r = [];
  for (const p of out) {
    const q = [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
    const l = r[r.length - 1];
    if (!l || l[0] !== q[0] || l[1] !== q[1]) r.push(q);
  }
  return r.length >= 4 ? r : null;
}

const features = [];
for (const f of src.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const kept = [];
  for (const poly of polys) {
    const outer = clip(poly[0]);
    if (outer) kept.push([outer]);
  }
  if (!kept.length) continue;
  const iso = f.properties.ISO_A2_EH || f.properties.ISO_A2;
  features.push({
    type: 'Feature',
    properties: { iso, name: f.properties.NAME },
    geometry: { type: 'MultiPolygon', coordinates: kept },
  });
}
const out = {
  type: 'FeatureCollection',
  source: 'Natural Earth 1:50m Admin 0 – Countries (public domain), cropped',
  bbox: [W, S, E, N],
  features,
};
writeFileSync(new URL('../public/geo/europe.json', import.meta.url), JSON.stringify(out));
console.log(features.length, 'features');
