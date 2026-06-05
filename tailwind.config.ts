import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
      colors: {
        paper: '#f7f4ec',
        ink: '#211f1b',
        'ink-muted': '#5a5750',
        'ink-faint': '#9c9890',
        accent: '#1f4a3a',
        'accent-light': '#2d6b53',
        positive: '#1a5c35',
        caution: '#b85c00',
        negative: '#7a1a1a',
        secondary: '#2a4a6b',
      },
      fontSize: {
        '2xs': '0.625rem',
        xs: '0.75rem',
      },
    },
  },
  plugins: [],
}

export default config
