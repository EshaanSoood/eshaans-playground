import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-main': 'var(--bg-main)',
        'bg-card': 'var(--bg-card)',
        'bg-soft': 'var(--bg-soft)',
        // Text
        'text-main': 'var(--text-main)',
        'text-secondary': 'var(--text-secondary)',
        'text-light': 'var(--text-light)',
        // Blues
        'blue-soft': 'var(--blue-soft)',
        'blue-muted': 'var(--blue-muted)',
        'blue-deep': 'var(--blue-deep)',
        // Oranges
        'orange-soft': 'var(--orange-soft)',
        'orange-main': 'var(--orange-main)',
        'orange-deep': 'var(--orange-deep)',
        // Borders
        'border-light': 'var(--border-light)',
        'border-soft': 'var(--border-soft)',
        // UI roles
        'link': 'var(--link)',
        'link-hover': 'var(--link-hover)',
        'accent': 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        paper: '0 20px 55px rgba(35, 67, 113, 0.10)',
        'paper-strong': '0 28px 70px rgba(35, 67, 113, 0.16)',
      },
    },
  },
  plugins: [],
}
export default config
