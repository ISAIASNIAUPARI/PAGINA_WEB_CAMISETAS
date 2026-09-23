'use client'

import React from 'react'

import type { SiteData } from '@/lib/types'

import { CartList, CartSummary } from './Overlays'
import { StoreProvider, useStore } from './Store'

function Inner({ site }: { site: SiteData }) {
  const { items } = useStore()
  return (
    <div className="mx-auto max-w-[1000px] px-[clamp(16px,4vw,32px)] pt-[clamp(32px,6vw,64px)] pb-32">
      <p className="mb-3.5 font-mono text-[11px] tracking-[.22em] text-mute uppercase">Tu cesta</p>
      <h1 className="mb-10 text-[clamp(32px,5vw,56px)] leading-[.95] font-medium tracking-[-.04em] text-snow">
        {items.length ? 'Revisa tu pedido.' : 'Tu cesta.'}
      </h1>
      {items.length ? (
        <div className="grid items-start gap-12 md:grid-cols-[1.4fr_1fr]">
          <CartList items={items} />
          <div className="sticky top-24 rounded-md border border-line bg-ink-2 p-6">
            <h2 className="mb-5 text-lg font-semibold text-snow">Resumen</h2>
            <CartSummary site={site} />
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-mute">
          <p className="mb-5">Tu cesta está vacía.</p>
          <a href="/#coleccion" className="text-lilac underline">
            Ver la colección
          </a>
        </div>
      )}
    </div>
  )
}

export function CartPage({ site }: { site: SiteData }) {
  return (
    <StoreProvider>
      <div className="min-h-screen [background:radial-gradient(1200px_700px_at_80%_-10%,rgba(75,19,102,.28),transparent_60%),#050505]">
        <nav className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-fog/10 bg-ink/90 px-[clamp(16px,4vw,56px)] backdrop-blur-xl">
          <a href="/" className="text-sm font-medium tracking-[.42em] text-snow no-underline">
            {site.brand}
          </a>
          <a href="/#coleccion" className="font-mono text-[11px] tracking-[.1em] text-mute uppercase no-underline hover:text-fog">
            Seguir comprando
          </a>
        </nav>
        <Inner site={site} />
      </div>
    </StoreProvider>
  )
}
