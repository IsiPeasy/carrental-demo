// Shared dataset — the only source of facts for every style.
// Facts come from rialrent.it (see BRIEF.md). Anything unknown is `null`
// and must be rendered with the visible placeholder `[…]` (see PLACEHOLDER).

export const PLACEHOLDER = '[…]';

export type Locale = 'it' | 'en';
export type L10n = { it: string; en: string };

export type Category = 'sportiva' | 'supercar' | 'gt' | 'suv' | 'luxury';
export type BodyType = 'supercar' | 'gt' | 'suv' | 'van';
export type Zone = 'IT-N' | 'IT-S' | 'ISOLE' | 'FR-CH-MC' | 'ES' | 'ALPI' | 'NORD-EU';
export type Region = 'nord' | 'riviera' | 'sud' | 'alpi' | 'spagna' | 'capitali';
export type DeliveryType = 'hotel' | 'villa' | 'ufficio' | 'marina' | 'aeroporto' | 'fbo';
export type BrandSlug =
  | 'ferrari'
  | 'lamborghini'
  | 'porsche'
  | 'mercedes-amg'
  | 'mercedes-benz'
  | 'land-rover'
  | 'abarth';

export interface Brand {
  slug: BrandSlug;
  name: string;
}

export interface Car {
  id: string;
  brand: BrandSlug;
  model: string;
  year: number | null;
  color: { name: L10n; hex: string };
  category: Category;
  bodyType: BodyType;
  specs: { engine: string; power: string; extra: string } | null;
}

export interface City {
  id: string;
  code: string;
  name: L10n;
  country: 'IT' | 'FR' | 'MC' | 'ES' | 'GB' | 'CH' | 'AT' | 'DE';
  lat: number;
  lon: number;
  zone: Zone;
  region: Region;
}

export interface Airport {
  code: string;
  name: string;
  cityId: string;
  lat: number;
  lon: number;
}

export interface Delivery {
  slot: string;
  cityId: string;
  place: string;
  month: { year: number; month: number };
  carId: string;
}

