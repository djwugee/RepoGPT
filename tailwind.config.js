module.exports = {
  content: ['./src/components/**/*.{ts,tsx,js,jsx}', './src/pages/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F5DF4D',
        secondary: '#C6CEC5',
        tertiary: '#F5DF4D',
        accent: '#F5DF4D',
        background: '#0f0f0f',
        surface: '#1f1f1f',
        error: '#FF8A59'
      },
      fontSize: {
        '2xs': '.625rem',
        '3xs': '.5rem'
      }
    }
  },
  variants: {},
  plugins: []
}
