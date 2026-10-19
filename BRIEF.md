# BRIEF — carrent-demo: un sito, 5 stili (multi-theme demo per Rial Rent)

Progetto nuovo da zero. Cartella: `carrent-demo`. Prima di scrivere codice crea `CLAUDE.md` (stack, regole, registry temi) e `README.md`, inizializza git e committa per fase.

## Contesto
Rial Rent (rialrent.it) fa noleggio di supercar e auto di lusso in tutta Europa. Il servizio è guidato da un concierge: consegna in hotel, villa, aeroporto o FBO, e coordina anche yacht, jet privato, autista e sicurezza. Oggi la prenotazione è un link `wa.me`. La demo deve mostrare al cliente **5 stili diversi applicati all'intero sito**: home, hero, sezioni, flotta, Trip Builder a 5 step e riepilogo. Il cliente sceglie una direzione. Stessa logica, stessi dati, stessa stima di prezzo sotto tutti e cinque; cambiano pelle, tipografia, motion e **una o due interazioni firma per stile**. Due stili mettono il 3D in primo piano (Nocturne, Grand Prix); uno è costruito attorno ai marchi (Marque).

Deploy finale su Vercel come export statico.

## Stack (non negoziabile)
- Next.js 15 (App Router, TypeScript strict), `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`
- Tailwind CSS 4 (`@theme` in `globals.css`)
- three.js puro (niente R3F, niente drei, niente GSAP)
- Zustand (con `persist` su localStorage per lo stato del builder e la lingua)
- Font da Google Fonts via `next/font/google`
- Playwright solo come devDependency per il QA
- Ogni altra dipendenza va motivata in CLAUDE.md. Fa eccezione un file GeoJSON statico dell'Europa (Natural Earth, pubblico dominio) in `public/geo/`, proiettato a mano: niente d3.

## Architettura
1. **Registry temi** `lib/themes.ts`
   - `type StyleId = 'nocturne' | 'riviera' | 'grand-prix' | 'itinerary' | 'marque'`.
   - Per ogni tema: `slug`, `name`, `tagline` (IT/EN), `audience` (IT/EN), token (`colors`, `fonts`, `radius`, `motion` con easing e durate).
   - **Mappa componenti**: `Hero`, `HomeSections`, `FleetSection`, `CarStep`, `DestinationStep`, `DatesStep`, `ExtrasStep`, `SummaryVariant`, `Scene3DProps`.
   - Niente `if (style === …)` sparsi: la variazione passa dal registry o dalle CSS variables.
2. **Routing**: `app/[style]/` con `generateStaticParams()` sui 5 slug. Pagine:
   - `/[style]/` (home)
   - `/[style]/flotta/` (catalogo con filtri per categoria e brand)
   - `/[style]/configura/?step=0..4` (Trip Builder)
   - `/[style]/admin/` (pannello tariffe demo, uguale per tutti gli stili, solo ricolorato)
3. **Theming CSS**: variabili semantiche (`--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-2`, `--color-accent`, `--color-accent-2`, `--color-line`, `--font-display`, `--font-body`, `--font-mono`, `--radius`). Il default in `@theme` è Nocturne; gli altri fanno override sotto `[data-theme="riviera"]` ecc. Un `ThemeProvider` client imposta `data-theme` su `<html>`. Le utility Tailwind (`bg-bg`, `text-ink`, `font-display`, `border-line`…) risolvono sempre al tema attivo.
4. **Landing `/`**: cinque "porte" a tutta altezza su desktop (colonne affiancate che si espandono in hover), impilate su mobile. Ognuna è renderizzata nei propri token con un mini hero animato vivo, nome, una riga "per chi è" e bottone "Entra". Sopra, una riga: "Stessa logica, cinque pelli. Scegli la tua."
5. **StyleSwitcher**: pill fissa in basso a destra su ogni pagina, 5 voci più toggle IT/EN. Cambia stile **mantenendo la route e la query** (`/nocturne/configura/?step=2` → `/riviera/configura/?step=2`). Lo stato del builder sopravvive al cambio.
6. **i18n**: IT (default) + EN con dizionari in `lib/i18n/{it,en}.ts` e hook `useT()`. La lingua sta nello store, non nell'URL. Nessuna stringa hard-coded nei componenti.
7. **Condiviso e intoccabile tra stili**:
   - `lib/data.ts` (flotta, città, servizi, rotte jet, testimonianze, FAQ, contatti)
   - `lib/pricing.ts` (stima)
   - `lib/store.ts` (Zustand)
   - `lib/whatsapp.ts` (builder del messaggio)
   - `components/CarSilhouette.tsx`
   - `components/Car3D.tsx`
   I temi passano solo props.