export const BRANDS: Brand[] = [
  { slug: 'ferrari', name: 'Ferrari' },
  { slug: 'lamborghini', name: 'Lamborghini' },
  { slug: 'porsche', name: 'Porsche' },
  { slug: 'mercedes-amg', name: 'Mercedes-AMG' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz' },
  { slug: 'land-rover', name: 'Land Rover' },
  { slug: 'abarth', name: 'Abarth' },
];

export const CATEGORIES: Category[] = ['supercar', 'sportiva', 'gt', 'suv', 'luxury'];

export const FLEET: Car[] = [
  {
    id: '911-gt3',
    brand: 'porsche',
    model: '911 GT3',
    year: 2023,
    color: { name: { it: 'Giallo Cartagena', en: 'Cartagena Yellow' }, hex: '#F2C230' },
    category: 'sportiva',
    bodyType: 'supercar',
    specs: { engine: 'Boxer 4.0', power: '510 CV', extra: '318 km/h' },
  },
  {
    id: 'f8-spider',
    brand: 'ferrari',
    model: 'F8 Spider',
    year: 2023,
    color: { name: { it: 'Rosso', en: 'Red' }, hex: '#C8102E' },
    category: 'supercar',
    bodyType: 'supercar',
    specs: { engine: 'V8 Biturbo', power: '720 CV', extra: '340 km/h' },
  },
  {
    id: 'huracan-evo-spyder',
    brand: 'lamborghini',
    model: 'Huracán Evo Spyder',
    year: 2021,
    color: { name: { it: 'Bianco', en: 'White' }, hex: '#EDEDE8' },
    category: 'supercar',
    bodyType: 'supercar',
    specs: { engine: 'V10 5.2', power: '640 CV', extra: 'Cabrio AWD' },
  },
  {
    id: 'roma-spyder',
    brand: 'ferrari',
    model: 'Roma Spyder',
    year: 2023,
    color: { name: { it: 'Blu Tour de France', en: 'Blu Tour de France' }, hex: '#1F3A6B' },
    category: 'gt',
    bodyType: 'gt',
    specs: { engine: 'V8 Biturbo', power: '620 CV', extra: 'Cabrio GT' },
  },
  {
    id: 'portofino-m',
    brand: 'ferrari',
    model: 'Portofino M',
    year: null,
    color: { name: { it: 'Grigio Titanio', en: 'Titanium Grey' }, hex: '#7D7F82' },
    category: 'gt',
    bodyType: 'gt',
    specs: null,
  },
  {
    id: 'urus',
    brand: 'lamborghini',
    model: 'Urus',
    year: null,
    color: { name: { it: 'Giallo', en: 'Yellow' }, hex: '#E8B90F' },
    category: 'suv',
    bodyType: 'suv',
    specs: null,
  },
  {
    id: 'g63',
    brand: 'mercedes-amg',
    model: 'G63',
    year: null,
    color: { name: { it: 'Nero', en: 'Black' }, hex: '#141414' },
    category: 'suv',
    bodyType: 'suv',
    specs: null,
  },
  {
    id: 'rr-sport-sv',
    brand: 'land-rover',
    model: 'Range Rover Sport SV',
    year: null,
    color: { name: { it: 'Grigio Carpazi', en: 'Carpathian Grey' }, hex: '#4A4D50' },
    category: 'suv',
    bodyType: 'suv',
    specs: null,
  },
  {
    id: 'defender-110',
    brand: 'land-rover',
    model: 'Defender 110',
    year: null,
    color: { name: { it: 'Verde Pangea', en: 'Pangea Green' }, hex: '#3E4A3A' },
    category: 'suv',
    bodyType: 'suv',
    specs: null,
  },
  {
    id: 'gle-63-s',
    brand: 'mercedes-amg',
    model: 'GLE 63 S',
    year: null,
    color: { name: { it: 'Bianco Diamante', en: 'Diamond White' }, hex: '#E6E4DE' },
    category: 'suv',
    bodyType: 'suv',
    specs: null,
  },
  {
    id: 'sl-43',
    brand: 'mercedes-amg',
    model: 'SL 43',
    year: null,
    color: { name: { it: 'Argento', en: 'Silver' }, hex: '#B9BCC0' },
    category: 'gt',
    bodyType: 'gt',
    specs: null,
  },
  {
    id: 'v-class',
    brand: 'mercedes-benz',
    model: 'V-Class',
    year: null,
    color: { name: { it: 'Nero Ossidiana', en: 'Obsidian Black' }, hex: '#1B1C1E' },
    category: 'luxury',
    bodyType: 'van',
    specs: null,
  },
  {
    id: 'abarth-695',
    brand: 'abarth',
    model: '695 Competizione',
    year: null,
    color: { name: { it: 'Grigio Campovolo', en: 'Campovolo Grey' }, hex: '#8E9093' },
    category: 'sportiva',
    bodyType: 'gt',
    specs: null,
  },
  {
    id: 'a45-s',
    brand: 'mercedes-amg',
    model: 'A45 S',
    year: null,
    color: { name: { it: 'Grigio Montagna', en: 'Mountain Grey' }, hex: '#5F6366' },
    category: 'sportiva',
    bodyType: 'gt',
    specs: null,
  },
];

export const CITIES: City[] = [
  { id: 'milano', code: 'MIL', name: { it: 'Milano', en: 'Milan' }, country: 'IT', lat: 45.464, lon: 9.19, zone: 'IT-N', region: 'nord' },
  { id: 'roma', code: 'ROM', name: { it: 'Roma', en: 'Rome' }, country: 'IT', lat: 41.903, lon: 12.496, zone: 'IT-S', region: 'sud' },
  { id: 'firenze', code: 'FLR', name: { it: 'Firenze', en: 'Florence' }, country: 'IT', lat: 43.77, lon: 11.256, zone: 'IT-N', region: 'nord' },
  { id: 'como', code: 'COM', name: { it: 'Como', en: 'Como' }, country: 'IT', lat: 45.808, lon: 9.085, zone: 'IT-N', region: 'nord' },
  { id: 'forte-dei-marmi', code: 'FDM', name: { it: 'Forte dei Marmi', en: 'Forte dei Marmi' }, country: 'IT', lat: 43.96, lon: 10.17, zone: 'IT-N', region: 'riviera' },
  { id: 'napoli', code: 'NAP', name: { it: 'Napoli', en: 'Naples' }, country: 'IT', lat: 40.852, lon: 14.268, zone: 'IT-S', region: 'sud' },
  { id: 'costa-smeralda', code: 'CSM', name: { it: 'Costa Smeralda', en: 'Costa Smeralda' }, country: 'IT', lat: 41.11, lon: 9.53, zone: 'ISOLE', region: 'sud' },
  { id: 'portofino', code: 'PTF', name: { it: 'Portofino', en: 'Portofino' }, country: 'IT', lat: 44.303, lon: 9.21, zone: 'IT-N', region: 'riviera' },
  { id: 'venezia', code: 'VCE', name: { it: 'Venezia', en: 'Venice' }, country: 'IT', lat: 45.44, lon: 12.333, zone: 'IT-N', region: 'nord' },
  { id: 'capri', code: 'CAP', name: { it: 'Capri', en: 'Capri' }, country: 'IT', lat: 40.551, lon: 14.243, zone: 'ISOLE', region: 'sud' },
  { id: 'cortina', code: 'CTN', name: { it: "Cortina d'Ampezzo", en: "Cortina d'Ampezzo" }, country: 'IT', lat: 46.537, lon: 12.136, zone: 'ALPI', region: 'alpi' },
  { id: 'courmayeur', code: 'CMY', name: { it: 'Courmayeur', en: 'Courmayeur' }, country: 'IT', lat: 45.792, lon: 6.972, zone: 'ALPI', region: 'alpi' },
  { id: 'lago-di-garda', code: 'GRD', name: { it: 'Lago di Garda', en: 'Lake Garda' }, country: 'IT', lat: 45.6, lon: 10.63, zone: 'IT-N', region: 'nord' },
  { id: 'montecarlo', code: 'MCM', name: { it: 'Montecarlo', en: 'Monte Carlo' }, country: 'MC', lat: 43.74, lon: 7.424, zone: 'FR-CH-MC', region: 'riviera' },
  { id: 'cannes', code: 'CEQ', name: { it: 'Cannes', en: 'Cannes' }, country: 'FR', lat: 43.552, lon: 7.017, zone: 'FR-CH-MC', region: 'riviera' },
  { id: 'saint-tropez', code: 'STP', name: { it: 'Saint-Tropez', en: 'Saint-Tropez' }, country: 'FR', lat: 43.272, lon: 6.64, zone: 'FR-CH-MC', region: 'riviera' },
  { id: 'nizza', code: 'NCE', name: { it: 'Nizza', en: 'Nice' }, country: 'FR', lat: 43.71, lon: 7.262, zone: 'FR-CH-MC', region: 'riviera' },
  { id: 'parigi', code: 'PAR', name: { it: 'Parigi', en: 'Paris' }, country: 'FR', lat: 48.857, lon: 2.352, zone: 'NORD-EU', region: 'capitali' },
  { id: 'courchevel', code: 'CVF', name: { it: 'Courchevel', en: 'Courchevel' }, country: 'FR', lat: 45.415, lon: 6.634, zone: 'ALPI', region: 'alpi' },
  { id: 'megeve', code: 'MGV', name: { it: 'Megève', en: 'Megève' }, country: 'FR', lat: 45.857, lon: 6.617, zone: 'ALPI', region: 'alpi' },
  { id: 'ibiza', code: 'IBZ', name: { it: 'Ibiza', en: 'Ibiza' }, country: 'ES', lat: 38.907, lon: 1.432, zone: 'ES', region: 'spagna' },
  { id: 'marbella', code: 'MBL', name: { it: 'Marbella', en: 'Marbella' }, country: 'ES', lat: 36.51, lon: -4.883, zone: 'ES', region: 'spagna' },
  { id: 'barcellona', code: 'BCN', name: { it: 'Barcellona', en: 'Barcelona' }, country: 'ES', lat: 41.385, lon: 2.173, zone: 'ES', region: 'spagna' },
  { id: 'madrid', code: 'MAD', name: { it: 'Madrid', en: 'Madrid' }, country: 'ES', lat: 40.417, lon: -3.704, zone: 'ES', region: 'spagna' },
  { id: 'maiorca', code: 'PMI', name: { it: 'Maiorca', en: 'Mallorca' }, country: 'ES', lat: 39.57, lon: 2.65, zone: 'ES', region: 'spagna' },
  { id: 'londra', code: 'LON', name: { it: 'Londra', en: 'London' }, country: 'GB', lat: 51.507, lon: -0.128, zone: 'NORD-EU', region: 'capitali' },
  { id: 'zurigo', code: 'ZRH', name: { it: 'Zurigo', en: 'Zurich' }, country: 'CH', lat: 47.377, lon: 8.54, zone: 'FR-CH-MC', region: 'capitali' },
  { id: 'ginevra', code: 'GVA', name: { it: 'Ginevra', en: 'Geneva' }, country: 'CH', lat: 46.204, lon: 6.143, zone: 'FR-CH-MC', region: 'capitali' },
  { id: 'lugano', code: 'LUG', name: { it: 'Lugano', en: 'Lugano' }, country: 'CH', lat: 46.004, lon: 8.951, zone: 'FR-CH-MC', region: 'nord' },
  { id: 'saint-moritz', code: 'SMV', name: { it: 'Saint-Moritz', en: 'St. Moritz' }, country: 'CH', lat: 46.498, lon: 9.839, zone: 'ALPI', region: 'alpi' },
  { id: 'gstaad', code: 'GST', name: { it: 'Gstaad', en: 'Gstaad' }, country: 'CH', lat: 46.475, lon: 7.286, zone: 'ALPI', region: 'alpi' },
  { id: 'verbier', code: 'VRB', name: { it: 'Verbier', en: 'Verbier' }, country: 'CH', lat: 46.096, lon: 7.228, zone: 'ALPI', region: 'alpi' },
  { id: 'zermatt', code: 'ZMT', name: { it: 'Zermatt', en: 'Zermatt' }, country: 'CH', lat: 46.02, lon: 7.749, zone: 'ALPI', region: 'alpi' },
  { id: 'vienna', code: 'VIE', name: { it: 'Vienna', en: 'Vienna' }, country: 'AT', lat: 48.208, lon: 16.373, zone: 'NORD-EU', region: 'capitali' },
  { id: 'kitzbuhel', code: 'KTZ', name: { it: 'Kitzbühel', en: 'Kitzbühel' }, country: 'AT', lat: 47.446, lon: 12.392, zone: 'ALPI', region: 'alpi' },
  { id: 'monaco-di-baviera', code: 'MUC', name: { it: 'Monaco di Baviera', en: 'Munich' }, country: 'DE', lat: 48.137, lon: 11.575, zone: 'NORD-EU', region: 'capitali' },
  { id: 'berlino', code: 'BER', name: { it: 'Berlino', en: 'Berlin' }, country: 'DE', lat: 52.52, lon: 13.405, zone: 'NORD-EU', region: 'capitali' },
];

export const REGIONS: Region[] = ['riviera', 'nord', 'sud', 'alpi', 'spagna', 'capitali'];

export const COUNTRIES = ['IT', 'FR', 'MC', 'CH', 'ES', 'GB', 'AT', 'DE'] as const;

export const AIRPORTS: Airport[] = [
  { code: 'LIN', name: 'Milano Linate', cityId: 'milano', lat: 45.445, lon: 9.277 },
  { code: 'MXP', name: 'Milano Malpensa', cityId: 'milano', lat: 45.63, lon: 8.723 },
  { code: 'FCO', name: 'Roma Fiumicino', cityId: 'roma', lat: 41.8, lon: 12.239 },
  { code: 'CIA', name: 'Roma Ciampino', cityId: 'roma', lat: 41.799, lon: 12.595 },
  { code: 'OLB', name: 'Olbia Costa Smeralda', cityId: 'costa-smeralda', lat: 40.899, lon: 9.518 },
  { code: 'NCE', name: "Nice Côte d'Azur", cityId: 'nizza', lat: 43.658, lon: 7.216 },
  { code: 'GVA', name: 'Genève', cityId: 'ginevra', lat: 46.238, lon: 6.109 },
  { code: 'IBZ', name: 'Ibiza', cityId: 'ibiza', lat: 38.873, lon: 1.373 },
];

export const DELIVERY_TYPES: DeliveryType[] = ['hotel', 'villa', 'ufficio', 'marina', 'aeroporto', 'fbo'];

export type ServiceId =
  | 'chauffeur'
  | 'meet-greet'
  | 'fast-track'
  | 'porter'
  | 'security'
  | 'yacht'
  | 'jet'
  | 'helicopter'
  | 'one-way';

export const SERVICES: ServiceId[] = [
  'chauffeur',
  'meet-greet',
  'fast-track',
  'porter',
  'security',
  'yacht',
  'jet',
  'helicopter',
  'one-way',
];

/** Indicative private-jet routes from Milan (rialrent.it). Prices "from". */
export const JET_ROUTES: { from: string; to: string; toCityId: string | null; label: L10n; fromPrice: number }[] = [
  { from: 'milano', to: 'OLB', toCityId: 'costa-smeralda', label: { it: 'Milano – Olbia', en: 'Milan – Olbia' }, fromPrice: 3600 },
  { from: 'milano', to: 'NCE', toCityId: 'nizza', label: { it: 'Milano – Nizza', en: 'Milan – Nice' }, fromPrice: 2700 },
  { from: 'milano', to: 'LON', toCityId: 'londra', label: { it: 'Milano – Londra', en: 'Milan – London' }, fromPrice: 5500 },
  { from: 'milano', to: 'DXB', toCityId: null, label: { it: 'Milano – Dubai', en: 'Milan – Dubai' }, fromPrice: 35900 },
];

/** Real deliveries (rialrent.it). `slot` = photo slot id the client must supply. */
export const DELIVERIES: Delivery[] = [
  { slot: 'porto-cervo-huracan', cityId: 'costa-smeralda', place: 'Porto Cervo', month: { year: 2025, month: 8 }, carId: 'huracan-evo-spyder' },
  { slot: 'st-moritz-g63', cityId: 'saint-moritz', place: 'St. Moritz', month: { year: 2026, month: 2 }, carId: 'g63' },
  { slot: 'monte-carlo-911-gt3', cityId: 'montecarlo', place: 'Monte Carlo', month: { year: 2025, month: 6 }, carId: '911-gt3' },
  { slot: 'courmayeur-rr-sport-sv', cityId: 'courmayeur', place: 'Courmayeur', month: { year: 2026, month: 1 }, carId: 'rr-sport-sv' },
  { slot: 'porto-rotondo-roma-spyder', cityId: 'costa-smeralda', place: 'Porto Rotondo', month: { year: 2025, month: 5 }, carId: 'roma-spyder' },
  { slot: 'portofino-abarth-695', cityId: 'portofino', place: 'Portofino', month: { year: 2025, month: 7 }, carId: 'abarth-695' },
  { slot: 'lago-di-como-v-class', cityId: 'como', place: 'Lago di Como', month: { year: 2025, month: 9 }, carId: 'v-class' },
  { slot: 'cannes-urus', cityId: 'cannes', place: 'Cannes', month: { year: 2025, month: 8 }, carId: 'urus' },
  { slot: 'ginevra-sl-43', cityId: 'ginevra', place: 'Ginevra', month: { year: 2025, month: 4 }, carId: 'sl-43' },
  { slot: 'forte-dei-marmi-a45-s', cityId: 'forte-dei-marmi', place: 'Forte dei Marmi', month: { year: 2025, month: 6 }, carId: 'a45-s' },
  { slot: 'porto-cervo-portofino-m', cityId: 'costa-smeralda', place: 'Porto Cervo', month: { year: 2025, month: 7 }, carId: 'portofino-m' },
  { slot: 'milano-gle-63-s', cityId: 'milano', place: 'Milano', month: { year: 2026, month: 3 }, carId: 'gle-63-s' },
  { slot: 'cortina-defender-110', cityId: 'cortina', place: 'Cortina', month: { year: 2026, month: 2 }, carId: 'defender-110' },
];

export const CLIENTELE: L10n[] = [
  { it: 'Imprenditori', en: 'Entrepreneurs' },
  { it: 'Charter guest', en: 'Charter guests' },
  { it: 'Wedding', en: 'Weddings' },
  { it: 'Executive', en: 'Executives' },
  { it: 'International visitors', en: 'International visitors' },
  { it: 'Luxury travelers', en: 'Luxury travelers' },
];

export const TESTIMONIALS: { name: string; role: L10n; cityId: string; carId: string; quote: L10n }[] = [
  {
    name: 'Andrea M.',
    role: { it: 'Imprenditore', en: 'Entrepreneur' },
    cityId: 'milano',
    carId: 'f8-spider',
    quote: {
      it: 'Un messaggio la sera, la F8 davanti all’ufficio la mattina dopo. Nessuna attesa, nessuna sorpresa.',
      en: 'One message in the evening, the F8 outside my office the next morning. No waiting, no surprises.',
    },
  },
  {
    name: 'Sofia L.',
    role: { it: 'Wedding planner', en: 'Wedding planner' },
    cityId: 'como',
    carId: 'roma-spyder',
    quote: {
      it: 'Per il matrimonio sul lago hanno coordinato tutto loro: orari, consegna in villa, ritiro a fine serata.',
      en: 'For the lakeside wedding they handled everything: timing, villa delivery, pick-up at the end of the night.',
    },
  },
  {
    name: 'Marco T.',
    role: { it: 'Avvocato', en: 'Lawyer' },
    cityId: 'roma',
    carId: 'huracan-evo-spyder',
    quote: {
      it: 'Auto impeccabile e un concierge sempre raggiungibile. È il servizio che ti aspetti a questo livello.',
      en: 'A flawless car and a concierge who always answers. The service you expect at this level.',
    },
  },
];

export const FAQ: { q: L10n; a: L10n }[] = [
  {
    q: { it: 'In quali paesi operate?', en: 'Which countries do you serve?' },
    a: {
      it: 'Consegniamo in tutta Europa: Italia, Francia, Principato di Monaco, Svizzera, Spagna, Regno Unito, Austria e Germania.',
      en: 'We deliver across Europe: Italy, France, the Principality of Monaco, Switzerland, Spain, the United Kingdom, Austria and Germany.',
    },
  },
  {
    q: { it: 'Che auto avete in flotta?', en: 'Which cars are in the fleet?' },
    a: {
      it: '48 vetture a catalogo tra supercar, GT, SUV di lusso e van executive: Ferrari, Lamborghini, Porsche, Mercedes-AMG, Land Rover e altre.',
      en: '48 cars in the catalogue across supercars, GTs, luxury SUVs and executive vans: Ferrari, Lamborghini, Porsche, Mercedes-AMG, Land Rover and more.',
    },
  },
  {
    q: { it: 'Consegnate in aeroporto o in hotel?', en: 'Do you deliver to airports or hotels?' },
    a: {
      it: 'Sì: hotel, villa, aeroporto o FBO per i voli privati. La consegna è dedicata, con un nostro incaricato.',
      en: 'Yes: hotel, villa, airport or FBO for private flights. Delivery is dedicated, handled by one of our staff.',
    },
  },
  {
    q: { it: 'Quali documenti servono?', en: 'Which documents do I need?' },
    a: {
      it: 'Patente valida e documento d’identità; il concierge conferma i requisiti per la vettura scelta. [dettagli da confermare]',
      en: 'A valid driving licence and ID; the concierge confirms the requirements for the chosen car. [details to be confirmed]',
    },
  },
  {
    q: { it: 'Posso riconsegnare in un altro paese?', en: 'Can I return the car in another country?' },
    a: {
      it: 'Sì, il noleggio one-way in altra nazione è disponibile su quotazione.',
      en: 'Yes, one-way rentals to another country are available on quotation.',
    },
  },
  {
    q: { it: 'Quanto costa?', en: 'How much does it cost?' },
    a: {
      it: 'Si parte da circa €1.200 al giorno; il prezzo dipende da vettura, durata e consegna.',
      en: 'Prices start from around €1,200 per day, depending on car, duration and delivery.',
    },
  },
];

export const CONTACTS = {
  whatsapp: '+39 320 293 4909',
  whatsappDigits: '393202934909',
  phone: '+39 320 293 4909',
  email: 'info@rialrent.it',
  address: 'Milano, Via Privata Platone',
  company: 'RIAL S.R.L.',
  vat: 'P.IVA 12430320965',
  social: '@rialrent',
  socialNetworks: ['Instagram', 'TikTok', 'Facebook'],
  site: 'rialrent.it',
};

/** Known numbers. `null` = unknown → render PLACEHOLDER. */
export const STATS: { id: 'cars' | 'since' | 'countries' | 'deliveries' | 'clients'; value: number | null }[] = [
  { id: 'cars', value: 48 },
  { id: 'since', value: 2021 },
  { id: 'countries', value: 8 },
  { id: 'deliveries', value: null },
  { id: 'clients', value: null },
];

// ——— lookups ———
export const carById = (id: string | null | undefined) => FLEET.find((c) => c.id === id);
export const cityById = (id: string | null | undefined) => CITIES.find((c) => c.id === id);
export const brandBySlug = (slug: BrandSlug) => BRANDS.find((b) => b.slug === slug)!;
export const carName = (c: Car) => `${brandBySlug(c.brand).name} ${c.model}`;
export const brandsInFleet = () => BRANDS.filter((b) => FLEET.some((c) => c.brand === b.slug));
export const carsOfBrand = (slug: BrandSlug) => FLEET.filter((c) => c.brand === slug);
