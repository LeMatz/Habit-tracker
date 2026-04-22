// Synthesize the five app sounds as WAV files, mirroring the web oscillator
// sequences from utils/soundService.ts. Run with: node scripts/generate-sounds.mjs
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function tone({ freq, type = 'sine', duration, volume = 0.1, delay = 0 }) {
  const total = Math.floor((delay + duration) * SAMPLE_RATE);
  const out = new Float32Array(total);
  const startSample = Math.floor(delay * SAMPLE_RATE);
  for (let i = startSample; i < total; i++) {
    const t = (i - startSample) / SAMPLE_RATE;
    // exponential decay matching gain.exponentialRampToValueAtTime(0.0001, t+duration)
    const env = volume * Math.exp(-4.6 * (t / duration));
    const phase = 2 * Math.PI * freq * t;
    let sample;
    if (type === 'sine') sample = Math.sin(phase);
    else if (type === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else if (type === 'square') sample = Math.sign(Math.sin(phase));
    else sample = Math.sin(phase);
    out[i] = sample * env;
  }
  return out;
}

function mix(...tracks) {
  const len = Math.max(...tracks.map((t) => t.length));
  const out = new Float32Array(len);
  for (const track of tracks) {
    for (let i = 0; i < track.length; i++) out[i] += track[i];
  }
  return out;
}

const outDir = path.resolve('assets/sounds');
fs.mkdirSync(outDir, { recursive: true });

// success: ascending arpeggio (matches soundService.playSuccess)
writeWav(
  path.join(outDir, 'success.wav'),
  mix(
    tone({ freq: 440, duration: 0.5, delay: 0 }),
    tone({ freq: 554.37, duration: 0.5, delay: 0.1 }),
    tone({ freq: 659.25, duration: 0.6, delay: 0.2 }),
    tone({ freq: 880, duration: 0.8, delay: 0.3, volume: 0.05 })
  )
);

// taskComplete: double tone (matches playTaskComplete)
writeWav(
  path.join(outDir, 'taskComplete.wav'),
  mix(
    tone({ freq: 523.25, type: 'triangle', duration: 0.3, delay: 0 }),
    tone({ freq: 783.99, type: 'triangle', duration: 0.4, delay: 0.15 })
  )
);

// diceTick: short click (matches playDiceTick)
writeWav(
  path.join(outDir, 'diceTick.wav'),
  tone({ freq: 150, type: 'square', duration: 0.05, volume: 0.02 })
);

// diceResult: two-note reveal (matches playDiceResult)
writeWav(
  path.join(outDir, 'diceResult.wav'),
  mix(
    tone({ freq: 392, duration: 0.5, delay: 0 }),
    tone({ freq: 523.25, duration: 0.8, delay: 0.15 })
  )
);

// purchase: ka-ching (matches playPurchase)
writeWav(
  path.join(outDir, 'purchase.wav'),
  mix(
    tone({ freq: 987.77, duration: 0.4, volume: 0.08, delay: 0 }),
    tone({ freq: 1318.51, duration: 0.6, volume: 0.05, delay: 0.1 })
  )
);

console.log('Wrote 5 WAV files to', outDir);
