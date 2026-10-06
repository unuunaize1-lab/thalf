import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'THALF Admin Console',
    short_name: 'THALF Admin',
    description: 'THALF Artisanal Chocolates Administrative & Management Desk',
    start_url: '/secret-admin',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#1C1917',
    theme_color: '#1C1917',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
