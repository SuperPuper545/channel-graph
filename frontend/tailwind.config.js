/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #ffffff)',
          secondaryBg: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
          text: 'var(--tg-theme-text-color, #000000)',
          hint: 'var(--tg-theme-hint-color, #707579)',
          link: 'var(--tg-theme-link-color, #2481cc)',
          button: 'var(--tg-theme-button-color, #2481cc)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
          accent: '#3390ec',
          card: 'var(--tg-theme-card-bg, #ffffff)',
          border: 'var(--tg-theme-border-color, #e4e4e7)'
        }
      }
    },
  },
  plugins: [],
}
