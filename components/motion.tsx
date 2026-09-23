'use client'

import React, { useEffect, useRef } from 'react'

/**
 * Motor de movimiento del sitio, sin librerías:
 *  · [data-reveal] y .split  → entran al hacer scroll (IntersectionObserver)
 *  · [data-parallax="0.1"]   → se desplazan a otra velocidad que el scroll
 *  · --scroll-v en <html>    → velocidad del scroll, la leen el marquee y otros
 * Se monta una sola vez en la raíz del sitio.
 */
export function MotionRoot({ watch }: { watch?: unknown }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in), .split:not(.in)').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    let raf = 0
    let lastY = window.scrollY
    let v = 0
    const tick = () => {
      const y = window.scrollY
      v += (y - lastY - v) * 0.12
      lastY = y
      const root = document.documentElement
      root.style.setProperty('--scroll-v', v.toFixed(2))
      if (!reduce) {
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const speed = parseFloat(el.dataset.parallax || '0')
          const r = el.parentElement?.getBoundingClientRect()
          if (!r || r.bottom < -200 || r.top > window.innerHeight + 200) return
          const center = r.top + r.height / 2 - window.innerHeight / 2
          el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [watch])
  return null
}

/** Titular que entra palabra por palabra desde una máscara. */
export function SplitText({ text, delay = 0, step = 60, className }: { text: string; delay?: number; step?: number; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span className={`split ${className ?? ''}`} aria-label={text}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="split-word" aria-hidden>
            <span style={{ ['--d' as string]: delay + i * step }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  )
}

/** Inclinación 3D que sigue al puntero (solo con mouse; en táctil no hace nada). */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`
        el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
        el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
      })
    }
    const leave = () => {
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])
  return ref
}

/** Botón "magnético": se desplaza unos px hacia el cursor. */
export function Magnetic({ children, strength = 0.3, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    }
    const leave = () => (el.style.transform = '')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return (
    <span ref={ref} className={`inline-block transition-transform duration-300 ease-(--ease-out-soft) ${className ?? ''}`}>
      {children}
    </span>
  )
}
