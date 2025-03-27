/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': 'var(--primary)',
          'primary-light': 'var(--primary-light)',
          'primary-dark': 'var(--primary-dark)',
          'secondary': 'var(--secondary)',
          'accent': 'var(--accent)',
          'warning': 'var(--warning)',
          'danger': 'var(--danger)',
          'success': 'var(--success)',
        },
        boxShadow: {
          'sm': 'var(--shadow-sm)',
          'DEFAULT': 'var(--shadow)',
          'md': 'var(--shadow-md)',
          'lg': 'var(--shadow-lg)',
        },
        borderRadius: {
          'DEFAULT': 'var(--radius)',
        },
        fontFamily: {
          'sans': ['Nunito', 'sans-serif'],
          'heading': ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }