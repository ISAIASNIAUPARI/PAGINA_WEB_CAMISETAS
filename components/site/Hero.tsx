'use client'

import React, { useEffect, useRef, useState } from 'react'

import { useIsMobileView } from '@/components/admin/useIsMobileView'
import { ButtonsArea } from '@/components/editable/ButtonsArea'
import { Img, SelectArea, TextStylesScope, Txt, useEditMode } from '@/components/editable/Editable'
import { SideButton, SideField } from '@/components/editable/SelectArea'
import { useTilt } from '@/components/motion'
import { newButtonId, resolveButtonHref } from '@/lib/buttons'
import type { HeroData, HeroSlide } from '@/lib/types'

import { money, useStore } from './Store'

const ROTATE_MS = 4200

/** Botón 1 = relleno claro; los demás = enlace de texto. Mismo aspecto en sitio y admin. */
export function heroButtonClass(i: number) {
  return i === 0
    ? 'inline-flex select-none items-center gap-3 rounded-[3px] bg-fog px-8 py-4 font-mono text-[11.5px] font-medium tracking-[.22em] text-ink uppercase no-underline transition-colors duration-300 hover:bg-plum hover:text-fog'
    : 'inline-flex select-none items-center py-2 text-xs font-medium tracking-[.08em] text-mute uppercase no-underline underline-offset-4 transition-colors hover:text-fog hover:underline'
}

