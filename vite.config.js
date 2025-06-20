import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//     react()],
//     // base: '/',
//     // base: '/Pawthway/',
//     base: mode === 'production' ? '/Pawthway/' : '/', // Use /Pawthway/ for deploy, / for local dev
// })

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react()],
  base: mode === 'production' ? '/Pawthway/' : '/',
}))