## Asset auto (regola chiave)
- **Niente loghi di marca disegnati o ricostruiti nel codice, niente foto in hotlink da rialrent.it, niente modelli 3D scaricati.** Unica eccezione: lo stile Marque, che usa i loghi ufficiali come file forniti a mano (vedi sotto).
- `CarSilhouette.tsx`: 4 silhouette SVG generiche e ricolorabili per `bodyType`: `supercar` (coupé bassa a motore centrale), `gt` (GT/cabrio a motore anteriore), `suv`, `van` (V-Class). Props: `color`, `accent`, `stroke`, `wireframe`, `drawProgress` (0–1 per animazioni `stroke-dashoffset`). Ogni auto della flotta mappa a un `bodyType` e a un colore reale.
- `Car3D.tsx`: auto procedurale three.js generica, ricavata dal profilo della silhouette.
  - Geometria: `ExtrudeGeometry` con bevel, cabina vetrata separata, 4 ruote con cerchio e pinza.
  - Props: `bodyType`, `paint`, `background`, `keyLight` (colore, intensità, direzione), `rimLight`, `floor` (`none` | `reflective` | `grid` | `checker`), `autoRotate`, `wireframe`, `cameraPreset`.
  - Rendering: `MeshPhysicalMaterial` con clearcoat per la vernice, un solo renderer per pagina, dispose corretto, pausa quando fuori viewport (IntersectionObserver).
  - Fallback statico con `CarSilhouette` se WebGL non è disponibile o se è attivo `prefers-reduced-motion`.
- Foto: `public/media/` resta vuota. Usa `<Photo slot="porto-cervo-huracan">`, un placeholder elegante con gradiente nei token del tema, didascalia reale e `[foto cliente]` piccolo. Elenca gli slot in README così il cliente sa cosa fornire.

## Dati (da rialrent.it, solo questi fatti; il resto `[…]`)
**Contatti**:
- WhatsApp e telefono +39 320 293 4909
- info@rialrent.it
- Milano, Via Privata Platone
- RIAL S.R.L., P.IVA 12430320965
- Instagram/TikTok/Facebook @rialrent

