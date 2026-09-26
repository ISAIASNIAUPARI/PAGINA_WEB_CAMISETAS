'use client'

/**
 * "Tormenta de identidad" — sección visual independiente.
 * Calma → movimiento → tormenta → orden → identidad, controlado por el scroll.
 *
 * Aislada a propósito: no lee ni escribe content/, no usa el Store, ni el
 * carrito, ni el panel. Solo se monta en el sitio público (ver Site.tsx).
 * Para quitarla: borrar esta carpeta, public/storm y la línea en Site.tsx.
 */
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './IdentityStorm.module.css'

gsap.registerPlugin(ScrollTrigger)

type Vec = [number, number] // posición en unidades del escenario: x,y ∈ [-50, 50] respecto al centro
type Item = {
  src: string
  w: number // ancho en unidades "u" (1u ≈ 1% del lado corto)
  calm?: Vec // si existe, el objeto ya está en escena al principio
  enter: number // momento en que entra (0–1 del recorrido)
  from: Vec // desde dónde entra (fuera de pantalla)
  loose: Vec // posición durante el "movimiento"
  orbit: { r: number; h: number; w: number; ph: number } // radio, altura, vueltas, fase
  final?: Vec // posición en la composición final (si no, se retira)
  fs?: number // escala final
  fr?: number // rotación final
  rot: number
  mobile?: boolean // se usa también en móvil
  shadow?: boolean
}

const I = (n: string) => `/storm/${n}.webp`

