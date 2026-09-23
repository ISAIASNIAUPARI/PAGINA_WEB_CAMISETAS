'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { EditContext } from '@/components/editable/Editable'
import { Site } from '@/components/site/Site'
import type { Content, SectionId } from '@/lib/types'
import { uploadDirectToCloudinary } from '@/lib/upload-direct'

/** Comprime en el navegador antes de subir (máx 1600px, WebP 0.82) — error #7 del protocolo. */
async function compressImage(file: File, maxW = 1600): Promise<File> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxW / bmp.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.82))
  if (!blob) return file
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
}

async function uploadImage(file: File) {
  const small = await compressImage(file)
  const form = new FormData()
  form.append('file', small)
  const res = await fetch('/api/admin/upload-image', { method: 'POST', body: form })
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string }
  if (!res.ok || !json.ok || !json.url) throw new Error(json.error || 'No se pudo subir la imagen.')
  return json.url
}

type Status = { kind: 'idle' | 'saving' | 'ok' | 'error'; msg?: string }

export function AdminApp({ initial }: { initial: Content }) {
  const [content, setContent] = useState<Content>(initial)
  const [dirty, setDirty] = useState<Set<SectionId>>(new Set())
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const onChange = useCallback(<K extends SectionId>(id: K, data: Content[K]) => {
    setContent((c) => ({ ...c, [id]: data }))
    setDirty((d) => new Set(d).add(id))
    setStatus({ kind: 'idle' })
  }, [])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.size) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = async () => {
    if (!dirty.size) return
    setStatus({ kind: 'saving' })
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: [...dirty].map((id) => ({ sectionId: id, data: content[id] })) }),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'No se pudo guardar.')
      setDirty(new Set())
      setStatus({ kind: 'ok', msg: 'Guardado. La web se actualiza en ~1 minuto.' })
    } catch (e) {
      setStatus({ kind: 'error', msg: e instanceof Error ? e.message : 'Error al guardar.' })
    }
  }

  const api = useMemo(
    () => ({
      edit: true,
      uploadImage,
      uploadVideo: (file: File, onProgress: (p: number) => void) => uploadDirectToCloudinary(file, 'video', onProgress),
    }),
    []
  )

  let statusNode: React.ReactNode = dirty.size ? `${dirty.size} ${dirty.size === 1 ? 'sección cambiada' : 'secciones cambiadas'}` : 'Sin cambios'
  if (status.kind === 'saving') statusNode = 'Guardando…'
  if (status.kind === 'error') statusNode = <span className="text-[#ff8a8a]">{status.msg}</span>
  if (status.kind === 'ok') statusNode = <span className="text-[#6fe0a0]">{status.msg}</span>

  return (
    <EditContext.Provider value={api}>
      <div className="fixed inset-x-0 top-0 z-[400] flex h-12 items-center gap-3 border-b border-violet/40 bg-[#120818] px-4 text-[12px] text-fog">
        <span className="font-mono tracking-[.2em] text-lilac uppercase">Admin</span>
        <span className="hidden text-mute lg:inline">Clic en un texto para editarlo · &quot;Cambiar imagen/video&quot; sobre cada medio</span>
        <span className="ml-auto truncate text-mute">{statusNode}</span>
        <button
          type="button"
          onClick={save}
          disabled={!dirty.size || status.kind === 'saving'}
          className="rounded bg-violet px-4 py-1.5 font-mono text-[11px] tracking-[.12em] text-ink uppercase disabled:opacity-40"
        >
          Guardar
        </button>
        <a href="/" target="_blank" className="hidden text-mute underline sm:inline">
          Ver web
        </a>
        <a href="/api/admin/logout" className="text-mute underline">
          Salir
        </a>
      </div>
      <div className="pt-12">
        <Site content={content} onChange={onChange} />
      </div>
    </EditContext.Provider>
  )
}
