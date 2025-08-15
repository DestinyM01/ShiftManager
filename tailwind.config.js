/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",   // gris azulado oscuro (fondo)
        panel: "#111827",     // paneles
        accent: "#1e40af",    // azul de acento
        accent2: "#60a5fa",   // azul claro
      }
    },
  },
  plugins: [],
}
