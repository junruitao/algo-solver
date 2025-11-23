import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set this to your repository name for GitHub Pages!
  // If your repo is [https://github.com/user/algo-solver](https://github.com/user/algo-solver), set base to '/algo-solver/'
  base: '/leetcode-solver/', 
})