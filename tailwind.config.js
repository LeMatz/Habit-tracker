/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './constants.tsx',
    './components/**/*.{ts,tsx}',
    './screens/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  // These four classes are built dynamically in components/HabitLoopView.tsx
  // (shadow-${step.color.split('-')[1]}-500/20), so the scanner can't see the
  // literal strings. Keep in sync if the loop step colors change.
  safelist: [
    'shadow-yellow-500/20',
    'shadow-pink-500/20',
    'shadow-indigo-500/20',
    'shadow-emerald-500/20',
  ],
};
