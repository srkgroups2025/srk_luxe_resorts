/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ⚡ Add custom breakpoints for resort image gallery
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      // ⚡ Predefine animation names for better tree-shaking
      animation: {
        "loader": "loader 1.4s infinite ease-in-out",
        "fadeIn": "fadeIn 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
  // ⚡ SAFELIST - Only include used classes (remove unused Tailwind utilities)
  safelist: [
    // Only list classes that are dynamically generated
    // Example: if room types are generated dynamically
    // "bg-amber-50", "text-amber-900", etc.
  ],
};