export function Hero({ data, onChange }: { data: HeroData; onChange?: (d: HeroData) => void }) {
  const set = onChange ? (patch: Partial<HeroData>) => onChange({ ...data, ...patch }) : undefined
  const edit = useEditMode()
  const isMobile = useIsMobileView()
  const { add } = useStore()
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const tilt = useTilt<HTMLDivElement>(7)
  const slides = data.slides
  const current = slides[active] ?? slides[0]

  useEffect(() => {
    if (active >= slides.length) setActive(0)
  }, [active, slides.length])

  useEffect(() => {
    if (paused || edit || slides.length < 2) return
    const t = setTimeout(() => setActive((a) => (a + 1) % slides.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [active, paused, edit, slides.length])

  const setSlide = (i: number, patch: Partial<HeroSlide>) => set?.({ slides: slides.map((s, j) => (j === i ? { ...s, ...patch } : s)) })

  const slideControls = (i: number) => () => {
    const s = slides[i]
    if (!s) return null
    return (
      <div>
        <p className="mb-3 text-[11px] leading-snug text-white/55">
          Foto {i + 1} de {slides.length} de la vitrina. Para cambiar la imagen, haz clic sobre la foto grande. Con los números de la izquierda eliges qué foto editar.
        </p>
        <SideField label="Nombre" value={s.name} onChange={(v) => setSlide(i, { name: v })} />
        <SideField label="Detalle (color)" value={s.detail} onChange={(v) => setSlide(i, { detail: v })} />
        <SideField label="Precio (USD)" type="number" value={s.price} onChange={(v) => setSlide(i, { price: Number(v) || 0 })} />
        <SideButton
          onClick={() => {
            const copy = { ...s, id: newButtonId(), name: `${s.name} (copia)` }
            set?.({ slides: [...slides.slice(0, i + 1), copy, ...slides.slice(i + 1)] })
            setActive(i + 1)
          }}
        >
          + Añadir foto a la vitrina
        </SideButton>
        {slides.length > 1 && (
          <SideButton
            danger
            onClick={() => {
              set?.({ slides: slides.filter((_, j) => j !== i) })
              setActive(0)
            }}
          >
            Quitar esta foto
          </SideButton>
        )}
      </div>
    )
  }

  return (
    <TextStylesScope styles={data} patch={set && ((st) => set(st))}>
      <section ref={sectionRef} id="top" className="relative flex min-h-[100svh] flex-wrap items-stretch overflow-x-clip pt-[98px]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[-4cqw] z-0 overflow-hidden select-none">
          <div
            data-parallax="-0.12"
            className="text-center font-sans text-[34cqw] leading-[.8] font-bold tracking-[-.07em] text-transparent [-webkit-text-stroke:1px_rgba(167,107,224,.13)]"
          >
            LAMS
          </div>
        </div>

        <div className="relative z-10 flex flex-[1_1_480px] flex-col justify-center px-[clamp(20px,5cqw,80px)] py-[clamp(40px,7cqw,80px)]">
          <p data-reveal style={{ ['--d' as string]: 80 }} className="mb-7 flex items-center gap-3 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
            <span className="block h-px w-8 bg-violet" />
            <Txt k="eyebrow" label="Antetítulo" value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          </p>
          <h1 className="mb-7 font-sans text-[clamp(50px,9.2cqw,156px)] leading-[.86] font-medium tracking-[-.05em] text-snow">
            <Txt k="line1" label="Título — línea 1" as="span" className="block" value={data.line1} onChange={set && ((v) => set({ line1: v }))} split delay={150} />
            <Txt
              k="line2"
              label="Título — línea 2 (contorno)"
              as="span"
              className="block text-transparent [-webkit-text-stroke:1px_#8F9399]"
              value={data.line2}
              onChange={set && ((v) => set({ line2: v }))}
              split
              delay={330}
            />
            <Txt
              k="line3"
              label="Título — línea 3 (cursiva)"
              as="span"
              className="block bg-[linear-gradient(180deg,#efe9f7_0%,#b89cd6_45%,#6e3aa0_100%)] bg-clip-text pb-2 font-serif font-normal tracking-normal text-transparent italic"
              value={data.line3}
              onChange={set && ((v) => set({ line3: v }))}
              split
              delay={480}
            />
          </h1>
          <Txt k="body" label="Texto" as="p" className="mb-12 max-w-[420px] text-[17px] leading-[1.72] text-mute" value={data.body} onChange={set && ((v) => set({ body: v }))} />

          <div data-reveal style={{ ['--d' as string]: 650 }} className="flex min-h-[52px] flex-wrap items-center gap-6">
            <ButtonsArea
              sectionLabel="Portada"
              sectionRef={sectionRef}
              buttons={data.buttons}
              edit={edit}
              buttonClassName={heroButtonClass}
              onChange={(next) => set?.({ buttons: next })}
              staticRender={() => (
                <>
                  {data.buttons.map((b, i) => (
                    <a
                      key={b.id}
                      href={resolveButtonHref(b)}
                      target={b.hrefType === 'url' ? '_blank' : undefined}
                      rel={b.hrefType === 'url' ? 'noopener noreferrer' : undefined}
                      className={heroButtonClass(i)}
                    >
                      {b.text}
                      {i === 0 && <span aria-hidden>→</span>}
                    </a>
                  ))}
                </>
              )}
            />
          </div>

          <div data-reveal style={{ ['--d' as string]: 800 }} className="mt-16 hidden items-center gap-4 text-[11px] tracking-[.12em] text-mute uppercase @2xl:flex">
            <span className="relative block h-9 w-[22px] rounded-full border border-mute/50">
              <span className="absolute top-1.5 left-1/2 h-1.5 w-px -translate-x-1/2 animate-[float_1.8s_ease-in-out_infinite] bg-fog" />
            </span>
            <Txt k="scrollHint" label="Indicación de scroll" value={data.scrollHint} onChange={set && ((v) => set({ scrollHint: v }))} />
          </div>
        </div>

        {current && (
          <div
            data-reveal="scale"
            style={{ ['--d' as string]: 250 }}
            className="relative z-10 flex flex-[1_1_420px] items-center justify-center px-[clamp(20px,4cqw,40px)] pb-14 @5xl:pb-0"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="relative w-full max-w-[min(520px,58svh)]">
              <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(167,107,224,.28),transparent)] blur-2xl" />
              <div ref={tilt} className="relative aspect-[4/5] transition-transform duration-300 ease-out [transform-style:preserve-3d]">
                {slides.map((s, i) => {
                  const offset = (i - active + slides.length) % slides.length
                  const visible = offset < 3
                  return (
                    <div
                      key={s.id}
                      className="absolute inset-0 overflow-hidden rounded-md border border-fog/10 bg-[#f3f3f1] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] transition-all duration-[900ms] ease-(--ease-out-soft)"
                      style={{
                        zIndex: 10 - offset,
                        opacity: visible ? 1 - offset * 0.25 : 0,
                        pointerEvents: offset === 0 ? 'auto' : 'none',
                        transform: `translate3d(${offset * (isMobile ? 12 : 26)}px, ${-offset * 22}px, ${-offset * 60}px) rotate(${offset * 3}deg) scale(${1 - offset * 0.06})`,
                        filter: offset ? 'brightness(.55) saturate(.7)' : 'none',
                      }}
                    >
                      <Img
                        image={s.image}
                        eager
                        aspectRatio={4 / 5}
                        onChange={set && ((img) => setSlide(i, { image: img }))}
                        imgClassName={`h-full w-full object-cover transition-transform duration-[4200ms] ease-linear ${offset === 0 && !paused && !edit ? 'scale-[1.08]' : 'scale-100'}`}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="absolute right-4 -bottom-6 z-20 @2xl:right-8">
                <SelectArea label={`Vitrina — foto ${active + 1}`} controls={slideControls(active)}>
                  <div className="flex items-center gap-4 rounded-[4px] border border-fog/15 bg-ink-3/85 py-3 pr-3 pl-5 backdrop-blur-md">
                    <div className="min-w-[120px]">
                      <span className="block text-base font-medium tracking-[-.01em] text-snow">{current.name}</span>
                      <span className="text-xs tracking-[.04em] text-mute">
                        {current.detail} · {money(current.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => add({ key: current.id, name: current.name, detail: current.detail, price: current.price, image: current.image.url })}
                      className="grid h-10 w-10 place-items-center rounded-full bg-fog text-lg text-ink transition-all duration-300 hover:rotate-90 hover:bg-violet"
                      aria-label={`Añadir ${current.name} al carrito`}
                    >
                      +
                    </button>
                  </div>
                </SelectArea>
              </div>

              <div className={`absolute top-1/2 -left-2 z-20 -translate-y-1/2 flex-col gap-2 @5xl:-left-8 ${edit ? 'flex' : 'hidden @2xl:flex'}`}>
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActive(i)
                    }}
                    aria-label={`Ver ${s.name}`}
                    title={edit ? `Mostrar la foto ${i + 1} para editarla` : undefined}
                    className={`relative overflow-hidden rounded-full ${edit ? 'h-7 w-7 bg-ink/80 text-[10px] text-fog ring-1 ring-fog/30' : 'h-10 w-[3px] bg-fog/15'}`}
                  >
                    {edit ? (
                      <span className={`grid h-full w-full place-items-center rounded-full ${i === active ? 'bg-violet text-ink' : ''}`}>{i + 1}</span>
                    ) : (
                      i === active && (
                        <span
                          key={active}
                          className="absolute inset-0 origin-top bg-violet"
                          style={{ animation: `grow ${ROTATE_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
                        />
                      )
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </TextStylesScope>
  )
}
