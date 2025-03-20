/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#155AEF',
          light: '#4680F0',  // 亮色版本
          dark: '#1040A8',   // 暗色版本
        }
      }
    },
  },
  plugins: [],
}