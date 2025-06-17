/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        light: ['SpaceGrotesk_300Light', 'sans-serif'],
        regular: ['SpaceGrotesk_400Regular', 'sans-serif'],
        medium: ['SpaceGrotesk_500Medium'],
        semiBold: ['SpaceGrotesk_600SemiBold'],
        bold: ['SpaceGrotesk_700Bold'],
      },
      fontSize: {
        '2xs': '12px',
        xs: '14px',
        base: '16px',
        lg: '18px',
        xl: '24px',
      },
      colors: {
        primary: '#111111',
        background: '#FFFFFF',
        muted: '#9CA3AF',
        border: '#E5E7EB',
        accent: '#FFB020',
      },
    },
  },
  plugins: [],
};
