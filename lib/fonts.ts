// All Google fonts, declared once. Each exposes a CSS variable used by the
// theme tokens (lib/theme-tokens.ts). Only Nocturne's fonts are preloaded
// (default theme); the browser fetches the others only when a theme uses them.
import {
  Anton,
  Archivo,
  Bodoni_Moda,
  DM_Sans,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Space_Mono,
} from 'next/font/google';

const bodoni = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--f-bodoni', display: 'swap' });
const interTight = Inter_Tight({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--f-inter-tight', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz', 'SOFT'], variable: '--f-fraunces', display: 'swap', preload: false });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--f-dm-sans', display: 'swap', preload: false });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--f-anton', display: 'swap', preload: false });
const archivo = Archivo({ subsets: ['latin'], variable: '--f-archivo', display: 'swap', preload: false });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--f-space-mono', display: 'swap', preload: false });
const geist = Geist({ subsets: ['latin'], variable: '--f-geist', display: 'swap', preload: false });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--f-geist-mono', display: 'swap', preload: false });
const inter = Inter({ subsets: ['latin'], variable: '--f-inter', display: 'swap', preload: false });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--f-jetbrains', display: 'swap', preload: false });

export const fontVariables = [
  bodoni, interTight, fraunces, dmSans, anton, archivo, spaceMono, geist, geistMono, inter, jetbrains,
]
  .map((f) => f.variable)
  .join(' ');
