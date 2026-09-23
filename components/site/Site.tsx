'use client'

import React from 'react'

import { useEdit } from '@/components/editable/Editable'
import { MotionRoot } from '@/components/motion'
import type { Content, SectionId } from '@/lib/types'

import { About } from './About'
import { Collection } from './Collection'
import { Newsletter, Social, Testimonials } from './Community'
import { Contact, Footer } from './Contact'
import { Hero } from './Hero'
import { Nav } from './Nav'
import { CartDrawer, Cookies, Floating } from './Overlays'
import { Product3d } from './Product3d'
import { StoreProvider } from './Store'

type OnChange = <K extends SectionId>(id: K, data: Content[K]) => void

/**
 * La página completa. El sitio público la usa sin `onChange`; /admin la usa
 * con `onChange` (dentro de EditContext) y cada texto/imagen pasa a editable.
 */
export function Site({ content: c, onChange }: { content: Content; onChange?: OnChange }) {
  const { edit } = useEdit()
  const on = <K extends SectionId>(id: K) => (onChange ? (d: Content[K]) => onChange(id, d) : undefined)

  return (
    <StoreProvider>
      <MotionRoot />
      <div className={`min-h-screen bg-ink [background:radial-gradient(1200px_700px_at_80%_-10%,rgba(75,19,102,.35),transparent_60%),radial-gradient(900px_600px_at_-10%_30%,rgba(45,10,58,.4),transparent_60%),#050505] ${edit ? 'admin-mode' : ''}`}>
        <Nav brand={c.site.brand} marquee={c.marquee} onMarquee={on('marquee')} />
        <main>
          <Hero data={c.hero} products={c.collection.products} onChange={on('hero')} />
          <Collection data={c.collection} onChange={on('collection')} />
          <About data={c.about} onChange={on('about')} />
          <Product3d data={c.product3d} onChange={on('product3d')} />
          <Testimonials data={c.testimonials} onChange={on('testimonials')} />
          <Social data={c.social} onChange={on('social')} />
          <Newsletter data={c.newsletter} onChange={on('newsletter')} />
          <Contact data={c.contact} whatsappLink={c.site.whatsappLink} onChange={on('contact')} />
        </main>
        <Footer brand={c.site.brand} data={c.footer} social={c.social.links} onChange={on('footer')} />
        {!edit && (
          <>
            <Floating site={c.site} />
            <Cookies />
          </>
        )}
        <CartDrawer site={c.site} />
      </div>
    </StoreProvider>
  )
}
