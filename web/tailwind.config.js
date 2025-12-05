export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'np-bg': '#141414',       // Fondo muy oscuro
        'np-panel': '#1f1f1f',    // Fondo de los slots/paneles
        'np-yellow': '#facc15',   // Amarillo intenso (Yellow-400 de Tailwind)
        'np-text': '#e5e5e5',     // Texto casi blanco
        'np-border': '#333333',   // Bordes sutiles
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Asegúrate de que se vea limpio
      }
    },
  },
  plugins: [],
}