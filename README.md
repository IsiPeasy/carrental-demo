# Rial Rent — un sito, cinque stili

Demo di design per **Rial Rent** (rialrent.it · European Luxury Mobility Concierge).
Lo stesso sito (home, flotta, Trip Builder a 5 step, riepilogo → WhatsApp) è applicato con **cinque stili diversi**: stessi dati, stessa logica, stessa stima di prezzo. Cambiano pelle, tipografia, motion e una o due interazioni firma per stile. Il cliente sceglie una direzione.

> Demo di design · contenuti e prezzi indicativi.

## Avvio

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # export statico in out/
npm run lint         # type-check
```

QA visivo (screenshot di tutte le pagine a 1440×900 e 390×844, controllo overflow, errori console e link WhatsApp):

```bash
npm run build
(cd out && python3 -m http.server 4321) &
npx playwright install chromium   # solo la prima volta
npm run qa                         # → qa/screenshots/ + report.json
```

## Pagine

| URL | Cosa |
|---|---|
| `/` | Cinque "porte", una per stile |
| `/{stile}/` | Home |
| `/{stile}/flotta/` | Catalogo con filtri categoria e marca |
| `/{stile}/configura/?step=0..4` | Trip Builder: Auto · Destinazione · Date · Extra · Riepilogo |
| `/{stile}/admin/` | Tariffe demo (modificabili, salvate solo nel browser) |

Stili: `nocturne`, `riviera`, `grand-prix`, `itinerary`, `marque`.
Lo switcher in basso a destra cambia stile mantenendo pagina, step e scelte, più IT/EN.

## Stili

_(completato a fine progetto)_

## Cosa deve fornire il cliente

### Slot foto (`public/media/`)
Oggi ogni foto è un segnaposto elegante con didascalia reale e la scritta `[foto cliente]`. File attesi (JPG/WebP, lato lungo ≥ 2000 px):

| Slot | Didascalia |
|---|---|
| `porto-cervo-huracan` | Porto Cervo · Ago 2025 · Lamborghini Huracán Evo Spyder |
| `st-moritz-g63` | St. Moritz · Feb 2026 · Mercedes-AMG G63 |
| `monte-carlo-911-gt3` | Monte Carlo · Giu 2025 · Porsche 911 GT3 |
| `courmayeur-rr-sport-sv` | Courmayeur · Gen 2026 · Range Rover Sport SV |
| `porto-rotondo-roma-spyder` | Porto Rotondo · Mag 2025 · Ferrari Roma Spyder |
| `portofino-abarth-695` | Portofino · Lug 2025 · Abarth 695 Competizione |
| `lago-di-como-v-class` | Lago di Como · Set 2025 · Mercedes V-Class |
| `cannes-urus` | Cannes · Ago 2025 · Lamborghini Urus |
| `ginevra-sl-43` | Ginevra · Apr 2025 · Mercedes-AMG SL 43 |
| `forte-dei-marmi-a45-s` | Forte dei Marmi · Giu 2025 · Mercedes-AMG A45 S |
| `porto-cervo-portofino-m` | Porto Cervo · Lug 2025 · Ferrari Portofino M |
| `milano-gle-63-s` | Milano · Mar 2026 · Mercedes-AMG GLE 63 S |
| `cortina-defender-110` | Cortina · Feb 2026 · Land Rover Defender 110 |

### Loghi ufficiali (solo stile Marque, `public/brands/`)
I loghi non sono disegnati né ricostruiti nel codice. Se il file manca, Marque mostra il nome della marca composto in tipografia: la demo funziona anche senza.
`ferrari.svg`, `lamborghini.svg`, `porsche.svg`, `mercedes-amg.svg`, `mercedes-benz.svg`, `land-rover.svg`, `abarth.svg`.
Uso solo nominativo: "I marchi appartengono ai rispettivi proprietari. Rial Rent non è affiliata ai costruttori."

### Dati mancanti (oggi `[…]`)
- Specifiche di Portofino M, Urus, G63, Range Rover Sport SV, Defender 110, GLE 63 S, SL 43, V-Class, Abarth 695, A45 S (anno, motore, potenza)
- Contatori: consegne effettuate, clienti
- Tariffe reali: oggi solo l'ingresso "da circa €1.200/giorno" è reale; il resto è demo (vedi `/admin`)
- Orari di esempio della timeline Itinerary, nome del concierge nella lettera Riviera, requisiti documenti

## Deploy su Vercel

Export statico (`output: 'export'`):
1. Importa il repo su Vercel: framework **Next.js** viene rilevato automaticamente; il build produce `out/`.
2. Oppure da CLI: `npx vercel` (poi `npx vercel --prod`).
Nessuna variabile d'ambiente richiesta.

## Note tecniche
Vedi `CLAUDE.md` (stack, regole, registry temi). Geodati: Natural Earth 1:50m (pubblico dominio), ritagliati con `scripts/crop-geo.mjs`.
