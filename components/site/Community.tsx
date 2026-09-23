'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Txt, VideoSwap, useEdit } from '@/components/editable/Editable'
import type { NewsletterData, SocialData, TestimonialsData } from '@/lib/types'

import { useStore } from './Store'

/* ─────────────── Testimonios ─────────────── */

export function Testimonials({ data, onChange }: { data: TestimonialsData; onChange?: (d: TestimonialsData) => void }) {
  const set = onChange ? (patch: Partial<TestimonialsData>) => onChange({ ...data, ...patch }) : undefined
  const { edit } = useEdit()

  const card = (t: TestimonialsData['items'][number], i: number, editable: boolean) => {
    const setT =
      editable && set ? (patch: Partial<typeof t>) => set({ items: data.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) }) : undefined
    return (
      <figure className="flex w-[min(340px,80vw)] shrink-0 flex-col gap-3 rounded-md border border-fog/10 bg-ink-2 p-6 whitespace-normal transition-colors duration-300 hover:border-violet/40">
        <span className="text-sm tracking-[.1em] text-[#e6bb52]" aria-label="5 de 5 estrellas">
          ★★★★★
        </span>
        <blockquote className="text-sm leading-[1.6] text-fog">
          “<Txt value={t.text} onChange={setT && ((v) => setT({ text: v }))} />”
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-plum text-[11px] font-semibold text-lilac">{t.name.charAt(0)}</span>
          <span className="text-[13px] font-semibold text-snow">
            <Txt value={t.name} onChange={setT && ((v) => setT({ name: v }))} />
          </span>
          <span className="rounded-full border border-fog/15 px-2 py-0.5 font-mono text-[9px] tracking-[.08em] text-mute uppercase">Verificado</span>
        </figcaption>
      </figure>
    )
  }

  const rowA = [...data.items, ...data.items]
  const rowB = [...data.items].reverse()
  return (
    <section className="overflow-hidden py-[clamp(64px,10vw,110px)] [background:radial-gradient(900px_500px_at_50%_0%,rgba(75,19,102,.22),transparent_60%),#050505]">
      <div className="mb-12 px-5 text-center">
        <p data-reveal className="mb-3.5 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
          <Txt value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
        </p>
        <h2 className="text-[clamp(32px,4.6vw,56px)] leading-[.95] font-medium tracking-[-.04em] text-snow">
          <Txt value={data.title} onChange={set && ((v) => set({ title: v }))} split />
        </h2>
      </div>
      {edit ? (
        <div className="flex flex-wrap justify-center gap-5 px-5">{data.items.map((t, i) => <React.Fragment key={i}>{card(t, i, true)}</React.Fragment>)}</div>
      ) : (
        <div className="flex flex-col gap-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="flex w-max animate-[marquee_48s_linear_infinite] gap-5 hover:[animation-play-state:paused]">
            {rowA.map((t, i) => (
              <React.Fragment key={i}>{card(t, i, false)}</React.Fragment>
            ))}
          </div>
          <div className="flex w-max animate-[marquee-rev_52s_linear_infinite] gap-5 hover:[animation-play-state:paused]">
            {[...rowB, ...rowB].map((t, i) => (
              <React.Fragment key={i}>{card(t, i, false)}</React.Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/* ─────────────── Redes + videos ─────────────── */

/** Póster automático: primer fotograma del video en Cloudinary (so_1, jpg). */
function posterFor(url: string) {
  return url.includes('/video/upload/') ? url.replace('/video/upload/', '/video/upload/so_1,f_auto,q_auto,w_480/').replace(/\.(mp4|mov|webm)$/i, '.jpg') : undefined
}
function sourceFor(url: string, fmt: 'webm' | 'mp4') {
  if (!url.includes('/video/upload/')) return url
  const t = fmt === 'webm' ? 'f_webm,vc_vp9,q_auto,w_720' : 'f_mp4,q_auto,w_720'
  return url.replace('/video/upload/', `/video/upload/${t}/`).replace(/\.(mp4|mov|webm)$/i, `.${fmt}`)
}

/** Video que solo reproduce cuando está en pantalla; clic para activar el sonido. */
function ReelVideo({ url, index, onChange }: { url: string; index: number; onChange?: (url: string) => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting)
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [url])

  return (
    <div
      data-reveal
      style={{ ['--d' as string]: index * 100 }}
      className={`group relative aspect-[9/16] overflow-hidden rounded-md border border-fog/10 bg-ink-3 ${index % 2 ? 'lg:translate-y-10' : ''}`}
    >
      <video
        key={url}
        ref={ref}
        muted={muted}
        loop
        playsInline
        preload="none"
        poster={posterFor(url)}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      >
        <source src={sourceFor(url, 'webm')} type="video/webm" />
        <source src={sourceFor(url, 'mp4')} type="video/mp4" />
      </video>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
      <button
        type="button"
        onClick={() => {
          setMuted((m) => !m)
          ref.current?.play().catch(() => {})
        }}
        className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-fog/20 bg-ink/60 px-3 py-1.5 font-mono text-[10px] tracking-[.14em] text-fog uppercase backdrop-blur transition-colors hover:border-violet"
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${inView ? 'animate-pulse bg-violet' : 'bg-mute'}`} />
        {muted ? 'Sonido' : 'Silenciar'}
      </button>
      <VideoSwap onChange={onChange} />
    </div>
  )
}

export function Social({ data, onChange }: { data: SocialData; onChange?: (d: SocialData) => void }) {
  const set = onChange ? (patch: Partial<SocialData>) => onChange({ ...data, ...patch }) : undefined
  return (
    <section id="social" className="mx-auto max-w-[1400px] scroll-mt-24 px-[clamp(20px,5vw,80px)] pt-[clamp(64px,10vw,110px)] pb-[clamp(64px,8vw,120px)]">
      <div className="mb-12 text-center">
        <p data-reveal className="mb-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
          <Txt value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
        </p>
        <h2 className="text-[clamp(32px,5.6vw,68px)] leading-[.92] font-medium tracking-[-.045em] text-snow">
          <Txt value={data.title} onChange={set && ((v) => set({ title: v }))} split />
        </h2>
      </div>
      <div className="grid grid-cols-3 border-y border-line">
        {data.links.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
            style={{ ['--d' as string]: i * 90 }}
            className={`group relative flex flex-col items-center gap-3 overflow-hidden py-9 text-fog no-underline ${i < data.links.length - 1 ? 'border-r border-line' : ''}`}
          >
            <span className="absolute inset-0 translate-y-full bg-plum-deep transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-y-0" />
            <span className="relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-md border border-line bg-ink-3 transition-transform duration-500 ease-(--ease-out-soft) group-hover:-translate-y-1 group-hover:rotate-[-4deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.icon} alt="" className="h-[52px] w-[52px] object-contain" loading="lazy" />
            </span>
            <span className="relative flex items-center gap-1.5 text-xs tracking-[.08em] text-mute uppercase transition-colors group-hover:text-snow">
              {l.label}
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </span>
          </a>
        ))}
      </div>

      <div className="mt-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p data-reveal className="mb-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
              <Txt value={data.videosEyebrow} onChange={set && ((v) => set({ videosEyebrow: v }))} />
            </p>
            <h3 className="text-[clamp(26px,3.6vw,44px)] leading-none font-normal tracking-[-.03em] text-snow">
              <Txt value={data.videosTitle} onChange={set && ((v) => set({ videosTitle: v }))} split />
            </h3>
          </div>
          <span data-reveal className="font-mono text-[11px] tracking-[.14em] text-mute uppercase">
            Se reproducen al verlos · toca para sonido
          </span>
        </div>
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-10 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
          {data.videos.map((v, i) => (
            <div key={i} className="w-[62vw] max-w-[280px] shrink-0 snap-center lg:w-auto lg:max-w-none">
              <ReelVideo
                url={v.url}
                index={i}
                onChange={set && ((url) => set({ videos: data.videos.map((x, j) => (j === i ? { url } : x)) }))}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Newsletter ─────────────── */

export function Newsletter({ data, onChange }: { data: NewsletterData; onChange?: (d: NewsletterData) => void }) {
  const set = onChange ? (patch: Partial<NewsletterData>) => onChange({ ...data, ...patch }) : undefined
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section id="newsletter" className="relative overflow-hidden border-t border-line [background:radial-gradient(1000px_600px_at_50%_0%,rgba(75,19,102,.32),transparent_60%),#0f0f12]">
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-violet/15" />
      <div className="relative mx-auto max-w-[640px] px-6 py-[clamp(80px,12vw,130px)] text-center">
        <p data-reveal className="mb-6 flex items-center justify-center gap-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
          <span className="block h-px w-6 bg-mute" />
          <Txt value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          <span className="block h-px w-6 bg-mute" />
        </p>
        <h2 className="mb-6 text-[clamp(34px,5vw,64px)] leading-[.96] font-medium tracking-[-.04em] text-snow">
          <Txt as="span" className="block" value={data.title} onChange={set && ((v) => set({ title: v }))} split />
          <Txt
            as="em"
            className="block font-serif font-normal tracking-normal text-lilac"
            value={data.titleEm}
            onChange={set && ((v) => set({ titleEm: v }))}
            split
            delay={200}
          />
        </h2>
        <Txt as="p" multiline className="mb-12 text-base leading-[1.75] text-mute" value={data.body} onChange={set && ((v) => set({ body: v }))} />
        <form
          data-reveal
          onSubmit={(e) => {
            e.preventDefault()
            if (!email) return
            setDone(true)
            setEmail('')
            toast('Bienvenida a la comunidad · revisa tu correo')
          }}
          className="mx-auto mb-5 flex max-w-[460px] overflow-hidden rounded-[3px] border border-line bg-[#0B0B0B] transition-[border-color,box-shadow] duration-300 focus-within:border-violet focus-within:shadow-[0_0_0_3px_rgba(167,107,224,.15)]"
        >
          <input
            type="email"
            required
            value={email}
            disabled={done}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={done ? 'Ya estás en la lista ✓' : 'tu@email.com'}
            aria-label="Correo electrónico"
            className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-fog outline-none placeholder:text-mute"
          />
          <button
            type="submit"
            disabled={done}
            className={`px-6 text-[11px] font-medium tracking-[.09em] whitespace-nowrap uppercase transition-colors duration-300 ${
              done ? 'bg-plum text-fog' : 'bg-fog text-ink hover:bg-plum hover:text-fog'
            }`}
          >
            {done ? '¡Listo ✓' : 'Suscribirme'}
          </button>
        </form>
        <p className="text-xs text-mute">
          Sin spam. Baja cuando quieras. Consulta nuestra{' '}
          <a href="/privacidad" className="text-[#BFC2C7] underline underline-offset-[3px] hover:text-fog">
            política de privacidad
          </a>
          .
        </p>
      </div>
    </section>
  )
}
