'use client'

import React, { useState } from 'react'

import { AdminField, Txt, useEdit } from '@/components/editable/Editable'
import type { ContactData, FooterData } from '@/lib/types'

import { useStore } from './Store'

const ICONS: Record<string, React.ReactNode> = {
  pin: <path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 1118 0z M12 13a3 3 0 100-6 3 3 0 000 6z" />,
  wa: <path d="M3 21l1.65-4.1A9 9 0 1121 12a9 9 0 01-12.9 8.1L3 21z" />,
  mail: <path d="M3 6l9 7 9-7M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />,
  clock: <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 3" />,
}

export function Contact({ data, whatsappLink, onChange }: { data: ContactData; whatsappLink: string; onChange?: (d: ContactData) => void }) {
  const set = onChange ? (patch: Partial<ContactData>) => onChange({ ...data, ...patch }) : undefined
  const { toast } = useStore()
  const { edit } = useEdit()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const rows: { icon: string; label: string; key: keyof ContactData }[] = [
    { icon: 'pin', label: 'Ubicación', key: 'address' },
    { icon: 'wa', label: 'WhatsApp', key: 'whatsapp' },
    { icon: 'mail', label: 'Correo', key: 'email' },
    { icon: 'clock', label: 'Horarios', key: 'hours' },
  ]

  const field = (k: keyof typeof form, label: string, type: string, placeholder: string, required = false) => (
    <label className="group relative flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-[.08em] text-mute uppercase transition-colors group-focus-within:text-lilac">{label}</span>
      {k === 'message' ? (
        <textarea
          rows={4}
          value={form[k]}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          placeholder={placeholder}
          className="resize-y rounded-[3px] border border-line bg-[#0B0B0B] px-3.5 py-3 text-sm text-fog outline-none transition-colors placeholder:text-mute/60 focus:border-violet"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={form[k]}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          placeholder={placeholder}
          className="rounded-[3px] border border-line bg-[#0B0B0B] px-3.5 py-3 text-sm text-fog outline-none transition-colors placeholder:text-mute/60 focus:border-violet"
        />
      )}
    </label>
  )

  return (
    <section
      id="contacto"
      className="scroll-mt-24 px-[clamp(20px,5vw,80px)] py-[clamp(64px,10vw,110px)] [background:radial-gradient(900px_600px_at_90%_0%,rgba(45,10,58,.28),transparent_60%),radial-gradient(800px_500px_at_0%_70%,rgba(75,19,102,.2),transparent_60%),#050505]"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <p data-reveal className="mb-4 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
            <Txt value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          </p>
          <h2 className="mb-5 text-[clamp(36px,5vw,64px)] leading-[.94] font-medium tracking-[-.04em] text-snow">
            <Txt value={data.title} onChange={set && ((v) => set({ title: v }))} split />
          </h2>
          <Txt as="p" multiline className="mx-auto max-w-[520px] text-base leading-[1.7] text-mute" value={data.body} onChange={set && ((v) => set({ body: v }))} />
        </div>

        <div data-reveal className="grid overflow-hidden rounded-md border border-line bg-ink-3 md:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (edit) return
              const text = `Hola LAMS STUDIO, soy ${form.name} (${form.email}${form.phone ? ', ' + form.phone : ''}). ${form.message}`
              navigator.clipboard?.writeText(text).catch(() => {})
              toast('Mensaje copiado · pégalo en WhatsApp')
              window.open(whatsappLink, '_blank', 'noopener')
            }}
            className="flex flex-col gap-5 border-b border-line p-[clamp(24px,4vw,48px)] md:border-r md:border-b-0"
          >
            {field('name', 'Nombre completo', 'text', 'Juan Pérez', true)}
            {field('email', 'Correo electrónico', 'email', 'juan@email.com', true)}
            {field('phone', 'Teléfono', 'tel', '+593 000 000 000')}
            {field('message', 'Mensaje', 'text', 'Escríbenos tu consulta… ¿qué necesitas?')}
            <button
              type="submit"
              className="group relative mt-1 flex items-center justify-center gap-2.5 overflow-hidden rounded-[3px] bg-fog py-4 font-mono text-[11.5px] font-medium tracking-[.22em] text-ink uppercase"
            >
              <span className="absolute inset-0 translate-y-full bg-plum transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-y-0" />
              <span className="relative transition-colors group-hover:text-fog">Enviar por WhatsApp</span>
              <span className="relative transition-all group-hover:translate-x-1 group-hover:text-fog">→</span>
            </button>
            <span className="text-xs text-mute">Tu mensaje se copia y se abre WhatsApp para enviarlo.</span>
          </form>

          <div className="bg-[#0B0B0B] p-[clamp(24px,4vw,48px)]">
            <h3 className="mb-7 text-2xl font-semibold text-[#EDEBF0]">Información de contacto</h3>
            <div className="flex flex-col gap-6">
              {rows.map((r) => (
                <div key={r.key} className="group flex items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-violet transition-all duration-300 group-hover:border-violet group-hover:bg-plum group-hover:text-snow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[r.icon]}
                    </svg>
                  </span>
                  <div>
                    <div className="mb-1 text-sm font-medium text-fog">{r.label}</div>
                    <Txt as="div" className="text-sm leading-[1.6] text-mute" value={data[r.key]} onChange={set && ((v) => set({ [r.key]: v } as Partial<ContactData>))} />
                  </div>
                </div>
              ))}
            </div>
            {set && (
              <div className="mt-4">
                <AdminField label="Dirección del mapa" value={data.mapQuery} onChange={(v) => set({ mapQuery: v })} />
              </div>
            )}
            <div className="mt-7 aspect-video overflow-hidden rounded border border-line">
              <iframe
                title="Mapa de ubicación"
                src={`https://www.google.com/maps?q=${encodeURIComponent(data.mapQuery)}&output=embed`}
                className="h-full w-full border-0 grayscale-[.85] invert-[.9] hue-rotate-180 transition-[filter] duration-700 hover:filter-none"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer({ brand, data, social, onChange }: { brand: string; data: FooterData; social: { label: string; href: string }[]; onChange?: (d: FooterData) => void }) {
  const set = onChange ? (patch: Partial<FooterData>) => onChange({ ...data, ...patch }) : undefined
  const cols = [
    { t: 'Tienda', l: [['Colección', '#coleccion'], ['Novedades', '#coleccion'], ['Ediciones limitadas', '#coleccion']] },
    { t: 'Nosotros', l: [['Manifiesto', '#nosotros'], ['Materiales', '#nosotros'], ['Redes sociales', '#social']] },
    { t: 'Clientes', l: [['Contacto', '#contacto'], ['Carrito', '/carrito'], ['Privacidad', '/privacidad']] },
  ]
  return (
    <footer className="relative overflow-hidden bg-ink px-[clamp(20px,5vw,80px)] pt-[72px]">
      <div className="grid gap-10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-4 text-xl font-medium tracking-[.3em] text-snow">{brand}</div>
          <Txt as="p" multiline className="max-w-[300px] text-sm leading-[1.7] text-fog/40" value={data.tagline} onChange={set && ((v) => set({ tagline: v }))} />
          <div className="mt-6 flex gap-3">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-fog/15 px-3 py-1.5 text-[11px] tracking-[.08em] text-fog/60 no-underline transition-colors hover:border-violet hover:text-violet"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <div className="mb-5 text-[11px] font-medium tracking-[.14em] text-fog/35 uppercase">{c.t}</div>
            <ul className="flex flex-col gap-3.5">
              {c.l.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="group inline-flex items-center gap-2 text-sm text-fog/70 no-underline transition-colors hover:text-fog">
                    <span className="h-px w-0 bg-violet transition-all duration-300 group-hover:w-3" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none text-center text-[21vw] leading-[.75] font-bold tracking-[-.07em] text-transparent select-none [-webkit-text-stroke:1px_rgba(217,217,217,.07)]">
        LAMS
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-fog/[.08] py-6">
        <span className="text-[11px] tracking-[.05em] text-fog/30">© 2026 {brand} · Todos los derechos reservados</span>
        <span className="text-[11px] tracking-[.05em] text-fog/30">
          Envíos: <Txt value={data.shippingRegion} onChange={set && ((v) => set({ shippingRegion: v }))} />
        </span>
      </div>
    </footer>
  )
}
