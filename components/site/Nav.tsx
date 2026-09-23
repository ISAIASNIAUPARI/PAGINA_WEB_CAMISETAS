'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Txt, useEdit } from '@/components/editable/Editable'
import type { MarqueeData } from '@/lib/types'

import { useStore } from './Store'

const LINKS = [
  { href: '#coleccion', label: 'Colección' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#social', label: 'Contenido' },
  { href: '#contacto', label: 'Contacto' },
]

export function Nav({ brand, marquee, onMarquee }: { brand: string; marquee: MarqueeData; onMarquee?: (d: MarqueeData) => void }) {
  const { count, setDrawerOpen, bumpKey } = useStore()
  const { edit } = useEdit()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (!edit) setHidden(y > 320 && y > last + 4 ? true : y < last - 4 ? false : (h) => h)
      last = y
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [edit])

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  const items = [...marquee.items, ...marquee.items]

  return (
    <>
      <header
        className={`fixed inset-x-0 z-[100] transition-transform duration-500 ease-(--ease-out-soft) ${edit ? 'top-12' : 'top-0'} ${
          hidden && !menu ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <nav
          className={`relative flex h-16 items-center justify-between gap-3 px-[clamp(16px,4vw,56px)] backdrop-blur-xl transition-colors duration-300 ${
            scrolled ? 'bg-ink/85 border-b border-line' : 'bg-ink/40 border-b border-transparent'
          }`}
        >
          <a href="#top" className="font-sans text-sm font-medium tracking-[.42em] text-snow no-underline">
            {brand}
          </a>
          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative text-[11px] font-medium tracking-[.14em] text-mute uppercase no-underline transition-colors hover:text-fog"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-violet transition-transform duration-500 ease-(--ease-out-soft) group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2.5 rounded-full border border-fog/20 bg-[#0f0f12] px-4 py-2.5 font-mono text-[11px] font-medium tracking-[.14em] text-fog uppercase shadow-[0_6px_16px_rgba(0,0,0,.5)] transition-colors hover:border-violet/60"
              aria-label={`Abrir carrito, ${count} artículos`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h2l2.4 12.2a2 2 0 002 1.8h8.6a2 2 0 002-1.7L21 8H6" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="17" cy="20" r="1" />
              </svg>
              <span className="hidden sm:inline">Carrito</span>
              <span
                key={bumpKey}
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${count ? 'bg-violet text-ink' : 'bg-fog/10 text-mute'} ${bumpKey ? 'animate-bump' : ''}`}
              >
                {count}
              </span>
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-fog/20 md:hidden"
              aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 h-px w-4 bg-fog transition-all duration-300 ${menu ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-px w-4 bg-fog transition-all duration-300 ${menu ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
          <div ref={bar} className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-plum via-violet to-lilac" />
        </nav>

        <div className="flex h-[34px] items-center overflow-hidden border-b border-fog/[.08] bg-ink/65 backdrop-blur-md">
          <div className="flex animate-marquee gap-14 font-mono text-[11px] tracking-[.22em] whitespace-nowrap text-mute uppercase hover:[animation-play-state:paused]">
            {items.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <i className="text-violet not-italic">◆</i>
                {i < marquee.items.length && onMarquee ? (
                  <Txt
                    value={t}
                    onChange={(v) => onMarquee({ items: marquee.items.map((x, j) => (j === i ? v : x)) })}
                  />
                ) : (
                  t
                )}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      <div
        className={`fixed inset-0 z-[99] flex flex-col justify-end bg-ink/95 px-6 pb-16 backdrop-blur-xl transition-[opacity,visibility] duration-500 md:hidden ${
          menu ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-2">
          {LINKS.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <a
                href={l.href}
                onClick={() => setMenu(false)}
                className={`block text-[clamp(40px,12vw,64px)] leading-none font-medium tracking-[-.04em] text-snow no-underline transition-transform duration-700 ease-(--ease-out-soft) ${
                  menu ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{ transitionDelay: menu ? `${80 + i * 70}ms` : '0ms' }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10 font-mono text-[11px] tracking-[.22em] text-mute uppercase">{brand} · Otoño 2026</p>
      </div>
    </>
  )
}
