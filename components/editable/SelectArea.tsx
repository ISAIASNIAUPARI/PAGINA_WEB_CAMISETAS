'use client'

import React, { useEffect, useId, useSyncExternalStore } from 'react'

import { useEditOptional } from '@/components/admin/EditProvider'
import { useSelectionOptional } from '@/components/admin/Selection'

/**
 * Los controles del sidebar se guardan en el ref de Selection en el momento
 * del clic, así que una función capturada ahí quedaría con los datos VIEJOS:
 * el segundo cambio (p. ej. el texto después del link) pisaría el primero.
 * Por eso el sidebar no pinta una copia congelada: pinta <LiveControls>, que
 * lee siempre la última versión que publicó el elemento en su render.
 */
const renders = new Map<string, () => React.ReactNode>()
const listeners = new Set<() => void>()
let version = 0
function publish(id: string, render: () => React.ReactNode) {
  renders.set(id, render)
  version++
  listeners.forEach((l) => l())
}
function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function LiveControls({ id }: { id: string }) {
  useSyncExternalStore(subscribe, () => version, () => version)
  return <>{renders.get(id)?.()}</>
}

export function SelectArea({
  label,
  controls,
  children,
  className,
}: {
  label: string
  controls: () => React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const edit = !!useEditOptional()
  const selection = useSelectionOptional()
  const id = useId()
  const selected = selection?.selected?.id === id

  useEffect(() => {
    if (edit) publish(id, controls)
  })

  if (!edit || !selection) return <>{children}</>

  return (
    <div
      className={`admin-selectable ${selected ? 'admin-selected' : ''} ${className ?? ''}`}
      onClickCapture={(e) => {
        e.preventDefault()
        e.stopPropagation()
        publish(id, controls)
        selection.select({ id, kind: 'media', label }, { renderControls: () => <LiveControls id={id} /> })
      }}
    >
      {children}
    </div>
  )
}

/* ── Controles de formulario para el sidebar oscuro ── */

export function SideField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: 'text' | 'url' | 'number' | 'color'
  placeholder?: string
  hint?: string
}) {
  return (
    <label className="mb-3 block">
      <span className="admin-sidebar-sublabel">{label}</span>
      <div className="mt-1.5 flex items-center gap-2">
        {type === 'color' && (
          <input type="color" value={String(value)} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent" />
        )}
        <input
          type={type === 'color' ? 'text' : type}
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className="admin-sidebar-input"
        />
      </div>
      {hint && <span className="mt-1 block text-[11px] leading-snug text-white/45">{hint}</span>}
    </label>
  )
}

export function SideButton({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="admin-sidebar-step mb-2 w-full"
      style={{ padding: '8px 10px', ...(danger ? { borderColor: 'rgba(255,90,90,.5)', color: '#ff9b9b' } : null) }}
    >
      {children}
    </button>
  )
}
