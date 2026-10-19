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
      lead: '48 vetture in collezione. Qui alcune, sotto la luce giusta.',
      prev: 'Vettura precedente',
      next: 'Vettura successiva',
      request: 'Richiedi',
      all: 'Tutta la collezione',
      catalogTitle: 'La *collezione*.',
      catalogLead: '48 vetture in collezione. Filtri per categoria e marca.',
    },
    concierge: {
      title: 'Oltre il noleggio. *Un concierge personale.*',
      services: 'Oltre la vettura',
    },
    guarantees: 'Garanzie',
    deliveries: {
      title: 'Dove siamo *stati*.',
    },
    testimonials: {
      title: 'Parole *riservate*.',
    },
    faq: {
      title: 'Domande *frequenti*.',
    },
    contact: {
      eyebrow: 'Concierge sempre attivo',
      title: 'Un messaggio. *Il resto è nostro.*',
      lead: 'Risposta in meno di un’ora.',
    },
    footer: {
      line: 'Dal molo al volante.',
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
      lead: '48 cars in the collection. A few of them, in the right light.',
      prev: 'Previous car',
      next: 'Next car',
      request: 'Request',
      all: 'The whole collection',
      catalogTitle: 'The *collection*.',
      catalogLead: '48 cars in the collection. Filter by category and marque.',
    },
    concierge: {
      title: 'Beyond rental. *A personal concierge.*',
      services: 'Beyond the car',
    },
    guarantees: 'Guarantees',
    deliveries: {
      title: 'Where we’ve *been*.',
    },
    testimonials: {
      title: 'Words, in *confidence*.',
    },
    faq: {
      title: 'Frequently *asked*.',
    },
    contact: {
      eyebrow: 'Concierge always on',
      title: 'One message. *We handle the rest.*',
      lead: 'Reply in under an hour.',
    },
    footer: {
      line: 'From the dock to the wheel.',
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
