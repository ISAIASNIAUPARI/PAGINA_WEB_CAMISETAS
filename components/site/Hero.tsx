'use client'

import React, { useEffect, useState } from 'react'

import { AdminField, Txt, useEdit } from '@/components/editable/Editable'
import { Magnetic, useTilt } from '@/components/motion'
import type { HeroData, Product } from '@/lib/types'

import { money, useStore } from './Store'

const ROTATE_MS = 4200

export function Hero({ data, products, onChange }: { data: HeroData; products: Product[]; onChange?: (d: HeroData) => void }) {
  const set = onChange ? (patch: Partial<HeroData>) => onChange({ ...data, ...patch }) : undefined
  const { edit } = useEdit()
  const { add } = useStore()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const tilt = useTilt<HTMLDivElement>(7)
  const showcase = products.slice(0, 6)
  const current = showcase[active] ?? showcase[0]

  useEffect(() => {
    if (paused || edit || showcase.length < 2) return
    const t = setTimeout(() => setActive((a) => (a + 1) % showcase.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [active, paused, edit, showcase.length])

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-wrap items-stretch overflow-x-clip pt-[98px]">
      {/* Palabra gigante de fondo con parallax */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[-4vw] z-0 overflow-hidden select-none">
        <div
          data-parallax="-0.12"
          className="text-center font-sans text-[34vw] leading-[.8] font-bold tracking-[-.07em] text-transparent [-webkit-text-stroke:1px_rgba(167,107,224,.13)]"
        >
          LAMS
        </div>
      </div>

      <div className="relative z-10 flex flex-[1_1_480px] flex-col justify-center px-[clamp(20px,5vw,80px)] py-[clamp(40px,7vw,80px)]">
        <p data-reveal style={{ ['--d' as string]: 80 }} className="mb-7 flex items-center gap-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
          <span className="relative block h-px w-8 overflow-hidden bg-mute/40">
            <span className="absolute inset-0 animate-[marquee_2.4s_ease-in-out_infinite] bg-violet" />
          </span>
          <Txt value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
        </p>
        <h1 className="mb-7 font-sans text-[clamp(54px,9.2vw,156px)] leading-[.86] font-medium tracking-[-.05em] text-snow">
          <Txt as="span" className="block" value={data.line1} onChange={set && ((v) => set({ line1: v }))} split delay={150} />
          <Txt
            as="span"
            className="block text-transparent [-webkit-text-stroke:1px_#8F9399]"
            value={data.line2}
            onChange={set && ((v) => set({ line2: v }))}
            split
            delay={330}
          />
          <Txt
            as="span"
            className="block bg-[linear-gradient(180deg,#efe9f7_0%,#b89cd6_45%,#6e3aa0_100%)] bg-clip-text pb-2 font-serif font-normal tracking-normal text-transparent italic"
            value={data.line3}
            onChange={set && ((v) => set({ line3: v }))}
            split
            delay={480}
          />
        </h1>
        <Txt
          as="p"
          multiline
          className="mb-12 max-w-[420px] text-[17px] leading-[1.72] text-mute"
          value={data.body}
          onChange={set && ((v) => set({ body: v }))}
        />
        <div data-reveal style={{ ['--d' as string]: 650 }} className="flex flex-wrap items-center gap-6">
          <Magnetic>
            <a
              href={data.ctaPrimary.href}
              onClick={(e) => edit && e.preventDefault()}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-[3px] bg-fog px-8 py-4 font-mono text-[11.5px] font-medium tracking-[.22em] text-ink uppercase no-underline"
            >
              <span className="absolute inset-0 translate-y-full bg-plum transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-y-0" />
              <span className="relative transition-colors duration-300 group-hover:text-fog">
                <Txt value={data.ctaPrimary.text} onChange={set && ((v) => set({ ctaPrimary: { ...data.ctaPrimary, text: v } }))} />
              </span>
              <svg className="relative transition-all duration-500 group-hover:translate-x-1 group-hover:text-fog" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </Magnetic>
          <a
            href={data.ctaSecondary.href}
            onClick={(e) => edit && e.preventDefault()}
            className="group relative text-xs font-medium tracking-[.08em] text-mute uppercase no-underline transition-colors hover:text-fog"
          >
            <Txt value={data.ctaSecondary.text} onChange={set && ((v) => set({ ctaSecondary: { ...data.ctaSecondary, text: v } }))} />
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-fog transition-transform duration-500 group-hover:scale-x-100" />
          </a>
        </div>
        {set && (
          <div className="mt-4 flex max-w-md flex-col gap-1">
            <AdminField label="Enlace botón 1" value={data.ctaPrimary.href} onChange={(v) => set({ ctaPrimary: { ...data.ctaPrimary, href: v } })} />
            <AdminField label="Enlace botón 2" value={data.ctaSecondary.href} onChange={(v) => set({ ctaSecondary: { ...data.ctaSecondary, href: v } })} />
          </div>
        )}
        <div data-reveal style={{ ['--d' as string]: 800 }} className="mt-16 hidden items-center gap-4 text-[11px] tracking-[.12em] text-mute uppercase sm:flex">
          <span className="relative block h-9 w-[22px] rounded-full border border-mute/50">
            <span className="absolute top-1.5 left-1/2 h-1.5 w-px -translate-x-1/2 animate-[float_1.8s_ease-in-out_infinite] bg-fog" />
          </span>
          <Txt value={data.scrollHint} onChange={set && ((v) => set({ scrollHint: v }))} />
        </div>
      </div>

      {/* Vitrina: la colección rota sola, se puede elegir con los puntos */}
      {current && (
        <div
          data-reveal="scale"
          style={{ ['--d' as string]: 250 }}
          className="relative z-10 flex flex-[1_1_420px] items-center justify-center px-[clamp(20px,4vw,40px)] pb-14 lg:pb-0"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <div className="relative w-full max-w-[min(520px,58svh)]">
            <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(167,107,224,.28),transparent)] blur-2xl" />
            <div ref={tilt} className="relative aspect-[4/5] transition-transform duration-300 ease-out [transform-style:preserve-3d]">
              {showcase.map((p, i) => {
                const offset = (i - active + showcase.length) % showcase.length
                const visible = offset < 3
                return (
                  <div
                    key={p.id}
                    className="absolute inset-0 overflow-hidden rounded-md border border-fog/10 bg-[#f3f3f1] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] transition-all duration-[900ms] ease-(--ease-out-soft)"
                    style={{
                      zIndex: 10 - offset,
                      opacity: visible ? 1 - offset * 0.25 : 0,
                      transform: `translate3d(${offset * 26}px, ${-offset * 22}px, ${-offset * 60}px) rotate(${offset * 3}deg) scale(${1 - offset * 0.06})`,
                      filter: offset ? 'brightness(.55) saturate(.7)' : 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={`${p.name} — ${p.colorName}`}
                      className={`h-full w-full object-cover transition-transform duration-[4200ms] ease-linear ${offset === 0 && !paused ? 'scale-[1.08]' : 'scale-100'}`}
                      loading="eager"
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                    />
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(400px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,.22),transparent_45%)] hover:opacity-100"
                    />
                  </div>
                )
              })}
            </div>

            {/* Etiqueta del producto activo */}
            <div className="absolute right-4 -bottom-6 z-20 flex items-center gap-4 rounded-[4px] border border-fog/15 bg-ink-3/85 py-3 pr-3 pl-5 backdrop-blur-md sm:right-8">
              <div key={current.id} className="min-w-[120px]">
                <span className="block text-base font-medium tracking-[-.01em] text-snow">{current.name}</span>
                <span className="text-xs tracking-[.04em] text-mute">
                  {current.colorName} · {money(current.price)}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  add({ key: current.id, name: current.name, detail: current.colorName, price: current.price, image: current.image })
                }
                className="grid h-10 w-10 place-items-center rounded-full bg-fog text-lg text-ink transition-all duration-300 hover:rotate-90 hover:bg-violet"
                aria-label={`Añadir ${current.name} al carrito`}
              >
                +
              </button>
            </div>

            <div className="absolute top-1/2 -left-2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex lg:-left-8">
              {showcase.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver ${p.name}`}
                  className="relative h-10 w-[3px] overflow-hidden rounded-full bg-fog/15"
                >
                  {i === active && (
                    <span
                      key={active}
                      className="absolute inset-0 origin-top bg-violet"
                      style={{
                        animation: edit ? 'none' : `grow ${ROTATE_MS}ms linear forwards`,
                        animationPlayState: paused ? 'paused' : 'running',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
