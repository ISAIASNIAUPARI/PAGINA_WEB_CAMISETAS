'use client'

import Script from 'next/script'
import React, { useEffect, useRef, useState } from 'react'

import { EditableModel } from '@/components/editable/EditableModel'
import { SelectArea, TextStylesScope, Txt, useEditMode } from '@/components/editable/Editable'
import { SideButton, SideField } from '@/components/editable/SelectArea'
import type { Product3dData } from '@/lib/types'

import { money, useStore } from './Store'

type MV = HTMLElement & {
  model?: { materials: { pbrMetallicRoughness: { setBaseColorFactor: (c: string | number[]) => void } }[] }
}

export function Product3d({ data, onChange }: { data: Product3dData; onChange?: (d: Product3dData) => void }) {
  const set = onChange ? (patch: Partial<Product3dData>) => onChange({ ...data, ...patch }) : undefined
  const { add } = useStore()
  const edit = useEditMode()
  const [color, setColor] = useState(0)
  const [size, setSize] = useState(data.sizes.includes('M') ? 'M' : data.sizes[0])
  const [loaded, setLoaded] = useState(false)
  const mv = useRef<MV>(null)
  const c = data.colors[color] ?? data.colors[0]

  // Tiñe el modelo con el color elegido (el color base multiplica la textura).
  useEffect(() => {
    const el = mv.current
    if (!el) return
    const apply = () => {
      el.model?.materials.forEach((m) => m.pbrMetallicRoughness.setBaseColorFactor(c.hex))
      setLoaded(true)
    }
    if (el.model) apply()
    el.addEventListener('load', apply)
    return () => el.removeEventListener('load', apply)
  }, [c.hex])

  return (
    <TextStylesScope styles={data} patch={set && ((st) => set(st))}>
    <section className="relative overflow-hidden bg-[#0B0B0B] px-[clamp(20px,5cqw,80px)] py-[clamp(64px,10cqw,120px)]">
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js" strategy="lazyOnload" />
      <div className="mx-auto grid max-w-[1100px] items-center gap-[clamp(32px,6cqw,72px)] @3xl:grid-cols-[1.1fr_1fr]">
        <div data-reveal="scale" className="relative">
          <div
            className="group relative aspect-[3/4] max-h-[76vh] w-full overflow-hidden rounded-md border border-fog/10 transition-[background] duration-700"
            style={{ background: `radial-gradient(90% 70% at 50% 115%, ${c.hex}55 0%, transparent 60%), radial-gradient(90% 70% at 50% 115%, #3A0F4D 0%, transparent 70%), #050505` }}
          >
            {!loaded && (
              <div className="absolute inset-0 grid place-items-center">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-fog/10 border-t-violet" />
              </div>
            )}
            {React.createElement('model-viewer', {
              ref: mv,
              src: data.modelUrl,
              alt: `${data.title} en 3D, color ${c.name}`,
              loading: 'lazy',
              'camera-controls': true,
              'disable-zoom': true,
              'disable-pan': true,
              'disable-tap': true,
              'auto-rotate': true,
              'auto-rotate-delay': '0',
              'rotation-per-second': '16deg',
              'interaction-prompt': 'none',
              'touch-action': 'pan-y',
              'shadow-intensity': '0.75',
              'shadow-softness': '1',
              exposure: '1.15',
              'camera-orbit': '25deg 82deg 2.6m',
              'min-camera-orbit': 'auto auto 2.6m',
              'max-camera-orbit': 'auto auto 2.6m',
              'field-of-view': '32deg',
              // Sin la barra de carga nativa: se quedaba como una línea violeta en
              // el borde superior del cuadro y parecía un fallo. La carga ya la
              // indica el spinner propio de arriba.
              style: { width: '100%', height: '100%', backgroundColor: 'transparent', ['--progress-bar-height' as string]: '0px' },
            }, React.createElement('div', { slot: 'progress-bar', key: 'pb' }))}
            <EditableModel edit={edit} onChange={set && ((url) => set({ modelUrl: url }))} />
          </div>
        </div>

        <div>
          <p data-reveal className="mb-4 font-mono text-[11px] tracking-[.22em] text-mute uppercase">
            <Txt k="eyebrow" label="Antetítulo" value={data.eyebrow} onChange={set && ((v) => set({ eyebrow: v }))} />
          </p>
          <h2 className="mb-4 text-[clamp(34px,4.6cqw,56px)] leading-[.95] font-medium tracking-[-.04em] text-snow">
            <Txt k="title" label="Nombre de la pieza" value={data.title} onChange={set && ((v) => set({ title: v }))} split />
          </h2>
          <SelectArea label="Pieza 3D — precio, colores y tallas" controls={() => (
            <div>
              <SideField label="Precio (USD)" type="number" value={data.price} onChange={(v) => set?.({ price: Number(v) || 0 })} />
              <span className="admin-sidebar-sublabel">Colores</span>
              <div className="mt-1.5 mb-3 flex flex-col gap-2">
                {data.colors.map((col, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="color" value={col.hex} onChange={(e) => set?.({ colors: data.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)) })} className="h-8 w-10 shrink-0 cursor-pointer rounded border border-white/20 bg-transparent" />
                    <input value={col.name} onChange={(e) => set?.({ colors: data.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} className="admin-sidebar-input" />
                    {data.colors.length > 1 && (
                      <button type="button" onClick={() => { set?.({ colors: data.colors.filter((_, j) => j !== i) }); setColor(0) }} className="admin-sidebar-clear" title="Quitar color">×</button>
                    )}
                  </div>
                ))}
              </div>
              <SideButton onClick={() => set?.({ colors: [...data.colors, { name: 'Nuevo color', hex: '#888888' }] })}>+ Añadir color</SideButton>
              <SideField label="Tallas (separadas por comas)" value={data.sizes.join(', ')} onChange={(v) => set?.({ sizes: v.split(',').map((x) => x.trim()).filter(Boolean) })} />
              <p className="text-[11px] leading-snug text-white/45">El modelo 3D se cambia haciendo clic sobre el visor (archivo .glb, máx. 40 MB).</p>
            </div>
          )}>
            <span data-reveal className="font-mono text-2xl font-medium text-snow">
              {money(data.price)}
            </span>
          </SelectArea>

          <div data-reveal style={{ ['--d' as string]: 100 }} className="mt-8">
            <span className="text-xs tracking-[.06em] text-mute uppercase">
              Color — <span key={c.name} className="inline-block animate-[bump_.4s] text-fog">{c.name}</span>
            </span>
            <div className="mt-3 flex gap-3">
              {data.colors.map((col, i) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setColor(i)}
                  aria-label={col.name}
                  aria-pressed={color === i}
                  className={`h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 ${
                    color === i ? 'ring-2 ring-violet ring-offset-4 ring-offset-[#0B0B0B]' : 'ring-1 ring-fog/25'
                  }`}
                  style={{ background: col.hex }}
                />
              ))}
            </div>
          </div>

          <div data-reveal style={{ ['--d' as string]: 180 }} className="mt-7">
            <span className="text-xs tracking-[.06em] text-mute uppercase">Talla — {size}</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`min-w-12 rounded-[3px] border px-4 py-2.5 text-[13px] transition-all duration-300 ${
                    size === s ? 'border-fog bg-fog text-ink' : 'border-fog/15 bg-ink-3 text-fog hover:border-fog/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            data-reveal
            style={{ ['--d' as string]: 260 }}
            type="button"
            onClick={() =>
              add({ key: `3d-${c.name}-${size}`, name: data.title, detail: `${c.name} · Talla ${size}`, price: data.price, image: '' })
            }
            className="group relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[3px] bg-fog py-4 font-mono text-[11.5px] font-medium tracking-[.22em] text-ink uppercase"
          >
            <span className="absolute inset-0 -translate-x-full bg-plum transition-transform duration-500 ease-(--ease-out-soft) group-hover:translate-x-0" />
            <span className="relative transition-colors group-hover:text-fog">Añadir a la cesta · {money(data.price)}</span>
          </button>

          <div className="mt-7 border-t border-fog/10 pt-5 text-[13px] text-mute">
            <Txt k="note" label="Nota de envío" value={data.note} onChange={set && ((v) => set({ note: v }))} />
          </div>
        </div>
      </div>
    </section>
    </TextStylesScope>
  )
}
