'use client'

import React from 'react'

import { useEditMode } from '@/components/editable/Editable'
import { MotionRoot } from '@/components/motion'
import { DynamicSection } from '@/components/sections/DynamicSection'
import type { Content, DynamicSectionType } from '@/lib/types'

import { About } from './About'
import { Collection } from './Collection'
import { Newsletter, Social, Testimonials } from './Community'
import { Contact, Footer } from './Contact'
import { Hero } from './Hero'
import { Nav } from './Nav'
import { CartDrawer, Cookies, Floating } from './Overlays'
import { Product3d } from './Product3d'
import { StoreProvider } from './Store'

export type DynamicData = Record<string, { type: DynamicSectionType; data: unknown }>

/**
 * La página completa, en el orden de content/pageLayout.json. El sitio
 * público la usa sin `onChange`; /admin la usa con `onChange` dentro de
 * <EditProvider>, y cada texto/imagen/botón pasa a ser seleccionable.
 */
export function Site({
  content: c,
  dynamic,
  chatEnabled,
  onChange,
  renderWrapper,
}: {
  content: Content
  dynamic: DynamicData
  /** Resuelto en el servidor: la URL del webhook nunca baja al navegador. */
  chatEnabled: boolean
  onChange?: (id: string, data: unknown) => void
  /** Solo admin: envuelve cada sección (número de posición, aviso de oculta). */
  renderWrapper?: (id: string, index: number, node: React.ReactNode) => React.ReactNode
}) {
  const edit = useEditMode()
  const on = <K extends keyof Content>(id: K) => (onChange ? (d: Content[K]) => onChange(id, d) : undefined)

  const base: Record<string, () => React.ReactNode> = {
    hero: () => <Hero data={c.hero} onChange={on('hero')} />,
    collection: () => <Collection data={c.collection} onChange={on('collection')} />,
    about: () => <About data={c.about} onChange={on('about')} />,
    product3d: () => <Product3d data={c.product3d} onChange={on('product3d')} />,
    testimonials: () => <Testimonials data={c.testimonials} onChange={on('testimonials')} />,
    social: () => <Social data={c.social} onChange={on('social')} />,
    newsletter: () => <Newsletter data={c.newsletter} onChange={on('newsletter')} />,
    contact: () => <Contact data={c.contact} whatsappLink={c.siteSettings.whatsappLink} onChange={on('contact')} />,
  }

  const sections = c.pageLayout.sections.filter((s) => edit || s.visible)

  return (
    <StoreProvider>
      {!edit && <MotionRoot />}
      <div
        className={`@container min-h-screen bg-ink [background:radial-gradient(1200px_700px_at_80%_-10%,rgba(75,19,102,.35),transparent_60%),radial-gradient(900px_600px_at_-10%_30%,rgba(45,10,58,.4),transparent_60%),#050505] ${
          edit ? 'admin-mode' : ''
        }`}
      >
        <Nav brand={c.siteSettings.brand} marquee={c.marquee} onMarquee={on('marquee')} />
        <main>
          {sections.map((s, i) => {
            const node = s.type ? (
              dynamic[s.id] ? (
                <DynamicSection id={s.id} type={s.type} data={dynamic[s.id].data} edit={edit} onChange={onChange ? (d) => onChange(s.id, d) : undefined} />
              ) : null
            ) : (
              base[s.id]?.() ?? null
            )
            if (!node) return null
            return <React.Fragment key={s.id}>{renderWrapper ? renderWrapper(s.id, i, node) : node}</React.Fragment>
          })}
        </main>
        <Footer brand={c.siteSettings.brand} data={c.footer} social={c.social.links} onChange={on('footer')} />
        {!edit && (
          <>
            <Floating site={c.siteSettings} chatEnabled={chatEnabled} />
            <Cookies />
          </>
        )}
        <CartDrawer site={c.siteSettings} />
      </div>
    </StoreProvider>
  )
}
