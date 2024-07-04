/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/**/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Nunito Sans'", 'sans-serif']
      },
      colors: {
        'accent-1': '#FF0000',
        'accent-2': '#FF0000',
        'accent-3': '#800000',
        'core-darkest': '#121421',
        'core-darker': '#1E212D',
        menu: '#1F212D',
        core: '#707179',
        'core-light': '#B8B9BD',
        'core-lighter': '#E3E9F0',
        'core-lightest': '#F6F8FA',
        ok: '#3DD493',
        warning: '#FFA244',
        danger: '#FF4444',
        'orange-border': '#F46F2D',
        redlinx: '#DB2F60'
      },
      flexBasis: {
        '1/8': '12.5%'
      },
      margin: {
        '2px': '2px',
        '3px': '3px'
      },
      borderWidth: {
        3: '3px'
      },
      height: {
        '3px': '3px'
      }
    }
  },
  plugins: []
}
