import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: './', // or '/' works too
})

// export default defineConfig(({ mode }) => ({
//   plugins: [
//     tailwindcss(),
//     react()],
//   base: mode === 'production' ? '/Pawthway/' : '/',
// }))
