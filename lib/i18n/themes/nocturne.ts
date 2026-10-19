import { defineThemeDict } from '../types';

// Strings used only by the nocturne style. Mounted under `th.nocturne`.
// `*word*` marks the words set in Bodoni italic (rendered by <Emph>).
export const nocturne = defineThemeDict({
  it: {
    hero: {
      title: 'L’Europa, *consegnata*.',
      showing: 'In vetrina',
      scroll: 'Scorri',
    },
    viewing: {
      eyebrow: 'Private Viewing',
      title: 'Una selezione *privata*.',
      lead: '48 vetture a catalogo. Qui alcune, sotto la luce giusta.',
      prev: 'Vettura precedente',
      next: 'Vettura successiva',
      request: 'Richiedi',
      all: 'Tutta la flotta',
      catalogTitle: 'La *collezione*.',
      catalogLead: '48 vetture a catalogo. Filtri per categoria e marca.',
    },
    concierge: {
      title: 'Più che noleggio. *Concierge.*',
      services: 'Oltre la vettura',
    },
    guarantees: 'Garanzie',
    deliveries: {
      title: 'Consegne *reali*.',
    },
    testimonials: {
      title: 'Parole *riservate*.',
    },
    faq: {
      title: 'Domande *frequenti*.',
    },
    contact: {
      eyebrow: 'Concierge H24 7/7',
      title: 'Un messaggio. *Il resto è nostro.*',
      lead: 'Risposta in meno di un’ora.',
    },
    footer: {
      line: 'Dalla marina alla strada.',
    },
    builder: {
      eyebrow: 'Richiesta riservata',
      aside: 'La sua richiesta',
      showing: 'In vetrina · {n} / {total}',
      drag: 'Trascina per ruotare',
      selector: 'Seleziona la vettura',
      cities: '{n} città',
      duration: 'Durata',
    },
    summary: {
      eyebrow: 'Su invito',
      title: 'Il suo *viaggio*.',
      lead: 'Controlli i dettagli. Il concierge conferma in meno di un’ora.',
      message: 'Il messaggio al concierge',
    },
  },
  en: {
    hero: {
      title: 'Europe, *delivered*.',
      showing: 'On view',
      scroll: 'Scroll',
    },
    viewing: {
      eyebrow: 'Private Viewing',
      title: 'A *private* selection.',
      lead: '48 cars in the catalogue. A few of them, in the right light.',
      prev: 'Previous car',
      next: 'Next car',
      request: 'Request',
      all: 'The whole fleet',
      catalogTitle: 'The *collection*.',
      catalogLead: '48 cars in the catalogue. Filter by category and marque.',
    },
    concierge: {
      title: 'More than rental. *Concierge.*',
      services: 'Beyond the car',
    },
    guarantees: 'Guarantees',
    deliveries: {
      title: 'Real *deliveries*.',
    },
    testimonials: {
      title: 'Words, in *confidence*.',
    },
    faq: {
      title: 'Frequently *asked*.',
    },
    contact: {
      eyebrow: 'Concierge 24/7',
      title: 'One message. *We handle the rest.*',
      lead: 'Reply in under an hour.',
    },
    footer: {
      line: 'From the marina to the road.',
    },
    builder: {
      eyebrow: 'Private request',
      aside: 'Your request',
      showing: 'On view · {n} / {total}',
      drag: 'Drag to rotate',
      selector: 'Select the car',
      cities: '{n} cities',
      duration: 'Duration',
    },
    summary: {
      eyebrow: 'By invitation',
      title: 'Your *journey*.',
      lead: 'Review the details. The concierge confirms in under an hour.',
      message: 'Your message to the concierge',
    },
  },
});
