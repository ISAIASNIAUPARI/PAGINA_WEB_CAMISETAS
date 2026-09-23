'use client'

import React, { useMemo, useState } from 'react'

import { AdminField, ImageSwap, Txt, useEdit } from '@/components/editable/Editable'
import { useTilt } from '@/components/motion'
import type { CollectionData, Product } from '@/lib/types'

import { money, useStore } from './Store'

function ProductCard({ p, index, onChange }: { p: Product; index: number; onChange?: (p: Product) => void }) {
  const { add } = useStore()
  const { edit } = useEdit()
  const tilt = useTilt<HTMLDivElement>(5)
  const set = onChange ? (patch: Partial<Product>) => onChange({ ...p, ...patch }) : undefined

  return (
    <article data-reveal style={{ ['--d' as string]: (index % 4) * 90 }} className="group">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10.5px] tracking-[.1em] text-mute uppercase">
          <Txt value={p.code} onChange={set && ((v) => set({ code: v }))} />
        </span>
        {(p.chip || edit) && (
          <span className="rounded-full border border-fog/25 px-2.5 py-1 font-mono text-[9.5px] tracking-[.1em] text-fog uppercase">
            <Txt value={p.chip || '—'} onChange={set && ((v) => set({ chip: v === '—' ? '' : v }))} />
          </span>
        )}
      </div>
      <div
        ref={tilt}
        className="relative mb-4 aspect-[3/4] overflow-hidden rounded-[4px] border border-fog/10 bg-[#f3f3f1] transition-[transform,box-shadow] duration-300 ease-out group-hover:shadow-[0_30px_60px_-25px_rgba(75,19,102,.7)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={`${p.name}, camiseta color ${p.colorName}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-(--ease-out-soft) group-hover:scale-[1.07]"
        />
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(360px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,.25),transparent_50%)] group-hover:opacity-100" />
        <span
          className="absolute top-3 right-3 z-10 h-2.5 w-2.5 rounded-full border border-white/40"
          style={{ background: p.colorHex }}
          title={p.colorName}
        />
        {!edit && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end p-2.5 md:justify-center md:bg-gradient-to-t md:from-ink/60 md:to-transparent md:p-4 md:pt-12 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => add({ key: p.id, name: p.name, detail: p.colorName, price: p.price, image: p.image })}
              aria-label={`Añadir ${p.name} a la cesta`}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink/85 text-lg text-snow shadow-lg backdrop-blur transition-all duration-300 ease-(--ease-out-soft) active:scale-90 md:flex md:h-auto md:w-auto md:translate-y-3 md:gap-2 md:rounded-[3px] md:bg-fog md:px-5 md:py-2.5 md:text-[11px] md:font-medium md:tracking-[.1em] md:text-ink md:uppercase md:group-hover:translate-y-0 md:hover:bg-violet"
            >
              <span className="md:hidden">+</span>
              <span className="hidden md:inline">+ Añadir · {money(p.price)}</span>
            </button>
          </div>
        )}
        <ImageSwap onChange={set && ((url) => set({ image: url }))} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-[10px] tracking-[.08em] text-mute uppercase">
            <Txt value={p.category} onChange={set && ((v) => set({ category: v }))} />
          </span>
          <Txt as="h3" className="text-[17px] font-semibold tracking-[-.01em] text-snow" value={p.name} onChange={set && ((v) => set({ name: v }))} />
          <span className="text-[12px] text-mute">
            <Txt value={p.colorName} onChange={set && ((v) => set({ colorName: v }))} />
          </span>
        </div>
        <span className="pt-4 font-mono text-[13px] text-fog">{money(p.price)}</span>
      </div>
      {set && (
        <div className="mt-2 flex flex-col gap-1">
          <AdminField label="Precio" type="number" value={p.price} onChange={(v) => set({ price: Number(v) || 0 })} />
          <AdminField label="Color" type="color" value={p.colorHex} onChange={(v) => set({ colorHex: v })} />
        </div>
      )}
    </article>
  )
}

export function Collection({ data, onChange }: { data: CollectionData; onChange?: (d: CollectionData) => void }) {
  const set = onChange ? (patch: Partial<CollectionData>) => onChange({ ...data, ...patch }) : undefined
  const { edit } = useEdit()
  const categories = useMemo(() => ['Todo', ...Array.from(new Set(data.products.map((p) => p.category)))], [data.products])
  const [filter, setFilter] = useState('Todo')
  const [sort, setSort] = useState<'default' | 'asc' | 'desc'>('default')

  const shown = useMemo(() => {
    const list = edit || filter === 'Todo' ? data.products : data.products.filter((p) => p.category === filter)
    if (edit || sort === 'default') return list
    return [...list].sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price))
  }, [data.products, filter, sort, edit])

  return (
    <section
      id="coleccion"
      className="relative scroll-mt-24 px-[clamp(20px,5vw,80px)] py-[clamp(64px,10vw,120px)] [background:radial-gradient(1000px_600px_at_85%_0%,rgba(45,10,58,.3),transparent_60%),radial-gradient(800px_500px_at_0%_60%,rgba(75,19,102,.22),transparent_60%)]"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p data-reveal className="mb-3.5 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
            <Txt value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          </p>
          <h2 className="text-[clamp(40px,5.6vw,84px)] leading-[.92] font-medium tracking-[-.045em] text-snow">
            <Txt as="span" className="block" value={data.title} onChange={set && ((v) => set({ title: v }))} split />
            <Txt
              as="span"
              className="block font-serif font-normal tracking-normal text-lilac italic"
              value={data.titleEm}
              onChange={set && ((v) => set({ titleEm: v }))}
              split
              delay={120}
            />
          </h2>
        </div>
        <div data-reveal className="flex flex-col items-start gap-3 sm:items-end">
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-ink-2/80 p-1" role="tablist" aria-label="Filtrar por categoría">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-2 font-mono text-[10.5px] tracking-[.14em] whitespace-nowrap uppercase transition-colors duration-300 ${
                  filter === c ? 'bg-fog text-ink' : 'text-mute hover:text-fog'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 font-mono text-[10.5px] tracking-[.1em] text-mute uppercase">
            <span>
              {String(shown.length).padStart(2, '0')} / {String(data.products.length).padStart(2, '0')} piezas
            </span>
            <label className="flex items-center gap-1.5">
              Ordenar
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="cursor-pointer rounded border border-line bg-ink-2 px-2 py-1 text-fog uppercase outline-none"
              >
                <option value="default">Destacado</option>
                <option value="asc">Precio ↑</option>
                <option value="desc">Precio ↓</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <hr className="mb-14 h-px origin-left border-none bg-line" data-reveal="fade" />
      <div key={filter + sort} className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-7 lg:grid-cols-4">
        {shown.map((p, i) => (
          <ProductCard
            key={p.id}
            p={p}
            index={i}
            onChange={set && ((np) => set({ products: data.products.map((x) => (x.id === np.id ? np : x)) }))}
          />
        ))}
      </div>
    </section>
  )
}
