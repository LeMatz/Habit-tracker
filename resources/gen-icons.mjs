import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Brand marks -----------------------------------------------------------
// Habit-tracker identity: a cyan progress ring with a check, on deep navy.
const BG = '#020617';
const CYAN = '#06b6d4';

// App icon (1024x1024) — full-bleed background so the adaptive mask is clean.
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${BG}"/>
  <g transform="translate(512,512)">
    <circle r="300" fill="none" stroke="#0e2a33" stroke-width="70"/>
    <circle r="300" fill="none" stroke="${CYAN}" stroke-width="70"
            stroke-linecap="round" stroke-dasharray="1650 1885"
            transform="rotate(-90)"/>
    <path d="M -150 10 L -40 130 L 175 -120"
          fill="none" stroke="${CYAN}" stroke-width="80"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Splash (2732x2732) — centered mark on the same navy background.
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="${BG}"/>
  <g transform="translate(1366,1366)">
    <circle r="300" fill="none" stroke="#0e2a33" stroke-width="70"/>
    <circle r="300" fill="none" stroke="${CYAN}" stroke-width="70"
            stroke-linecap="round" stroke-dasharray="1650 1885"
            transform="rotate(-90)"/>
    <path d="M -150 10 L -40 130 L 175 -120"
          fill="none" stroke="${CYAN}" stroke-width="80"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

await sharp(Buffer.from(iconSvg)).png().toFile(join(__dirname, 'icon.png'));
await sharp(Buffer.from(splashSvg)).png().toFile(join(__dirname, 'splash.png'));
// Dark splash variant (same art — already dark).
await sharp(Buffer.from(splashSvg)).png().toFile(join(__dirname, 'splash-dark.png'));

console.log('Generated resources/icon.png, splash.png, splash-dark.png');
