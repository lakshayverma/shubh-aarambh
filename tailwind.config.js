/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--theme-primary)',
          'primary-hover': 'var(--theme-primary-hover)',
          'primary-light': 'var(--theme-primary-light)',
          secondary: 'var(--theme-secondary)',
          'secondary-light': 'var(--theme-secondary-light)',
          accent: 'var(--theme-accent)',
          background: 'var(--theme-background)',
          card: 'var(--theme-card)',
          border: 'var(--theme-border)',
          'text-main': 'var(--theme-text-main)',
          'text-muted': 'var(--theme-text-muted)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
