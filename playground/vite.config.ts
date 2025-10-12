/*
 * @Date: 2025-10-10 21:39:32
 * @Description: 
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001/api',
    }
  }
})
