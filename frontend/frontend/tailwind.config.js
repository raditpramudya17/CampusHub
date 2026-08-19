/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      colors: {
        navy: '#1E2A45',
        cream: '#F7F6F2',
        card: '#F0E9D8',
        cardhover: '#EBE2CC',
        red: '#C0453A',
        amber: '#E8A93C',
        green: '#5F7D6B',
        muted: '#4A5670',
        line: '#C9BEA0',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
