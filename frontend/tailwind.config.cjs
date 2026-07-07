// tailwind.config.cjs
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#147EB3', // Amazon‑style blue
        graybg: '#F5F7FB',   // Light gray background
      },
      backgroundImage: theme => ({
        'gradient-blue': 'linear-gradient(135deg, #147EB3 0%, #3b82f6 100%)',
      }),
    },
  },
  plugins: [],
};
