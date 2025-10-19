/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        neutral: { DEFAULT:'#1f2937', '100':'#f3f4f6','200':'#e5e7eb','500':'#6b7280','600':'#4b5563','700':'#374151','800':'#1f2937','900':'#111827'},
        primary: { DEFAULT:'#FF6801','100':'#FFE8D6','300':'#FFB984','400':'#FF944B','500':'#FF6801','600':'#F56100','700':'#E65D00' },
        'trefa-blue':'#274C77',
        'trefa-dark-blue':'#0D274E',
        'brand-primary':'#FF6801',
        'brand-navy':'#0B2540',
        'brand-bg':'#F7F8FA',
        'brand-surface':'#FFFFFF',
        'brand-muted':'#556675',
        'brand-success':'#1E8A56',
        'brand-danger':'#D64500',
        'brand-secondary':'#FFB37A',
        emerald:{ '600':'#059669' },
        indigo:{ '600':'#4f46e5' }
      }
    },
  },
  plugins: [],
};