// Director de arte: pocos objetos en calma, más en movimiento, todos en la tormenta, solo seis en el orden final.
const ITEMS: Item[] = [
  { src: I('cotton'), w: 30, calm: [-18, 10], enter: 0, from: [-80, 20], loose: [-26, 16], orbit: { r: 34, h: 18, w: 0.9, ph: 0.2 }, final: [-30, 22], fs: 0.9, fr: -8, rot: -6, mobile: true, shadow: true },
  { src: I('card'), w: 24, calm: [22, -14], enter: 0, from: [80, -20], loose: [28, -20], orbit: { r: 30, h: -14, w: 1.1, ph: 2.4 }, final: [31, 24], fs: 0.8, fr: 7, rot: 8, mobile: true, shadow: true },
  { src: I('label-main'), w: 17, calm: [10, 20], enter: 0, from: [40, 80], loose: [14, 26], orbit: { r: 26, h: 6, w: 1.3, ph: 4.1 }, final: [30, -22], fs: 0.9, fr: 6, rot: 4, mobile: true, shadow: true },
  { src: I('hangtag'), w: 15, enter: 0.2, from: [-70, -60], loose: [-36, -18], orbit: { r: 38, h: -22, w: 1.0, ph: 1.1 }, final: [-31, -18], fs: 1, fr: -10, rot: -14, mobile: true, shadow: true },
  { src: I('label-care'), w: 11, enter: 0.23, from: [70, 60], loose: [36, 12], orbit: { r: 24, h: 20, w: 1.4, ph: 3.2 }, rot: 10, shadow: true },
  { src: I('label-loop'), w: 4, enter: 0.26, from: [-20, -80], loose: [-8, -30], orbit: { r: 20, h: -26, w: 1.7, ph: 5.2 }, rot: 22, shadow: true },
  { src: I('label-long'), w: 22, enter: 0.24, from: [90, -40], loose: [22, 34], orbit: { r: 40, h: 26, w: 0.8, ph: 0.9 }, final: [0, 36], fs: 0.8, fr: 0, rot: -5, mobile: true, shadow: true },
  { src: I('label-ls'), w: 7, enter: 0.3, from: [-90, 40], loose: [-40, 30], orbit: { r: 18, h: -6, w: 1.9, ph: 2.9 }, rot: -12, mobile: true, shadow: true },
  { src: I('label-essentials'), w: 7, enter: 0.33, from: [30, -90], loose: [40, -34], orbit: { r: 28, h: -30, w: 1.2, ph: 5.9 }, rot: 9, shadow: true },
  { src: I('packaging'), w: 28, enter: 0.28, from: [-100, 70], loose: [-44, 36], orbit: { r: 44, h: 30, w: 0.7, ph: 3.7 }, rot: -9, shadow: true },
  { src: I('ribbon'), w: 30, enter: 0.31, from: [100, 20], loose: [40, 0], orbit: { r: 36, h: 0, w: 1.0, ph: 1.7 }, rot: 6, mobile: true },
  { src: I('spool'), w: 11, enter: 0.36, from: [-60, 90], loose: [-20, 38], orbit: { r: 22, h: 30, w: 1.5, ph: 0.4 }, rot: -18, shadow: true },
  { src: I('needle'), w: 16, enter: 0.38, from: [80, 80], loose: [30, 30], orbit: { r: 30, h: 12, w: 1.6, ph: 4.6 }, rot: 20 },
  { src: I('button'), w: 5, enter: 0.37, from: [-50, -90], loose: [-14, -36], orbit: { r: 16, h: -18, w: 2.1, ph: 2.2 }, rot: 0, mobile: true },
  { src: I('button-navy'), w: 4.5, enter: 0.4, from: [60, -90], loose: [18, -38], orbit: { r: 14, h: 16, w: 2.3, ph: 5.5 }, rot: 0 },
  { src: I('swatch-stitch'), w: 9, enter: 0.35, from: [100, -70], loose: [44, -26], orbit: { r: 26, h: -24, w: 1.3, ph: 0.1 }, rot: 12, shadow: true },
  { src: I('stitch-wave'), w: 20, enter: 0.42, from: [-100, 0], loose: [-40, 4], orbit: { r: 34, h: 8, w: 1.1, ph: 3.0 }, rot: -4 },
  { src: I('g-star'), w: 5, enter: 0.22, from: [-40, -70], loose: [-22, -32], orbit: { r: 22, h: -28, w: 1.8, ph: 1.4 }, final: [18, -34], fs: 0.8, fr: 0, rot: 0, mobile: true },
  { src: I('g-globe'), w: 15, enter: 0.3, from: [70, -70], loose: [34, -30], orbit: { r: 42, h: -20, w: 0.8, ph: 4.4 }, rot: -8 },
  { src: I('g-orbit'), w: 16, enter: 0.34, from: [-90, -20], loose: [-38, -4], orbit: { r: 30, h: -8, w: 1.2, ph: 2.6 }, rot: 10 },
  { src: I('g-waves'), w: 9, enter: 0.39, from: [90, 90], loose: [42, 30], orbit: { r: 36, h: 22, w: 1.0, ph: 5.0 }, rot: 0 },
  { src: I('g-ls'), w: 6, enter: 0.41, from: [0, 90], loose: [6, 40], orbit: { r: 12, h: 4, w: 2.4, ph: 0.7 }, rot: 0, mobile: true },
  { src: I('g-barcode'), w: 13, enter: 0.43, from: [-80, 90], loose: [-30, 40], orbit: { r: 38, h: 34, w: 0.9, ph: 1.9 }, rot: -3 },
  { src: I('g-star-skew'), w: 7, enter: 0.44, from: [90, -40], loose: [36, -12], orbit: { r: 26, h: -12, w: 1.7, ph: 3.5 }, rot: 0 },
  { src: I('g-fold'), w: 16, enter: 0.45, from: [-100, -60], loose: [-42, -30], orbit: { r: 46, h: -32, w: 0.75, ph: 5.7 }, rot: 4, shadow: true },
  { src: I('g-texture'), w: 11, enter: 0.46, from: [100, 60], loose: [46, 22], orbit: { r: 44, h: 28, w: 0.85, ph: 2.1 }, rot: -6, shadow: true },
]

const PHASES = [
  { k: 'Calma', t: ['Todo empieza', 'en calma.'], p: 'Algodón peinado, una tarjeta, una etiqueta.' },
  { k: 'Movimiento', t: ['Luego, cada', 'detalle se mueve.'], p: 'Etiquetas, hilos, papel y cinta entran en escena.' },
  { k: 'Tormenta', t: ['Una tormenta', 'de identidad.'], p: 'Cada pieza gira a su ritmo alrededor de la misma idea.' },
]

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const mix = (a: number, b: number, t: number) => a + (b - a) * t

