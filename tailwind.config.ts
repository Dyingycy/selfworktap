import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
          cyan: '#32ADE6',
          bg: {
            light: '#F2F2F7',
            cardLight: '#FFFFFF',
            dark: '#000000',
            cardDark: '#1C1C1E',
            secondaryDark: '#2C2C2E',
            tertiaryDark: '#3A3A3C',
          },
          separator: {
            light: 'rgba(60, 60, 67, 0.29)',
            dark: 'rgba(84, 84, 88, 0.45)',
          }
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
      boxShadow: {
        'ios-card': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'ios-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'ios-card': '20px',
        'ios-btn': '14px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};

export default config;
