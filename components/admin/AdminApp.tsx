'use client'

import React from 'react'

import { Site, type DynamicData } from '@/components/site/Site'
import type { Content } from '@/lib/types'

import { useEdit } from './EditProvider'
import { EditorArea } from './EditorArea'
import { SelectionProvider } from './Selection'
import { Toolbar } from './Toolbar'

function PositionBadge({ n }: { n: number }) {
  return (
    <span className="pointer-events-none absolute top-2 left-2 z-[60] flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-medium text-white">
      {n}
    </span>
  )
}

/**
 * El sitio real montado en modo edición: mismo árbol de componentes que la
 * web pública, con el orden/visibilidad de "Organizar página" y las secciones
 * creadas desde plantilla.
 */
export function AdminApp() {
  const { data, update, layout, viewMode } = useEdit()

  const content = { ...(data as unknown as Content), pageLayout: layout }
  const dynamic: DynamicData = {}
  for (const s of layout.sections) {
    if (s.type && data[s.id] !== undefined) dynamic[s.id] = { type: s.type, data: data[s.id] }
  }

  return (
    <SelectionProvider>
      <div className="admin-editor-root">
        <Toolbar />
        <EditorArea mobileFrame={viewMode === 'mobile'}>
          <Site
            content={content}
            dynamic={dynamic}
            chatEnabled={false}
            onChange={(id, next) => update(id, next)}
            renderWrapper={(id, i, node) => {
              const entry = layout.sections.find((s) => s.id === id)
              return (
                <div className={`relative ${entry?.visible ? '' : 'opacity-60'}`}>
                  <PositionBadge n={i + 1} />
                  {!entry?.visible && (
                    <div className="relative z-20 bg-yellow-100 px-4 py-1 text-center text-xs text-yellow-800">Sección oculta — no se muestra en el sitio público</div>
                  )}
                  {node}
                </div>
              )
            }}
          />
        </EditorArea>
      </div>
    </SelectionProvider>
  )
}
