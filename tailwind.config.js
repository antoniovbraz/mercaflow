/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ml: {
          yellow: '#FFF159',
          blue: '#3483FA',
          green: '#00A650',
          orange: '#FF6600',
          red: '#F23D4F',
          gray: {
            100: '#F5F5F5',
            200: '#EBEBEB',
            300: '#999999',
            400: '#666666',
            500: '#333333',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}