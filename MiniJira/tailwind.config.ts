import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-md': ['2.75rem', { letterSpacing: '-0.02em', lineHeight: '1.1' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        'label-sm': ['0.6875rem', { letterSpacing: '0.05em', lineHeight: '1.4' }],
      },
      colors: {
        surface: {
          DEFAULT: '#f9f9fb',
          'container-low': '#f2f4f6',
          'container-lowest': '#ffffff',
          container: '#eaeff3',
          'container-high': '#e4e9ee',
          'container-highest': '#dde3e9',
        },
        primary: {
          DEFAULT: '#005bbf',
          dim: '#0050a8',
          container: '#d7e2ff',
          on: '#ffffff',
          'on-fixed': '#003d84',
        },
        tertiary: {
          container: '#69f6b8',
          'on-fixed': '#00452d',
        },
        error: {
          container: '#fe8983',
          'on-container': '#752121',
        },
        outline: {
          variant: '#acb3b8',
        },
        'inverse-surface': '#0c0e10',
        'on-surface': '#0c0e10',
      },
      borderRadius: {
        md: '0.375rem',
        xl: '0.75rem',
      },
      boxShadow: {
        ambient: '0px 12px 32px rgba(12, 14, 16, 0.04)',
      },
      minWidth: {
        'kanban-col': '280px',
      },
      width: {
        'kanban-col': '280px',
      },
    },
  },
  plugins: [],
} satisfies Config
