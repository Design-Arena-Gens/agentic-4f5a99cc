/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#f59e42',
        background: '#f9fafb',
        text: '#1e293b',
        secondary: '#64748b',
        success: '#22c55e',
        error: '#ef4444'
      }
    },
  },
  plugins: [],
}
