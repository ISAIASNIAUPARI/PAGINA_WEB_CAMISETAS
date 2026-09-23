'use client'

import React, { useEffect, useRef, useState } from 'react'

import type { SiteData } from '@/lib/types'

import { money, useStore, type CartItem } from './Store'

/* ─────────────── Lista del carrito (se usa en el panel lateral y en /carrito) ─────────────── */

export function CartList({ items }: { items: CartItem[] }) {
  const { setQty, remove } = useStore()
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it) => (
        <li key={it.key} className="flex items-center gap-4 rounded-md border border-fog/10 bg-ink-2 p-3">
          <div className="h-[84px] w-16 shrink-0 overflow-hidden rounded bg-[#f3f3f1]">
            {it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-plum-deep font-mono text-[9px] tracking-widest text-lilac">3D</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-snow">{it.name}</div>
            <div className="truncate text-xs text-mute">{it.detail}</div>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" aria-label="Restar uno" onClick={() => setQty(it.key, it.qty - 1)} className="grid h-7 w-7 place-items-center rounded border border-fog/20 text-fog hover:border-violet">
                −
              </button>
              <span className="min-w-5 text-center font-mono text-[13px]">{it.qty}</span>
              <button type="button" aria-label="Sumar uno" onClick={() => setQty(it.key, it.qty + 1)} className="grid h-7 w-7 place-items-center rounded border border-fog/20 text-fog hover:border-violet">
                +
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="font-mono text-[13px] text-fog">{money(it.price * it.qty)}</span>
            <button type="button" onClick={() => remove(it.key)} className="text-[11px] text-mute underline hover:text-fog">
              Quitar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Resumen + pedido por WhatsApp (la tienda no cobra en línea: se coordina por chat). */
export function CartSummary({ site }: { site: SiteData }) {
  const { items, subtotal, clear, toast } = useStore()
  const shipping = items.length && subtotal < site.freeShippingFrom ? site.shippingCost : 0
  const total = subtotal + shipping
  const remaining = Math.max(0, site.freeShippingFrom - subtotal)

  const order = () => {
    const lines = items.map((i) => `• ${i.qty} × ${i.name} (${i.detail}) — ${money(i.price * i.qty)}`)
    const text = `Hola ${site.brand}, quiero hacer este pedido:\n${lines.join('\n')}\nEnvío: ${shipping ? money(shipping) : 'Gratis'}\nTotal: ${money(total)}`
    navigator.clipboard?.writeText(text).catch(() => {})
    toast('Pedido copiado · pégalo en WhatsApp')
    window.open(site.whatsappLink, '_blank', 'noopener')
  }

  return (
    <div className="flex flex-col gap-3 text-sm text-mute">
      <div>
        <div className="mb-2 flex justify-between text-xs">
          <span>{remaining ? `Te faltan ${money(remaining)} para envío gratis` : 'Tienes envío gratis'}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-fog/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-plum to-violet transition-[width] duration-700 ease-(--ease-out-soft)"
            style={{ width: `${Math.min(100, (subtotal / site.freeShippingFrom) * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span className="text-fog">{money(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Envío</span>
        <span className="text-fog">{shipping ? money(shipping) : 'Gratis'}</span>
      </div>
      <div className="flex justify-between border-t border-line pt-3 font-mono text-[15px] text-snow">
        <span>Total</span>
        <span>{money(total)}</span>
      </div>
      <button
        type="button"
        onClick={order}
        disabled={!items.length}
        className="group relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded bg-fog py-4 font-mono text-[11px] font-medium tracking-[.16em] text-ink uppercase disabled:opacity-40"
      >
        <span className="absolute inset-0 translate-y-full bg-[#1fae5d] transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-y-0" />
        <span className="relative transition-colors group-hover:text-white">Pedir por WhatsApp</span>
      </button>
      {items.length > 0 && (
        <button type="button" onClick={clear} className="text-xs text-mute underline hover:text-fog">
          Vaciar cesta
        </button>
      )}
    </div>
  )
}

export function CartDrawer({ site }: { site: SiteData }) {
  const { items, count, drawerOpen, setDrawerOpen } = useStore()

  useEffect(() => {
    if (!drawerOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen, setDrawerOpen])

  return (
    <div className={`fixed inset-0 z-[250] ${drawerOpen ? 'visible' : 'invisible delay-500'}`} aria-hidden={!drawerOpen}>
      <div
        className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-500 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        role="dialog"
        aria-label="Tu cesta"
        className={`absolute top-0 right-0 flex h-full w-[min(440px,100vw)] flex-col border-l border-line bg-ink transition-transform duration-500 ease-(--ease-out-soft) ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="font-mono text-[10px] tracking-[.22em] text-mute uppercase">Tu cesta</p>
            <p className="text-xl font-medium tracking-[-.02em] text-snow">{count ? `${count} ${count === 1 ? 'pieza' : 'piezas'}` : 'Vacía'}</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-lg text-fog transition-transform duration-300 hover:rotate-90 hover:border-violet"
            aria-label="Cerrar cesta"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length ? (
            <CartList items={items} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-mute">
              <p>Tu cesta está vacía.</p>
              <a href="#coleccion" onClick={() => setDrawerOpen(false)} className="text-lilac underline">
                Ver la colección
              </a>
            </div>
          )}
        </div>
        <div className="border-t border-line px-6 py-5">
          <CartSummary site={site} />
        </div>
      </aside>
    </div>
  )
}

/* ─────────────── WhatsApp + asistente ─────────────── */

type Msg = { from: 'me' | 'bot'; text: string }

export function Floating({ site }: { site: SiteData }) {
  const [bubble, setBubble] = useState('')
  const [dot, setDot] = useState(false)
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: '¡Hola! Soy el asistente de LAMS. ¿Te ayudo con tallas, envíos o colores?' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const session = useRef('')
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bubbles = site.whatsappBubbles
    if (!bubbles.length) return
    let i = 0
    let hide: ReturnType<typeof setTimeout>
    const waits = [10000, 16000, 24000]
    let t: ReturnType<typeof setTimeout>
    const next = () => {
      t = setTimeout(() => {
        setBubble(bubbles[i % bubbles.length])
        setDot(true)
        hide = setTimeout(() => setBubble(''), 6500)
        i++
        next()
      }, waits[i % waits.length])
    }
    next()
    return () => {
      clearTimeout(t)
      clearTimeout(hide)
    }
  }, [site.whatsappBubbles])

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight
  }, [msgs, loading])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setMsgs((m) => [...m, { from: 'me', text }])
    setInput('')
    setLoading(true)
    if (!session.current) session.current = 'web-' + Math.random().toString(36).slice(2)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: session.current }),
      })
      const data = (await res.json()) as { ok?: boolean; reply?: string }
      setMsgs((m) => [...m, { from: 'bot', text: data.ok && data.reply ? data.reply : 'No pude conectar con el asistente. Escríbenos por WhatsApp.' }])
    } catch {
      setMsgs((m) => [...m, { from: 'bot', text: 'No pude conectar con el asistente. Escríbenos por WhatsApp.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-[120] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <a
        href={site.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`block max-w-[240px] origin-bottom-right rounded-[16px_16px_4px_16px] border border-black/10 bg-white px-4 py-3 text-sm leading-[1.42] text-[#1A1614] no-underline shadow-[0_18px_50px_-12px_rgba(0,0,0,.35)] transition-all duration-500 ease-(--ease-out-soft) ${
          bubble && !open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'translate-y-2.5 scale-95 opacity-0'
        }`}
      >
        {bubble || ' '}
      </a>

      <div
        className={`pointer-events-auto flex max-h-[min(460px,70vh)] w-[min(320px,calc(100vw-40px))] origin-bottom-right flex-col overflow-hidden rounded-xl border border-line bg-ink-2 shadow-[0_18px_50px_-12px_rgba(0,0,0,.6)] transition-all duration-500 ease-(--ease-out-soft) ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none absolute bottom-0 scale-90 opacity-0'
        }`}
        role="dialog"
        aria-label="Asistente LAMS"
      >
        <div className="flex items-center justify-between border-b border-fog/10 px-4 py-3.5">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-snow">
            <span className="h-2 w-2 rounded-full bg-[#3fd07e]" /> Asistente LAMS
          </span>
          <button type="button" onClick={() => setOpen(false)} className="text-lg leading-none text-mute hover:text-fog" aria-label="Cerrar asistente">
            ×
          </button>
        </div>
        <div ref={list} className="flex min-h-[180px] flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3.5">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-[10px] px-3 py-2 text-[13px] ${m.from === 'me' ? 'self-end bg-[#1a1a1e] text-snow' : 'self-start bg-[#1a0f22] text-fog'}`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="flex gap-1 self-start rounded-[10px] bg-[#1a0f22] px-3 py-3">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-lilac" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </div>
          )}
        </div>
        <form onSubmit={send} className="flex border-t border-fog/10">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje…"
            aria-label="Mensaje"
            className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[13px] text-fog outline-none"
          />
          <button type="submit" className="px-4 font-mono text-[11px] tracking-[.06em] text-lilac uppercase hover:text-snow">
            Enviar
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={site.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full border border-[#3fd07e]/35 text-white no-underline shadow-[0_14px_36px_-8px_rgba(31,174,93,.6)] transition-transform duration-300 [background:radial-gradient(120%_120%_at_30%_25%,#45e081,#1fae5d_60%,#128a48)] hover:scale-110"
        >
          <span
            className={`absolute top-0.5 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-[#ff4d4d] px-1 font-mono text-[10px] transition-all duration-300 ${dot ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
          >
            1
          </span>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.3-.4c-1-1.6-1.5-3.4-1.5-5.3C4.9 9.5 9.9 4.9 16 4.9c5.6 0 10.2 4.6 10.2 10.2S21.6 24.8 16 24.8z" />
            <path d="M21.6 18c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.3 4.7 2 .8 2.7.9 3.7.8.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir asistente"
          aria-expanded={open}
          className="pointer-events-auto grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-snow p-2 shadow-[0_14px_36px_-8px_rgba(0,0,0,.6),0_0_16px_rgba(140,120,255,.3)] transition-transform duration-300 hover:scale-110"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/asistente.webp" alt="" className="h-full w-full animate-pulse-soft object-contain" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────── Aviso de cookies ─────────────── */

export function Cookies() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem('forma-cookie-consent')
    } catch {}
    if (!saved) {
      const t = setTimeout(() => setShow(true), 1400)
      return () => clearTimeout(t)
    }
  }, [])
  const choose = (v: string) => {
    try {
      window.localStorage.setItem('forma-cookie-consent', v)
    } catch {}
    setShow(false)
  }
  return (
    <div
      className={`fixed bottom-5 left-5 z-[110] w-[min(420px,calc(100vw-110px))] rounded-[10px] border border-line bg-[#0f0f12]/95 p-5 shadow-[0_18px_44px_rgba(0,0,0,.55)] backdrop-blur transition-all duration-700 ease-(--ease-out-soft) max-sm:w-[calc(100vw-100px)] ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
    >
      <h4 className="text-[13px] font-semibold tracking-[.05em] text-snow uppercase">Ayúdanos a mejorar tu experiencia</h4>
      <p className="mt-2 text-xs leading-[1.55] text-mute">
        Usamos cookies para el funcionamiento del sitio, analizar el tráfico y medir campañas. Consulta la{' '}
        <a href="/privacidad" className="text-lilac underline">
          política de privacidad
        </a>
        .
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => choose('necessary')} className="py-2 font-mono text-[11px] font-medium tracking-[.08em] text-mute uppercase underline hover:text-fog">
          Solo necesarias
        </button>
        <button
          type="button"
          onClick={() => choose('all')}
          className="ml-auto rounded bg-fog px-4 py-2.5 font-mono text-[11px] font-medium tracking-[.08em] text-ink uppercase transition-colors hover:bg-lilac"
        >
          Aceptar todas
        </button>
      </div>
    </div>
  )
}
