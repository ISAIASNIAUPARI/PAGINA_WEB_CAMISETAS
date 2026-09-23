import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, JetBrains_Mono, Space_Grotesk } from 'next/font/google'

import theme from '@/content/theme.json'

import './globals.css'

const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-grotesk' })
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'LAMS STUDIO — Camisetas de algodón premium',
  description: 'Camisetas de algodón peinado de fibra larga en colores atemporales. Piezas limitadas cada temporada.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${grotesk.variable} ${instrument.variable} ${jetbrains.variable}`}
      style={{ '--color-primary': theme.colorPrimary, '--color-secondary': theme.colorSecondary, '--color-accent': theme.colorAccent } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        {/* Activa las animaciones de entrada solo si hay JS (si no, todo queda visible). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="grain">{children}</body>
    </html>
  )
}