export default function IdentityStorm() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const stage = el.querySelector(`.${s.stage}`) as HTMLElement
    const layer = el.querySelector(`.${s.layer}`) as HTMLElement
    const nodes = Array.from(el.querySelectorAll<HTMLImageElement>(`.${s.item}`))
    const copies = Array.from(el.querySelectorAll<HTMLElement>(`.${s.copy}`))
    const finale = el.querySelector(`.${s.finale}`) as HTMLElement
    const shirt = el.querySelector(`.${s.shirt}`) as HTMLElement
    const bar = el.querySelector(`.${s.bar} i`) as HTMLElement

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add({ all: '(min-width: 0px)', small: '(max-width: 767px)', mid: '(min-width: 768px) and (max-width: 1100px)', reduce: '(prefers-reduced-motion: reduce)' }, (c) => {
        const { small, mid, reduce } = c.conditions as { small: boolean; mid: boolean; reduce: boolean }
        const active = ITEMS.map((it, i) => ({ it, node: nodes[i], on: !small || !!it.mobile }))
        active.forEach(({ node, on }) => { node.style.display = on ? '' : 'none' })

        let W = 0, H = 0, U = 0, cx = 0, cy = 0
        const measure = () => {
          W = stage.clientWidth; H = stage.clientHeight
          U = Math.min(W, H * (small ? 0.9 : 1.55)) / 100 // unidad de tamaño
          cx = W * (small ? 0.5 : mid ? 0.6 : 0.62); cy = H * (small ? 0.36 : 0.5)
          stage.style.setProperty('--u', `${U}px`)
          stage.style.setProperty('--cx', `${cx}px`)
          stage.style.setProperty('--cy', `${cy}px`)
        }
        measure()
        gsap.set(nodes, { xPercent: -50, yPercent: -50, left: 0, top: 0 })
        // espacio en pantalla: x en % del ancho útil, y en % del alto
        const sx = (v: number) => cx + (v / 100) * W * (small ? 0.9 : mid ? 0.7 : 0.62)
        const sy = (v: number) => cy + (v / 100) * H * (small ? 0.5 : 0.86)
        const spin = small ? 1.4 : 2.2 // vueltas de la tormenta
        const move = small ? 0.6 : 1 // distancia de entrada

        const render = (P: number) => {
          const storm = smooth(0.4, 0.55, P) * (1 - smooth(0.72, 0.86, P))
          const order = smooth(0.72, 0.9, P)
          for (let i = 0; i < active.length; i++) {
            const { it, node, on } = active[i]
            if (!on) continue
            const enter = it.calm ? 1 : smooth(it.enter, it.enter + 0.1, P)
            // 1) de fuera de pantalla a una posición suelta (o la de calma)
            const start = it.calm ?? [it.from[0] * move, it.from[1] * move]
            const loose = it.calm ? [mix(it.calm[0], it.loose[0], smooth(0.18, 0.4, P)), mix(it.calm[1], it.loose[1], smooth(0.18, 0.4, P))] : it.loose
            let x = sx(mix(start[0], loose[0], enter)), y = sy(mix(start[1], loose[1], enter))
            // 2) tormenta: órbita elíptica tipo embudo (más ancha arriba), velocidad y fase propias
            const a = it.orbit.ph + P * Math.PI * 2 * spin * it.orbit.w
            const funnel = 1 + (-it.orbit.h / 100) * 0.9
            const ox = cx + Math.cos(a) * it.orbit.r * funnel * U * (small ? 0.7 : 0.62)
            const oy = cy + (it.orbit.h / 100) * H * (small ? 0.55 : 0.8) + Math.sin(a) * it.orbit.r * U * 0.22
            const depth = Math.sin(a) // -1 detrás, +1 delante
            x = mix(x, ox, storm); y = mix(y, oy, storm)
            // 3) orden: a su sitio en la composición final, o fuera
            let alpha = enter
            let sc = mix(1, 0.8 + (depth + 1) * 0.28, storm)
            let rot = it.rot + (P * 40 * it.orbit.w * (i % 2 ? 1 : -1)) * storm + Math.sin(P * 6 + i) * 3 * (1 - order)
            if (it.final && !(small && it.final[1] < -30)) {
              x = mix(x, sx(it.final[0]), order); y = mix(y, sy(it.final[1]), order)
              sc = mix(sc, it.fs ?? 1, order); rot = mix(rot, it.fr ?? 0, order)
            } else {
              const dir = Math.atan2(y - cy, x - cx)
              x += Math.cos(dir) * W * 0.5 * order; y += Math.sin(dir) * H * 0.5 * order
              alpha *= 1 - order
            }
            const behind = storm * (depth < -0.3 ? 1 : 0) // detrás del eje: un poco más apagado
            gsap.set(node, {
              x, y, rotation: rot, scale: sc, autoAlpha: alpha * (1 - behind * 0.35),
              zIndex: Math.round(10 + mix(i % 7, depth * 10, storm)),
            })
          }
          // textos por fase
          const ph = P < 0.2 ? 0 : P < 0.42 ? 1 : P < 0.72 ? 2 : 3
          copies.forEach((c, i) => {
            const on = i === ph
            c.style.opacity = on ? '1' : '0'
            c.style.transform = `translate3d(0, ${on ? 0 : i < ph ? -18 : 18}px, 0)`
          })
          gsap.set(finale, { autoAlpha: smooth(0.8, 0.94, P), y: (1 - smooth(0.8, 0.94, P)) * 30 })
          gsap.set(shirt, { autoAlpha: smooth(0.76, 0.9, P), scale: mix(0.86, 1, smooth(0.76, 0.92, P)), y: (1 - smooth(0.76, 0.92, P)) * 40 })
          gsap.set(bar, { scaleX: P })
        }

        const state = { p: 0 }
        gsap.to(state, {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => '+=' + window.innerHeight * (small ? 4.2 : 5.6),
            pin: stage,
            scrub: reduce ? true : 1.1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => { measure(); render(state.p) },
          },
          onUpdate: () => render(state.p),
        })
        render(0)

        // microinteracción: la tormenta se desvía levemente con el cursor (solo desktop)
        if (!small && !reduce) {
          const xTo = gsap.quickTo(layer, 'x', { duration: 1, ease: 'power3' })
          const yTo = gsap.quickTo(layer, 'y', { duration: 1, ease: 'power3' })
          const rTo = gsap.quickTo(layer, 'rotation', { duration: 1.2, ease: 'power3' })
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5
            xTo(nx * -26); yTo(ny * -16); rTo(nx * 1.2)
          }
          el.addEventListener('pointermove', onMove)
          return () => el.removeEventListener('pointermove', onMove)
        }
      })
    }, el)

    // precarga cuando la sección se acerca
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      nodes.forEach((n) => { n.loading = 'eager' })
      io.disconnect()
    }, { rootMargin: '150% 0px' })
    io.observe(el)
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)

    return () => { io.disconnect(); window.removeEventListener('load', refresh); ctx.revert() }
  }, [])

  return (
    <section ref={root} className={s.section} aria-label="LAMS Studio: identidad">
      <div className={s.stage}>
        <div className={s.glow} aria-hidden />

        <div className={s.copies}>
          {PHASES.map((p, i) => (
            <div key={p.k} className={s.copy} aria-hidden={i !== 0}>
              <p className={s.eyebrow}>0{i + 1} / {p.k}</p>
              <h2 className={s.title}>{p.t[0]} <em>{p.t[1]}</em></h2>
              <p className={s.text}>{p.p}</p>
            </div>
          ))}
          <div className={s.copy} aria-hidden />
        </div>

        <div className={s.shirt} aria-hidden>
          <img src="/images/noche-atlantica.webp" alt="" loading="lazy" decoding="async" />
        </div>

        <div className={s.layer} aria-hidden>
          {ITEMS.map((it) => (
            <img
              key={it.src}
              className={`${s.item} ${it.shadow ? s.shadow : ''}`}
              src={it.src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ width: `calc(var(--u) * ${it.w} * var(--k))` }}
            />
          ))}
        </div>

        <div className={s.finale}>
          <p className={s.eyebrow}>04 / Orden</p>
          <p className={s.brand}>LAMS <span>Studio</span></p>
          <p className={s.text}>Del caos a una sola idea: <em>más que una camiseta.</em></p>
          <a className={s.cta} href="#coleccion">Ver la colección <span aria-hidden>→</span></a>
        </div>

        <div className={s.bar} aria-hidden><i /></div>
      </div>
    </section>
  )
}
