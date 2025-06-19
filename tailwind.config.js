/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        light: ['Inter_300Light', 'sans-serif'],
        regular: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium'],
        semiBold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      fontSize: {
        '2xs': ['12px', { lineHeight: '100%', fontWeight: '400' }], // Caption 2xs
        xs: '14px',
        base: ['16px', { lineHeight: '100%', fontWeight: '400' }], // Body Text Regular
        lg: ['18px', { lineHeight: '100%', fontWeight: '500' }], // Subheading
        xl: '24px',
      },
      colors: {
        primary: '#111111', // Primary Text
        background: '#FFFFFF', // Background
        muted: '#9CA3AF', // Muted Text
        border: '#E5E7EB', // Border
        accent: '#FFB020',
      },
    },
  },
  plugins: [],
};
