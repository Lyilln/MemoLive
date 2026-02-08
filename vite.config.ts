import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/MemoLive/', 
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MemoLive Pro',
        short_name: 'MemoLive',
        description: 'AI 同人小說創作神器',
        theme_color: '#D0D3EC',
        background_color: '#D0D3EC',
        display: 'standalone',
        start_url: '/MemoLive/', // 這裡我有幫你加上專案路徑，這樣打開才不會404
        scope: '/MemoLive/',     // 這裡也是
        icons: [
          {
            src: 'pwa-192x192.png', // ★★★ 修正：拿掉前面的斜線 (變成相對路徑)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // ★★★ 修正：拿掉前面的斜線
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})