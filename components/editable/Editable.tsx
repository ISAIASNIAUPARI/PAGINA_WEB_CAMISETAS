'use client'

import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react'

import { SplitText } from '@/components/motion'

/**
 * Capa de edición en línea. En el sitio público `edit` es false y todo se
 * renderiza como HTML normal; en /admin, AdminApp envuelve el sitio con
 * <EditContext.Provider value={{ edit: true, ... }}>.
 */
type EditApi = {
  edit: boolean
  uploadImage?: (file: File) => Promise<string>
  uploadVideo?: (file: File, onProgress: (p: number) => void) => Promise<string>
}

export const EditContext = createContext<EditApi>({ edit: false })
export const useEdit = () => useContext(EditContext)

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span' | 'em' | 'strong'

/**
 * Texto editable. En /admin es contentEditable; el valor NUNCA se pasa como
 * children mientras se edita — se sincroniza por ref solo cuando el campo no
 * tiene el foco (error #1 del protocolo: si no, el texto salta de campo).
 */
export function Txt({
  value,
  onChange,
  as = 'span',
  className,
  split,
  delay,
  multiline,
}: {
  value: string
  onChange?: (v: string) => void
  as?: Tag
  className?: string
  /** En el sitio público: entra palabra por palabra. */
  split?: boolean
  delay?: number
  multiline?: boolean
}) {
  const { edit } = useEdit()
  const ref = useRef<HTMLElement>(null)
  const focused = useRef(false)

  useLayoutEffect(() => {
    if (edit && ref.current && !focused.current && ref.current.innerText !== value) {
      ref.current.innerText = value
    }
  }, [edit, value])

  if (!edit || !onChange) {
    const Tag = as
    return <Tag className={className}>{split ? <SplitText text={value} delay={delay} /> : value}</Tag>
  }

  return React.createElement(as, {
    ref,
    className: `${className ?? ''} ${as === 'span' || as === 'em' || as === 'strong' ? 'inline-block' : 'block'} cursor-text rounded-sm outline-dashed outline-1 outline-transparent hover:outline-violet/70 focus:outline-violet focus:outline-2 focus:outline-solid`,
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: false,
    onFocus: () => (focused.current = true),
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      focused.current = false
      const next = e.currentTarget.innerText.replace(/ /g, ' ').trim()
      if (next !== value) onChange(next)
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault()
        e.currentTarget.blur()
      }
    },
    onClick: (e: React.MouseEvent) => e.preventDefault(),
  })
}

/** Botón de "Cambiar imagen" que se superpone a una imagen en /admin. */
export function ImageSwap({ onChange, label = 'Cambiar imagen' }: { onChange?: (url: string) => void; label?: string }) {
  const { edit, uploadImage } = useEdit()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  if (!edit || !onChange || !uploadImage) return null
  return (
    <label
      className="absolute inset-x-3 bottom-3 z-20 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-violet/60 bg-ink/85 px-3 py-2 font-mono text-[11px] tracking-widest text-snow uppercase backdrop-blur hover:bg-plum"
      onClick={(e) => e.stopPropagation()}
    >
      {busy ? 'Subiendo…' : err || label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          setBusy(true)
          setErr('')
          try {
            onChange(await uploadImage(f))
          } catch (x) {
            setErr(x instanceof Error ? x.message : 'Error al subir')
          } finally {
            setBusy(false)
          }
        }}
      />
    </label>
  )
}

/** Botón de "Cambiar video" (sube directo navegador → Cloudinary). */
export function VideoSwap({ onChange }: { onChange?: (url: string) => void }) {
  const { edit, uploadVideo } = useEdit()
  const [progress, setProgress] = useState<number | null>(null)
  const [err, setErr] = useState('')
  if (!edit || !onChange || !uploadVideo) return null
  return (
    <label className="absolute inset-x-3 top-3 z-20 flex cursor-pointer items-center justify-center rounded-md border border-violet/60 bg-ink/85 px-3 py-2 font-mono text-[11px] tracking-widest text-snow uppercase backdrop-blur hover:bg-plum">
      {progress !== null ? `Subiendo ${progress}%` : err || 'Cambiar video'}
      <input
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        disabled={progress !== null}
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          setErr('')
          setProgress(0)
          try {
            onChange(await uploadVideo(f, setProgress))
          } catch (x) {
            setErr(x instanceof Error ? x.message : 'Error al subir')
          } finally {
            setProgress(null)
          }
        }}
      />
    </label>
  )
}

/** Campo pequeño para datos que no son texto visible (links, precios, colores). */
export function AdminField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string | number
  onChange?: (v: string) => void
  type?: 'text' | 'number' | 'color' | 'url'
}) {
  const { edit } = useEdit()
  if (!edit || !onChange) return null
  return (
    <label className="flex items-center gap-2 rounded border border-violet/40 bg-ink/90 px-2 py-1 font-mono text-[10px] tracking-wider text-lilac uppercase">
      {label}
      <input
        type={type}
        defaultValue={value}
        onBlur={(e) => e.target.value !== String(value) && onChange(e.target.value)}
        className={`min-w-0 flex-1 bg-transparent text-[12px] normal-case text-snow outline-none ${type === 'color' ? 'h-5 w-8 flex-none' : ''}`}
      />
    </label>
  )
}
