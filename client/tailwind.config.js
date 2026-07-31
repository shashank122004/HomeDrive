/** Vault/ledger palette: warm charcoal + amber accent, mono for structure. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15161A',
        panel: '#1C1D22',
        line: '#2A2B31',
        paper: '#F3F1EC',
        amber: { DEFAULT: '#E8A33D', dim: '#B87F26' },
        teal: '#3E7C74',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
