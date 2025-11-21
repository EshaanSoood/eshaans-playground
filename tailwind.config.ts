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
        // Project accent colors
        'project-blue': '#3b82f6',
        'project-emerald': '#10b981',
        'project-violet': '#8b5cf6',
        'project-amber': '#f59e0b',
        'project-rose': '#f43f5e',
        'project-cyan': '#06b6d4',
      },
    },
    fontFamily: {
      sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
  },
  plugins: [],
}
export default config

