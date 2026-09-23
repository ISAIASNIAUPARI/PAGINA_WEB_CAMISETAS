'use client'

import React, { useEffect, useRef } from 'react'

import { TextStylesScope, Txt, useEditMode } from '@/components/editable/Editable'
import type { AboutData } from '@/lib/types'

/** Párrafo que se "enciende" palabra por palabra a medida que se hace scroll. */
function ScrollLit({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>('span'))
    let raf = 0
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)))
      const lit = p * words.length
      words.forEach((w, i) => (w.style.opacity = String(Math.min(1, Math.max(0.18, lit - i + 0.18)))))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [text])
  return (
    <p ref={ref} className="text-[clamp(22px,2.6cqw,36px)] leading-[1.3] tracking-[-.02em] text-snow">
      {text.split(/\s+/).map((w, i) => (
        <span key={i} className="transition-opacity duration-200" style={{ opacity: 0.18 }}>
          {w}{' '}
        </span>
      ))}
    </p>
  )
}

export function About({ data, onChange }: { data: AboutData; onChange?: (d: AboutData) => void }) {
  const set = onChange ? (patch: Partial<AboutData>) => onChange({ ...data, ...patch }) : undefined
  const edit = useEditMode()

  return (
    <TextStylesScope styles={data} patch={set && ((st) => set(st))}>
    <section
      id="nosotros"
      className="scroll-mt-24 bg-ink-2 px-[clamp(20px,5cqw,80px)] py-[clamp(64px,10cqw,120px)] [background:radial-gradient(1000px_600px_at_15%_-10%,rgba(75,19,102,.3),transparent_60%),radial-gradient(800px_500px_at_100%_40%,rgba(45,10,58,.3),transparent_60%),#0a0a0c]"
    >
      <div className="mb-[clamp(56px,8cqw,96px)] grid gap-10 @5xl:grid-cols-[1fr_1.1fr] @5xl:gap-20">
        <h2 className="text-[clamp(38px,4.8cqw,76px)] leading-[1.02] font-normal tracking-[-.035em] text-snow">
          <Txt k="title" label="Título" value={data.title} onChange={set && ((v) => set({ title: v }))} split />{' '}
          <Txt
            k="titleEm"
            label="Título (cursiva)"
            as="em"
            className="font-serif text-lilac"
            value={data.titleEm}
            onChange={set && ((v) => set({ titleEm: v }))}
            split
            delay={300}
          />
        </h2>
        <div className="@5xl:pt-3">
          {edit && set ? (
            <Txt k="body" label="Texto" as="p" className="text-[clamp(22px,2.6cqw,36px)] leading-[1.3] text-snow" value={data.body} onChange={(v) => set({ body: v })} />
          ) : (
            <ScrollLit text={data.body} />
          )}
        </div>
      </div>

      <div className="grid border-t border-fog/10 @3xl:grid-cols-3">
        {data.values.map((v, i) => {
          const setV = set
            ? (patch: Partial<AboutData['values'][number]>) => set({ values: data.values.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
            : undefined
          return (
            <div
              key={v.id}
              data-reveal
              style={{ ['--d' as string]: i * 120 }}
              className={`group relative overflow-hidden px-[clamp(24px,3.5cqw,44px)] py-[clamp(36px,5cqw,56px)] ${
                i < data.values.length - 1 ? 'border-b border-fog/10 @3xl:border-r @3xl:border-b-0' : ''
              }`}
            >
              <span className="absolute inset-0 translate-y-full bg-plum-deep transition-transform duration-700 ease-(--ease-out-soft) group-hover:translate-y-0" />
              <div className="relative">
                <div className="mb-6 flex items-baseline justify-between">
                  <span className="font-serif text-[64px] leading-none text-violet/30 italic transition-colors duration-500 group-hover:text-violet">
                    {v.n}
                  </span>
                  <span className="h-px w-10 origin-right scale-x-50 bg-fog/20 transition-transform duration-700 group-hover:scale-x-100 group-hover:bg-violet" />
                </div>
                <Txt k={`values.${v.id}.name`} label="Valor — título" as="h3" className="mb-3 text-[23px] font-semibold text-[#EDEBF0]" value={v.name} onChange={setV && ((x) => setV({ name: x }))} />
                <Txt k={`values.${v.id}.desc`} label="Valor — texto" as="p" className="text-sm leading-[1.75] text-mute transition-colors duration-500 group-hover:text-fog" value={v.desc} onChange={setV && ((x) => setV({ desc: x }))} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
    </TextStylesScope>
  )
}
