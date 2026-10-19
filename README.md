# GRANDTOUR — un sito, cinque stili

Demo di design per **Rial Rent** (rialrent.it · European Luxury Mobility Concierge).
Nel sito il marchio mostrato è **GRANDTOUR** (nome demo, monogramma "GT"): si cambia in un punto solo, `brand.name` / `brand.monogram` in `lib/i18n/{it,en}.ts`. Contatti e dati societari restano quelli del cliente; **i link WhatsApp invece non puntano a nessun numero reale**: aprono WhatsApp col messaggio già scritto e si sceglie a chi mandarlo (per la produzione basta impostare `CONTACTS.whatsappDigits` in `lib/data.ts`).
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
(cd out && python3 -m http.server 4321) &   # riavvialo dopo ogni build: il build ricrea out/
npx playwright install chromium   # solo la prima volta
BASE=http://localhost:4321 npm run qa   # → qa/screenshots/ + report.json
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

| # | Stile | Per chi | Interazioni firma | File |
|---|---|---|---|---|
| 1 | **Nocturne** `/nocturne` | UHNW, imprenditori, discrezione | Hero "The Unveil": auto 3D su palco nero, spotlight che si accende, vernice che cambia (Rosso → Blu Tour de France → Giallo Cartagena) · CarStep turntable 3D · riepilogo "invitation card" con monogramma | `components/themes/nocturne/` |
| 2 | **Riviera** `/riviera` | Luxury traveler, wedding, charter guest | Hero "Carte postale": rotta Milano → Portofino → Montecarlo → Saint-Tropez che si disegna, GT che la segue, francobolli · DestinationStep a cartoline che si girano · riepilogo lettera con ceralacca, stampabile | `components/themes/riviera/` |
| 3 | **Grand Prix** `/grand-prix` | Appassionati, social, eventi | Poster con numero di gara e strisce · tabellone split-flap DEPARTURES · CarStep 3D su pavimento a scacchi · calendario cronometro in "giri" · pass paddock con codice a barre | `components/themes/grand-prix/` |
| 4 | **Itinerary** `/itinerary` | Executive, agenzie, assistenti | Mappa d'Europa live con archi da Milano · timeline "Orchestrazione" · builder come chat col concierge + card itinerario live · mockup telefono col messaggio WhatsApp | `components/themes/itinerary/` |
| 5 | **Marque** `/marque` | Chi sceglie prima la marca | Brand wall · accent che cambia per marca su tutto il sito · CarStep marca → modello con 3D tinto dal brand · scheda "configurazione" da configuratore ufficiale | `components/themes/marque/` |

Tutti condividono `lib/data.ts`, `lib/pricing.ts`, `lib/store.ts`, `lib/whatsapp.ts`, `components/CarSilhouette.tsx`, `components/Car3D.tsx`.
Il 3D è in primo piano solo in Nocturne (hero + step auto), Grand Prix e Marque (step auto). Riviera e Itinerary usano le silhouette SVG.

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
Uso solo nominativo: "I marchi appartengono ai rispettivi proprietari. GRANDTOUR non è affiliata ai costruttori."

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

## Cose da sapere
- Le tariffe sono demo (tranne l'ingresso "da circa €1.200/giorno") e si possono cambiare da `/{stile}/admin/`: restano solo nel browser di chi le modifica.
- I link WhatsApp sono senza numero (`https://wa.me/?text=…`): WhatsApp si apre col messaggio precompilato e chiede a chi inviarlo. Nessun messaggio arriva al cliente durante le demo.
- Con "riduci movimento" attivo nel sistema operativo il 3D è sostituito dalla silhouette statica e le animazioni si fermano sullo stato finale.
- In VS Code: "Run and Debug" → *Rial Rent: build + preview export* mostra il sito come su Vercel.

## Note tecniche
Vedi `CLAUDE.md` (stack, regole, registry temi). Geodati: Natural Earth 1:50m (pubblico dominio), ritagliati con `scripts/crop-geo.mjs`.
