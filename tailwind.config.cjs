/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
				'deep-blue': '#001B48',
				'dark-blue': '#02457A',
				'normal-blue': '#018ABE',
				'light-blue': '#97CADB',
				'weak-blue': '#D6E7EE',
				'saftech-black': '#353A40',
				'saftech-gray': '#ADB6BD',
				'saftech-white': '#F5F5F5',
			},
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}

