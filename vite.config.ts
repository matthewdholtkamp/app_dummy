import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path is the repo name so asset URLs resolve under
// https://<user>.github.io/app_dummy/ when deployed via GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/app_dummy/' : '/',
})