**Claim**:
- "European Luxury Mobility Concierge"
- "Noleggio Auto di Lusso in Europa."
- "Più che noleggio. Concierge."
- "Dalla marina alla strada."
- "Tre passi, zero attriti." (Scrivi → Conferma: risposta in meno di un'ora → Consegna)

**Garanzie**: Kasko full inclusa · Concierge H24 7/7 · Pagamenti tracciati (bonifico e carta, zero contanti) · Consegna dedicata (hotel, villa, aeroporto, FBO).

**Numeri**: 48 auto a catalogo, attività dal 2021. Gli altri contatori sono `[…]` e vanno resi come placeholder visibili.

**Flotta** (`brand`, `model`, `year`, `color`, `category`, `bodyType`, `specs`):
| Auto | Dettagli | Categoria | bodyType |
|---|---|---|---|
| Porsche 911 GT3 | 2023, Giallo Cartagena, Boxer 4.0 · 510 CV · 318 km/h | Sportiva | supercar |
| Ferrari F8 Spider | 2023, Rosso, V8 Biturbo · 720 CV · 340 km/h | Supercar | supercar |
| Lamborghini Huracán Evo Spyder | 2021, Bianco, V10 5.2 · 640 CV · Cabrio AWD | Supercar | supercar |
| Ferrari Roma Spyder | 2023, Blu Tour de France, V8 Biturbo · 620 CV · Cabrio GT | GT | gt |
| Ferrari Portofino M | specs `[…]` | GT | gt |
| Lamborghini Urus | specs `[…]` | SUV | suv |
| Mercedes-AMG G63 | specs `[…]` | SUV | suv |
| Range Rover Sport SV | specs `[…]` | SUV | suv |
| Land Rover Defender 110 | specs `[…]` | SUV | suv |
| Mercedes-AMG GLE 63 S | specs `[…]` | SUV | suv |
| Mercedes-AMG SL 43 | specs `[…]` | GT | gt |
| Mercedes V-Class | specs `[…]` | Luxury | van |
| Abarth 695 Competizione | specs `[…]` | Sportiva | gt |
| Mercedes-AMG A45 S | specs `[…]` | Sportiva | gt |

**Consegne reali** (per gallerie e slot foto):
- Porto Cervo · Ago 2025 · Huracán Evo Spyder
- St. Moritz · Feb 2026 · G63
- Monte Carlo · Giu 2025 · 911 GT3
- Courmayeur · Gen 2026 · Range Rover Sport SV
- Porto Rotondo · Mag 2025 · Roma Spyder
- Portofino · Lug 2025 · Abarth 695
- Lago di Como · Set 2025 · V-Class
- Cannes · Ago 2025 · Urus
- Ginevra · Apr 2025 · SL 43
- Forte dei Marmi · Giu 2025 · A45 S
- Porto Cervo · Lug 2025 · Portofino M
- Milano · Mar 2026 · GLE 63 S
- Cortina · Feb 2026 · Defender 110

**Città**: Milano, Roma, Firenze, Como, Forte dei Marmi, Napoli, Costa Smeralda, Portofino, Venezia, Capri, Cortina d'Ampezzo, Courmayeur, Lago di Garda, Montecarlo, Cannes, Saint-Tropez, Nizza, Parigi, Courchevel, Megève, Ibiza, Marbella, Barcellona, Madrid, Maiorca, Londra, Zurigo, Ginevra, Lugano, Saint-Moritz, Gstaad, Verbier, Zermatt, Vienna, Kitzbühel, Monaco di Baviera, Berlino.
- Per ognuna: codice a 3 lettere, paese ISO, lat/lon, zona tariffaria (`IT-N`, `IT-S`, `ISOLE`, `FR-CH-MC`, `ES`, `ALPI`, `NORD-EU`).

**Aeroporti**: LIN, MXP, FCO, CIA, OLB, NCE, GVA, IBZ.

**Servizi extra**: autista, VIP Assistance / Meet & Greet, Fast Track, servizio porter, sicurezza privata, yacht (coordinamento marina), jet privato, elicottero, one-way in altra nazione (su quotazione).

**Rotte jet indicative**: Milano–Olbia da 3.600 €, Milano–Nizza da 2.700 €, Milano–Londra da 5.500 €, Milano–Dubai da 35.900 €.

**Clientela**: Imprenditori, Charter guest, Wedding, Executive, International visitors, Luxury travelers.

**Testimonianze**: Andrea M. (Imprenditore · Milano · F8 Spider), Sofia L. (Wedding planner · Como · Roma Spyder), Marco T. (Avvocato · Roma · Huracán Evo Spyder). Testo breve, parafrasato dal sito.

**FAQ**: 6 domande del sito (paesi serviti, flotta, consegna aeroporto/hotel, documenti, one-way, costo "da circa €1.200/giorno").

## Logica condivisa
**`lib/pricing.ts`, stima indicativa e mai preventivo**:
- `dailyRate` per auto come valore DEMO. Ancora unica reale: entry ~€1.200/g. Le altre tariffe sono plausibili ma marcate `demo: true`, ed editabili da `/admin` (override in localStorage).
- Sconto durata: 3+ giorni −5%, 7+ giorni −12%.
- Consegna per zona e tipo luogo (hotel/villa/ufficio/aeroporto/FBO): tabella demo.
- Extra a forfait demo. Jet: rotte note dalla tabella, altrimenti "su quotazione". Yacht e one-way sempre "su quotazione".
- Output: `{ lines[], subtotal, onRequest[], total, currency }`.
- La UI scrive sempre "Stima indicativa · il concierge conferma in meno di un'ora".

**`lib/whatsapp.ts`**: compone il messaggio (auto, città, luogo di consegna e ritiro, date, extra, stima, lingua) → `https://wa.me/393202934909?text=…` con `encodeURIComponent`. Mostra un'anteprima del testo prima del click.

**`lib/store.ts`**: `carId`, `cityId`, `deliveryType`, `returnCityId`, `dateFrom`, `dateTo`, `extras[]`, `locale`, `step`. Validazione per step: Avanti è disabilitato con il motivo scritto.

**Trip Builder, 5 step**: 0 Auto · 1 Destinazione & consegna · 2 Date · 3 Extra · 4 Riepilogo → WhatsApp. Aside con stima live (su mobile collassa sotto il main come barra sticky).

## I 5 stili

### 1. Nocturne — private members club, il 3D in vetrina — `/nocturne`
**Per chi**: UHNW, imprenditori, chi vuole discrezione. È l'evoluzione "alta" del sito attuale.

**Token**:
- bg `#0A0A0B`, surface `#141415`, ink `#F3EFE6`, ink-2 `#A8A39A`
- accent `#C8A96A` (champagne), accent-2 `#6E6A62`, line `#26241F`, radius 0
- Font: Bodoni Moda (display, italic per le parole chiave) + Inter Tight 300/400 (body, label maiuscolo spaziato .3em)

**Hero, The Unveil**:
- `Car3D` su palco nero, cono di spotlight che si accende in 2 s, rim light champagne, pavimento riflettente.
- Camera in dolly lentissima. La vernice cambia a ogni loop tra i colori reali della flotta (Rosso → Blu Tour de France → Giallo Cartagena).
- Titolo: "L'Europa, *consegnata*." CTA "Richiedi una vettura" → builder.

**Sezioni**:
- Flotta "Private Viewing": galleria orizzontale a scroll-snap; hover/focus alza la card e rivela le specifiche.
- "Più che noleggio. Concierge." in tre colonne numerate I/II/III.
- Garanzie in riga sottile.

**Step firma, CarStep**: turntable 3D a tutta larghezza; sotto, selettore a silhouette in fila sottile; nome in Bodoni grande.

**Riepilogo**: invitation card nera, bordo doppio champagne, monogramma "RR", testo centrato, CTA "Invia al concierge".

**Motion**: lenta, `cubic-bezier(.2,.8,.2,1)`, 0.8–1.6 s.

### 2. Riviera — old money mediterraneo, editoriale — `/riviera`
**Per chi**: luxury traveler, wedding, charter guest.

**Token**:
- bg `#F5EFE4`, surface `#FBF8F2`, ink `#13233F`, ink-2 `#5A6478`
- accent `#1E4E79` (blu marina), accent-2 `#C96F4A` (terracotta), line `#E2D8C6`, radius 2px
- Font: Fraunces (display, italic ottico) + DM Sans (body)

**Hero, Carte postale**:
- Costa ligure e Costa Azzurra in SVG stilizzato (linea di costa semplificata dal GeoJSON).
- La rotta tratteggiata si disegna Milano → Portofino → Montecarlo → Saint-Tropez (`stroke-dashoffset`, 6 s). Una silhouette GT la segue lungo il path (`getPointAtLength`).
- Francobolli con codice città che appaiono a ogni tappa.
- Titolo: "Dalla marina alla strada."

**Sezioni**:
- "Consegne reali" come impaginato da magazine (masonry, didascalie in corsivo luogo · mese).
- "Yacht & Supercar Concierge" a due colonne.
- Testimonianze come citazioni editoriali.

**Step firma, DestinationStep**: mazzo di cartoline per regione; click → la cartolina si gira (rotateY) e mostra le città. Il tipo di consegna si sceglie con icone a linea (hotel, villa, marina, aeroporto, FBO).

**Riepilogo**: lettera su carta intestata, timbro a ceralacca terracotta in SVG, firma `[nome], concierge`. Stampabile con `@media print`.

**Motion**: fade e "disegno", 0.6–1.2 s, niente rimbalzi.

### 3. Grand Prix — poster anni '70, il 3D in pista — `/grand-prix`
**Per chi**: appassionati, social, eventi. È lo stile "wow" della demo.

**Token**:
- bg `#EFE7D6` (crema), surface `#F8F2E4`, ink `#111111`, ink-2 `#4A4A46`
- accent `#D7261E` (rosso corsa), accent-2 `#0F4C81`, line `#111111`, radius 0, bordi 2px
- Font: Anton (display maiuscolo) + Archivo (body) + Space Mono (dati/tabellone)
- **Nessuna livrea o marchio reale** (niente Gulf, Martini ecc.): strisce e numeri originali.

**Hero, Poster**:
- Numero di gara gigante, tre strisce diagonali che entrano in sequenza.
- Silhouette supercar con speed lines; titolo "L'EUROPA È UN CIRCUITO."

**Sezioni**:
- **Tabellone split-flap "DEPARTURES"**: colonne CITTÀ · CODICE · AUTO · STATO, che girano carattere per carattere (CSS, `steps()`).
- Flotta come griglia di partenza P1–P8 con specifiche in tabella cronometro.
- Fascia rossa con CTA "PARTI DAL VIA".

**Step firma, CarStep**:
- `Car3D` con `floor: 'checker'`, key light rossa radente, `autoRotate`.
- Selettore modelli come numeri di gara; specifiche che scorrono come telemetria.
- **DatesStep**: calendario stile cronometro, con la durata mostrata come "giri" (giorni).

**Riepilogo**: pass paddock / biglietto gara con perforazione, codice a barre SVG generato dai dati, numero pettorale.

**Motion**: rapida, `steps()` per flap e contatori, 0.25–0.5 s.

### 4. Itinerary — concierge OS svizzero, mappa al centro — `/itinerary`
**Per chi**: executive, agenzie, assistenti personali.

**Token**:
- bg `#F6F6F4`, surface `#FFFFFF`, ink `#0B0B0C`, ink-2 `#6B6B6B`
- accent `#0E6B57`, accent-2 `#FF5A36` (segnale), line `#E4E4E0`, radius 12px
- Font: Geist (display e body) + Geist Mono (dati)

**Hero, Europe live**:
- Mappa d'Europa SVG dal GeoJSON (proiezione equirettangolare propria), punti delle città che pulsano.
- Archi animati da Milano alle destinazioni. Contatore "48 auto · consegna in 8 paesi".
- Titolo: "Un solo interlocutore. Tutta l'Europa."

**Sezioni**:
- **Orchestrazione**: timeline orizzontale jet → VIP assistance → supercar in hotel → yacht in marina, con card e orari esempio marcati `[…]`.
- Città filtrabili per paese.
- FAQ ad accordion.

**Step firma, builder come chat**:
- A sinistra, il concierge fa le domande in bolle e l'utente risponde con chip e selettori inline.
- A destra, card itinerario che si compone live con mappa mini.
- Stessi 5 step e stessa query `?step=`.

**Riepilogo**: documento itinerario più mockup telefono con l'anteprima del messaggio WhatsApp precompilato.

**Motion**: funzionale, 0.2–0.4 s, `ease-out`.

### 5. Marque — il brand come protagonista — `/marque`
**Per chi**: chi sceglie prima la marca e poi la vettura. Rende subito chiaro "abbiamo Ferrari, Lamborghini, Porsche, Mercedes-AMG, Land Rover…".

**Loghi (regola)**:
- I loghi **non si disegnano né si ricostruiscono in SVG**: si caricano da file ufficiali messi a mano in `public/brands/{slug}.svg` (ferrari, lamborghini, porsche, mercedes-amg, mercedes-benz, land-rover, abarth).
- Componente `BrandMark`: se il file c'è usa `<img>`, altrimenti mostra il nome del brand composto nel font display del tema. La demo funziona anche senza file.
- Elenca i file attesi in README.
- Solo uso nominativo: i loghi indicano le marche a noleggio, non suggeriscono partnership. Footer: "I marchi appartengono ai rispettivi proprietari. Rial Rent non è affiliata ai costruttori."

**Token base**:
- bg `#FFFFFF`, surface `#F4F4F4`, ink `#0B0B0B`, ink-2 `#6A6A6A`, line `#E6E6E6`, radius 4px
- Font: Inter Tight (display 600, tracking stretto) + Inter (body) + JetBrains Mono (specifiche)
- **L'accent cambia per brand** via `data-brand` sul contenitore (`--color-accent`, transizione 0.5 s): rosso per Ferrari, oro per Lamborghini, nero/argento per Porsche e Mercedes-AMG, verde scuro per Land Rover, rosso/nero per Abarth.

**Hero, Brand wall**:
- Griglia a tutta pagina di tile, una per marca, con il `BrandMark` grande.
- Hover/focus: la tile si allarga, compare la silhouette dell'auto di punta nel colore del brand e il conteggio modelli dalla flotta.
- Titolo: "Scegli la marca. Al resto pensa il concierge."

**Sezioni**:
- Sezione brand in-page (tab o ancore): accent del brand, lista modelli con specifiche, "Consegne reali" filtrate per quel brand.
- Riga "I nostri brand" in marquee lento con `BrandMark` monocromatici.

**Step firma, CarStep**:
- Si sceglie prima il brand (tile con `BrandMark`), poi il modello.
- `Car3D` con vernice del modello, sfondo chiaro, `floor: 'reflective'`, luce chiave tinta dell'accent del brand.
- Tutto il builder eredita l'accent del brand selezionato fino al riepilogo.

**Riepilogo**: scheda "configurazione" in stile configuratore ufficiale: `BrandMark` in testa, colore e specifiche in tabella, stima e CTA WhatsApp nell'accent del brand.

**Motion**: pulita, 0.3–0.6 s, transizioni di colore e scale leggere.

## Regole
- Copy: IT primario, EN completo. Solo fatti del cliente elencati sopra; `[…]` dove mancano.
- Prezzi solo da `lib/pricing.ts`, sempre etichettati come stima indicativa.
- `CarSilhouette` e `Car3D` sono unici. Asset di marca solo nello stile Marque, solo da file in `public/brands/`.
- Accessibilità:
  - contrasto AA
  - focus visibile
  - navigazione da tastiera nel builder
  - `aria-live` sulla stima
  - ogni animazione sotto `prefers-reduced-motion`
- Performance:
  - un solo contesto WebGL per pagina
  - nessun 3D nelle porte della landing (usa la silhouette animata)
  - LCP < 2.5 s
- Mobile: tutto deve reggere a 390 px.
- Footer con disclaimer: "Demo di design · contenuti e prezzi indicativi".

## Ordine di lavoro (un commit per fase, `npm run build` verde a ogni fase)
1. **Scaffold**: CLAUDE.md, README, dati, pricing, store, whatsapp, i18n, registry, routing `[style]`, ThemeProvider, CSS semantiche, `CarSilhouette`, `Car3D` base, builder funzionante con UI neutra, landing con 5 porte (hero placeholder), StyleSwitcher, admin tariffe.
2. Nocturne completo.
3. Riviera completo.
4. Grand Prix completo.
5. Itinerary completo.
6. Marque completo.
7. **QA**:
   - Script Playwright che fotografa `/` e, per ogni stile, home, flotta e `configura?step=0..4`, a 1440×900 e 390×844, in `qa/screenshots/`.
   - Guarda gli screenshot e correggi overflow, contrasti e testi tagliati.
   - Verifica i link WhatsApp generati.
   - Aggiorna README (sezione "Stili", slot foto da chiedere al cliente, deploy Vercel) e CLAUDE.md.

Alla fine riporta: tabella stile → componenti → file; cosa è placeholder o demo; eventuali compromessi.
