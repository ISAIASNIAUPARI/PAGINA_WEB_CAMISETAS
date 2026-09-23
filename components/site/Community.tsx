'use client'

import React, { useEffect, useRef, useState } from 'react'

import { CloudinaryVideo } from '@/components/editable/CloudinaryVideo'
import { Img, SelectArea, TextStylesScope, Txt, useEditMode } from '@/components/editable/Editable'
import { SideButton, SideField } from '@/components/editable/SelectArea'
import { newButtonId } from '@/lib/buttons'
import type { NewsletterData, SocialData, SocialLink, TestimonialsData } from '@/lib/types'

import { useStore } from './Store'

/* ─────────────── Testimonios ─────────────── */

export function Testimonials({ data, onChange }: { data: TestimonialsData; onChange?: (d: TestimonialsData) => void }) {
  const set = onChange ? (patch: Partial<TestimonialsData>) => onChange({ ...data, ...patch }) : undefined
  const edit = useEditMode()

  const card = (t: TestimonialsData['items'][number], i: number, editable: boolean) => {
    const setT =
      editable && set ? (patch: Partial<typeof t>) => set({ items: data.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) }) : undefined
    return (
      <figure className="flex w-[min(340px,80cqw)] shrink-0 flex-col gap-3 rounded-md border border-fog/10 bg-ink-2 p-6 whitespace-normal transition-colors duration-300 hover:border-violet/40">
        <span className="text-sm tracking-[.1em] text-[#e6bb52]" aria-label="5 de 5 estrellas">
          ★★★★★
        </span>
        <blockquote className="text-sm leading-[1.6] text-fog">
          “<Txt k={`items.${t.id}.text`} label="Testimonio" value={t.text} onChange={setT && ((v) => setT({ text: v }))} />”
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-plum text-[11px] font-semibold text-lilac">{t.name.charAt(0)}</span>
          <span className="text-[13px] font-semibold text-snow">
            <Txt k={`items.${t.id}.name`} label="Nombre del cliente" value={t.name} onChange={setT && ((v) => setT({ name: v }))} />
          </span>
          <span className="rounded-full border border-fog/15 px-2 py-0.5 font-mono text-[9px] tracking-[.08em] text-mute uppercase">Verificado</span>
        </figcaption>
      </figure>
    )
  }

  const rowA = [...data.items, ...data.items]
  const rowB = [...data.items].reverse()
  return (
    <TextStylesScope styles={data} patch={set && ((st) => set(st))}>
    <section className="overflow-hidden py-[clamp(64px,10cqw,110px)] [background:radial-gradient(900px_500px_at_50%_0%,rgba(75,19,102,.22),transparent_60%),#050505]">
      <div className="mb-12 px-5 text-center">
        <p data-reveal className="mb-3.5 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
          <Txt k="eyebrow" label="Antetítulo" value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
        </p>
        <h2 className="text-[clamp(32px,4.6cqw,56px)] leading-[.95] font-medium tracking-[-.04em] text-snow">
          <Txt k="title" label="Título" value={data.title} onChange={set && ((v) => set({ title: v }))} split />
        </h2>
      </div>
      {edit ? (
        <div className="flex flex-wrap justify-center gap-5 px-5">
          {data.items.map((t, i) => (
            <div key={t.id} className="flex flex-col items-start gap-2">
              {card(t, i, true)}
              {data.items.length > 1 && (
                <button type="button" onClick={() => set?.({ items: data.items.filter((x) => x.id !== t.id) })} className="text-xs text-[#ff9b9b] underline">
                  Eliminar testimonio
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => set?.({ items: [...data.items, { id: newButtonId(), name: 'Nombre', text: 'Escribe aquí el testimonio.' }] })}
            className="grid min-h-[160px] w-[min(340px,80cqw)] place-items-center rounded-md border border-dashed border-violet/60 text-sm text-lilac hover:bg-plum/30"
          >
            + Añadir testimonio
          </button>
        </div>
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
    </TextStylesScope>
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
  const edit = useEditMode()
  if (edit && onChange) {
    return (
      <div className="relative aspect-[9/16] overflow-hidden rounded-md border border-fog/10 bg-ink-3">
        <CloudinaryVideo edit src={`${sourceFor(url, 'mp4')}#t=0.5`} onChange={onChange} className="h-full w-full object-cover" muted loop playsInline />
      </div>
    )
  }
  return <PublicReel url={url} index={index} />
}

function PublicReel({ url, index }: { url: string; index: number }) {
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
      className={`group relative aspect-[9/16] overflow-hidden rounded-md border border-fog/10 bg-ink-3 ${index % 2 ? '@5xl:translate-y-10' : ''}`}
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
    </div>
  )
}

export function Social({ data, onChange }: { data: SocialData; onChange?: (d: SocialData) => void }) {
  const set = onChange ? (patch: Partial<SocialData>) => onChange({ ...data, ...patch }) : undefined
  const edit = useEditMode()
  const setLink = (id: string, patch: Partial<SocialLink>) => set?.({ links: data.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) })

  const linkControls = (l: SocialLink) => () => (
    <div>
      <SideField label="Nombre de la red" value={l.label} onChange={(v) => setLink(l.id, { label: v })} />
      <SideField
        label="URL a la que lleva el botón"
        type="url"
        value={l.href}
        placeholder="https://www.facebook.com/tu-pagina"
        onChange={(v) => setLink(l.id, { href: v.trim() })}
        hint={/^\s*(javascript:|data:)/i.test(l.href) ? 'Esa URL no está permitida.' : 'Pega el enlace completo del perfil (con https://).'}
      />
      <span className="admin-sidebar-sublabel">Logo</span>
      <div className="relative mt-1.5 mb-3 grid h-24 w-24 place-items-center overflow-hidden rounded-md border border-white/15 bg-black/40">
        <Img image={{ url: l.icon, alt: l.label }} aspectRatio={1} imgClassName="h-full w-full object-contain p-3" onChange={(img) => setLink(l.id, { icon: img.url })} />
      </div>
      <SideButton danger onClick={() => set?.({ links: data.links.filter((x) => x.id !== l.id) })}>
        Quitar esta red
      </SideButton>
    </div>
  )

  return (
    <TextStylesScope styles={data} patch={set && ((st) => set(st))}>
      <section id="social" className="mx-auto max-w-[1400px] scroll-mt-24 px-[clamp(20px,5cqw,80px)] pt-[clamp(64px,10cqw,110px)] pb-[clamp(64px,8cqw,120px)]">
        <div className="mb-12 text-center">
          <p data-reveal className="mb-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
            <Txt k="eyebrow" label="Antetítulo" value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          </p>
          <h2 className="text-[clamp(32px,5.6cqw,68px)] leading-[.92] font-medium tracking-[-.045em] text-snow">
            <Txt k="title" label="Título" value={data.title} onChange={set && ((v) => set({ title: v }))} split />
          </h2>
        </div>
        <div className="grid border-y border-line" style={{ gridTemplateColumns: `repeat(${data.links.length + (edit ? 1 : 0)}, minmax(0, 1fr))` }}>
          {data.links.map((l, i) => {
            const card = (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => edit && e.preventDefault()}
                data-reveal
                style={{ ['--d' as string]: i * 90 }}
                className={`group relative flex h-full flex-col items-center gap-3 overflow-hidden py-9 text-fog no-underline ${i < data.links.length - 1 || edit ? 'border-r border-line' : ''}`}
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
                {edit && <span className="relative max-w-[90%] truncate font-mono text-[10px] text-lilac/80">{l.href.replace(/^https?:\/\//, '')}</span>}
              </a>
            )
            return edit ? (
              <SelectArea key={l.id} label={`Red social — ${l.label}`} controls={linkControls(l)}>
                {card}
              </SelectArea>
            ) : (
              <React.Fragment key={l.id}>{card}</React.Fragment>
            )
          })}
          {edit && (
            <button
              type="button"
              onClick={() => set?.({ links: [...data.links, { id: newButtonId(), label: 'Nueva red', href: 'https://', icon: '/images/instagram.png' }] })}
              className="py-9 text-sm text-lilac hover:bg-plum/30"
            >
              + Añadir red
            </button>
          )}
        </div>

        <div className="mt-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p data-reveal className="mb-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
                <Txt k="videosEyebrow" label="Antetítulo de videos" value={data.videosEyebrow} onChange={set && ((v) => set({ videosEyebrow: v }))} />
              </p>
              <h3 className="text-[clamp(26px,3.6cqw,44px)] leading-none font-normal tracking-[-.03em] text-snow">
                <Txt k="videosTitle" label="Título de videos" value={data.videosTitle} onChange={set && ((v) => set({ videosTitle: v }))} split />
              </h3>
            </div>
            <span data-reveal className="font-mono text-[11px] tracking-[.14em] text-mute uppercase">
              Se reproducen al verlos · toca para sonido
            </span>
          </div>
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-10 @5xl:mx-0 @5xl:grid @5xl:grid-cols-4 @5xl:gap-6 @5xl:overflow-visible @5xl:px-0">
            {data.videos.map((v, i) => (
              <div key={v.id} className="w-[62cqw] max-w-[280px] shrink-0 snap-center @5xl:w-auto @5xl:max-w-none">
                <ReelVideo url={v.url} index={i} onChange={set && ((url) => set({ videos: data.videos.map((x) => (x.id === v.id ? { ...x, url } : x)) }))} />
                {edit && data.videos.length > 1 && (
                  <button type="button" onClick={() => set?.({ videos: data.videos.filter((x) => x.id !== v.id) })} className="mt-2 text-xs text-[#ff9b9b] underline">
                    Quitar video
                  </button>
                )}
              </div>
            ))}
            {edit && (
              <button
                type="button"
                onClick={() => set?.({ videos: [...data.videos, { id: newButtonId(), url: data.videos[0]?.url ?? '' }] })}
                className="grid aspect-[9/16] w-[62cqw] max-w-[280px] shrink-0 place-items-center rounded-md border border-dashed border-violet/60 text-sm text-lilac hover:bg-plum/30 @5xl:w-auto @5xl:max-w-none"
              >
                + Añadir video
              </button>
            )}
          </div>
        </div>
      </section>
    </TextStylesScope>
  )
}

/* ─────────────── Newsletter ─────────────── */

export function Newsletter({ data, onChange }: { data: NewsletterData; onChange?: (d: NewsletterData) => void }) {
  const set = onChange ? (patch: Partial<NewsletterData>) => onChange({ ...data, ...patch }) : undefined
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <TextStylesScope styles={data} patch={set && ((st) => set(st))}>
    <section id="newsletter" className="relative overflow-hidden border-t border-line [background:radial-gradient(1000px_600px_at_50%_0%,rgba(75,19,102,.32),transparent_60%),#0f0f12]">
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-violet/15" />
      <div className="relative mx-auto max-w-[640px] px-6 py-[clamp(80px,12cqw,130px)] text-center">
        <p data-reveal className="mb-6 flex items-center justify-center gap-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
          <span className="block h-px w-6 bg-mute" />
          <Txt k="eyebrow" label="Antetítulo" value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          <span className="block h-px w-6 bg-mute" />
        </p>
        <h2 className="mb-6 text-[clamp(34px,5cqw,64px)] leading-[.96] font-medium tracking-[-.04em] text-snow">
          <Txt k="title" label="Título" as="span" className="block" value={data.title} onChange={set && ((v) => set({ title: v }))} split />
          <Txt
            k="titleEm"
            label="Título (cursiva)"
            as="em"
            className="block font-serif font-normal tracking-normal text-lilac"
            value={data.titleEm}
            onChange={set && ((v) => set({ titleEm: v }))}
            split
            delay={200}
          />
        </h2>
        <Txt k="body" label="Texto" as="p" className="mb-12 text-base leading-[1.75] text-mute" value={data.body} onChange={set && ((v) => set({ body: v }))} />
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
    </TextStylesScope>
  )
}
