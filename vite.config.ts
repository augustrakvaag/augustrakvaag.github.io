import { defineConfig } from 'vite'
  export default defineConfig({
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          poker: 'poker/poker.html',
          intervals: 'intervals/index.html',
          hovekalk: 'hovekalk/hove.html',
        } 
      }
    } 
  })