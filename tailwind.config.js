/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A2A57',        // navy profundo (derivado del azul de marca) — texto principal
        paper: '#FFFFFF',      // fondo — blanco, como en los logos
        paper2: '#F1F5FB',     // fondo secundario / cards — azul muy pálido
        azul: {
          DEFAULT: '#024293',  // azul institucional (mapa/texto del logo Misión Panamericana)
          dark: '#01316E',
          light: '#3E63B8',
        },
        gold: {
          DEFAULT: '#FFCD02',  // dorado del rombo del logo
          dark: '#E0AF00',
          light: '#FFE070',
        },
        rojo: '#E1011D',       // rojo de Colombia en el logo — acento raro
        indigo: '#3E52C3',     // azul del monograma CFE — acento secundario
        line: '#E1E8F2',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        amanecer: 'linear-gradient(180deg, #FFE070 0%, #FFFFFF 65%)',
      },
      boxShadow: {
        brand: '0 24px 48px -16px rgba(2,66,147,0.28)',
        'brand-sm': '0 10px 24px -8px rgba(2,66,147,0.18)',
        gold: '0 16px 32px -12px rgba(224,175,0,0.35)',
      },
    },
  },
  plugins: [],
};
