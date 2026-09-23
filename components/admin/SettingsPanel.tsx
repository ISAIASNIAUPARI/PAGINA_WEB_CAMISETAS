'use client'

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { normalizeChatNotifications, type ChatNotification, type SiteSettings } from '@/lib/types'

import { useState } from 'react'

import { useEdit } from './EditProvider'

/**
 * Configuración del sitio: ajustes que no pertenecen a ninguna sección.
 *
 * Los cambios entran en el mismo flujo que el resto del contenido (se marcan
 * como pendientes y se publican con el botón "Guardar" de la barra), así que
 * no hace falta ningún endpoint propio.
 */
const MAX_MESSAGES = 10
const MIN_SEC = 2
const MAX_SEC = 35
const DEFAULT_SEC = 4

type RowProps = {
  index: number
  message: ChatNotification
  total: number
  onTextChange: (value: string) => void
  onToggle: () => void
  onDelete: () => void
}

/**
 * El contenido de una fila, sin nada de arrastre. Se pinta en dos sitios: en
 * el listado y, mientras se arrastra, dentro del <DragOverlay>.
 */
function MessageRowBody({
  message,
  index,
  total,
  onTextChange,
  onToggle,
  onDelete,
  dragHandle,
  flashing,
}: RowProps & { dragHandle?: React.ReactNode; flashing?: boolean }) {
  return (
    <>
      {flashing && <div className="pointer-events-none absolute inset-0 animate-section-flash" />}
      {dragHandle ?? <span className="select-none px-1 text-admin-ink/40">⠿</span>}
      <input
        type="text"
        value={message.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Mensaje ${index + 1}`}
        className={`w-full rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink ${
          message.enabled ? '' : 'bg-admin-bg text-admin-ink/40 line-through'
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        title={message.enabled ? 'Desactivar (no aparece en la web)' : 'Activar'}
        className="rounded px-1 text-admin-ink/70 hover:bg-admin-bg"
      >
        {message.enabled ? '👁' : '🚫'}
      </button>
      {total > 1 && (
        <button
          type="button"
          onClick={onDelete}
          title="Quitar este mensaje"
          className="rounded px-2 py-1 text-admin-ink/50 hover:bg-admin-bg hover:text-admin-danger"
        >
          ×
        </button>
      )}
    </>
  )
}

/**
 * Una fila del listado de avisos. Mismo patrón de arrastre que
 * LayoutPanel: asa a la izquierda, eje vertical y sin salir del contenedor.
 *
 * El id de arrastre es la POSICIÓN (`msg-0`, `msg-1`…) y no un id propio del
 * mensaje: estos avisos no llevan estilos ni nada indexado por su identidad,
 * así que la posición basta y el JSON se queda con la forma que el cliente
 * ve. Va prefijado porque dnd-kit trata un id `0` como ausente.
 *
 * Mientras se arrastra, la fila se queda quieta y atenuada marcando el hueco
 * — quien sigue al cursor es la copia del <DragOverlay>. Sin overlay la fila
 * original SÍ se movía, pero la pintaban encima las filas siguientes (es un
 * hermano anterior y no tiene fondo propio), así que desaparecía a mitad del
 * arrastre y el cursor no arrastraba nada visible.
 */
function SortableMessageRow({ dragId, flashing, ...props }: RowProps & { dragId: string; flashing?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : undefined }}
      className="relative mb-2 flex items-center gap-2 overflow-hidden rounded-md"
    >
      <MessageRowBody
        {...props}
        flashing={flashing}
        dragHandle={
          <span
            {...attributes}
            {...listeners}
            title="Arrastrar para reordenar"
            className="cursor-grab select-none px-1 text-admin-ink/40 active:cursor-grabbing"
          >
            ⠿
          </span>
        }
      />
    </div>
  )
}

/** Listado de avisos (hasta 10) con arrastre para reordenar y 👁 para apagar. */
function NotificationsEditor({ value, onChange }: { value: (string | ChatNotification)[]; onChange: (next: ChatNotification[]) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const [dragging, setDragging] = useState<string | null>(null)
  const [landed, setLanded] = useState<string | null>(null)
  const stored = normalizeChatNotifications(value)
  const messages: ChatNotification[] = stored.length ? stored : [{ text: '', enabled: true }]

  function flashLanded(dragId: string) {
    setLanded(dragId)
    setTimeout(() => setLanded((cur) => (cur === dragId ? null : cur)), 2000)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragStart={({ active }) => setDragging(String(active.id))}
        onDragCancel={() => setDragging(null)}
        onDragEnd={({ active, over }) => {
          setDragging(null)
          if (!over || active.id === over.id) return
          const from = messages.findIndex((_, i) => `msg-${i}` === active.id)
          const to = messages.findIndex((_, i) => `msg-${i}` === over.id)
          if (from === -1 || to === -1) return
          onChange(arrayMove(messages, from, to))
          flashLanded(`msg-${to}`)
        }}
      >
        <SortableContext items={messages.map((_, i) => `msg-${i}`)} strategy={verticalListSortingStrategy}>
          {messages.map((m, i) => (
            <SortableMessageRow
              key={`msg-${i}`}
              dragId={`msg-${i}`}
              flashing={landed === `msg-${i}`}
              index={i}
              message={m}
              total={messages.length}
              onTextChange={(v) => onChange(messages.map((q, j) => (j === i ? { ...q, text: v } : q)))}
              onToggle={() => onChange(messages.map((q, j) => (j === i ? { ...q, enabled: !q.enabled } : q)))}
              onDelete={() => onChange(messages.filter((_, j) => j !== i))}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {dragging ? (
            <div className="flex items-center gap-2 rounded-md border border-admin-accent bg-admin-accent/35 shadow-lg" data-drag-overlay>
              <MessageRowBody
                index={messages.findIndex((_, i) => `msg-${i}` === dragging)}
                message={messages[messages.findIndex((_, i) => `msg-${i}` === dragging)] ?? { text: '', enabled: true }}
                total={messages.length}
                onTextChange={() => {}}
                onToggle={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {messages.length < MAX_MESSAGES && (
        <button
          type="button"
          onClick={() => onChange([...messages, { text: '', enabled: true }])}
          className="rounded-md border border-dashed border-admin-line px-3 py-1.5 text-sm text-admin-ink hover:bg-admin-bg"
        >
          + Añadir mensaje
        </button>
      )}
    </>
  )
}

function IntervalInput({ id, value, onChange }: { id: string; value?: number; onChange: (n: number) => void }) {
  return (
    <input
      id={id}
      type="number"
      min={MIN_SEC}
      max={MAX_SEC}
      value={value ?? DEFAULT_SEC}
      // El mínimo se aplica al soltar: hacerlo al teclear impide escribir "12".
      onChange={(e) => onChange(Math.min(Number(e.target.value), MAX_SEC))}
      onBlur={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? Math.min(Math.max(Math.round(n), MIN_SEC), MAX_SEC) : DEFAULT_SEC)
      }}
      className="w-24 rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink"
    />
  )
}

const inputCls = 'w-full rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink'
const labelCls = 'mt-4 mb-1 block text-sm font-medium text-admin-ink'

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { data, update } = useEdit()
  const settings = data.siteSettings as SiteSettings
  const [tab, setTab] = useState<'whatsapp' | 'chat' | 'tienda'>('whatsapp')

  function patch(next: Partial<SiteSettings>) {
    update('siteSettings', { ...settings, ...next })
  }

  const unsafeWa = /^\s*(javascript:|data:)/i.test(settings.whatsappLink ?? '')

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-none items-center justify-between border-b border-admin-line px-4 py-3">
          <h3 className="text-sm font-semibold text-admin-ink">⚙️ Configuración</h3>
          <button type="button" onClick={onClose} className="rounded px-2 text-admin-ink/60 hover:bg-admin-bg">
            ×
          </button>
        </div>
        <div className="flex flex-none gap-1 border-b border-admin-line px-3 pt-2">
          {(
            [
              ['whatsapp', 'Botón WhatsApp'],
              ['chat', 'Asistente (chat)'],
              ['tienda', 'Tienda'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-t-md px-3 py-1.5 text-sm ${tab === k ? 'bg-admin-primary text-white' : 'text-admin-ink hover:bg-admin-bg'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {tab === 'whatsapp' && (
            <>
              <label className="flex items-center gap-2 text-sm text-admin-ink">
                <input type="checkbox" checked={!!settings.whatsappEnabled} onChange={(e) => patch({ whatsappEnabled: e.target.checked })} />
                Mostrar el botón de WhatsApp en la web
              </label>
              <label className={labelCls} htmlFor="wa-link">
                Enlace de redirección de WhatsApp
              </label>
              <input
                id="wa-link"
                type="url"
                value={settings.whatsappLink ?? ''}
                onChange={(e) => patch({ whatsappLink: e.target.value.trim() })}
                placeholder="https://wa.me/593999999999 o https://wa.link/…"
                spellCheck={false}
                className={`${inputCls} font-mono text-xs`}
              />
              <p className={`mt-2 text-xs leading-snug ${unsafeWa ? 'text-admin-danger' : 'text-admin-ink/60'}`}>
                {unsafeWa
                  ? 'Ese enlace no está permitido.'
                  : 'A dónde lleva el botón verde flotante, el formulario de contacto y "Pedir por WhatsApp" del carrito. Para un número: https://wa.me/ + número con código de país, sin + ni espacios.'}
              </p>

              <h4 className="mt-5 text-sm font-semibold text-admin-ink">Mensajes de la burbuja</h4>
              <p className="mb-2 text-xs leading-snug text-admin-ink/60">
                Aparecen junto al botón, uno por uno. Arrastra ⠿ para cambiar el orden; 👁 desactiva un mensaje sin borrarlo.
              </p>
              <NotificationsEditor value={settings.whatsappNotifications ?? []} onChange={(next) => patch({ whatsappNotifications: next })} />
              <label className={labelCls} htmlFor="wa-interval">
                Segundos visible cada mensaje
              </label>
              <IntervalInput id="wa-interval" value={settings.whatsappIntervalSec} onChange={(n) => patch({ whatsappIntervalSec: n })} />
            </>
          )}

          {tab === 'chat' && (
            <>
              <label className="mb-1 block text-sm font-medium text-admin-ink" htmlFor="n8n-webhook">
                URL del agente de chat (N8N)
              </label>
              <input
                id="n8n-webhook"
                type="url"
                value={settings.chatWebhookUrl ?? ''}
                onChange={(e) => patch({ chatWebhookUrl: e.target.value })}
                placeholder="https://…/webhook/…"
                spellCheck={false}
                className={`${inputCls} font-mono text-xs`}
              />
              <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-900">
                Cambiar esta URL desconecta el chat hasta que la nueva URL de N8N esté activa.
              </p>
              <p className="mt-2 text-xs leading-snug text-admin-ink/60">Si se deja vacía, el asistente no aparece en la web — tampoco su botón flotante.</p>
              <label className="mt-4 flex items-center gap-2 text-sm text-admin-ink">
                <input type="checkbox" checked={!!settings.chatButtonEnabled} onChange={(e) => patch({ chatButtonEnabled: e.target.checked })} />
                Mostrar el asistente en la web
              </label>
              <label className={labelCls} htmlFor="chat-title">
                Nombre del asistente
              </label>
              <input id="chat-title" value={settings.chatTitle ?? ''} onChange={(e) => patch({ chatTitle: e.target.value })} className={inputCls} />
              <label className={labelCls} htmlFor="chat-welcome">
                Mensaje de bienvenida
              </label>
              <textarea id="chat-welcome" rows={3} value={settings.chatWelcome ?? ''} onChange={(e) => patch({ chatWelcome: e.target.value })} className={inputCls} />
              <label className={labelCls} htmlFor="chat-ph">
                Texto de la caja de escribir
              </label>
              <input id="chat-ph" value={settings.chatPlaceholder ?? ''} onChange={(e) => patch({ chatPlaceholder: e.target.value })} className={inputCls} />
            </>
          )}

          {tab === 'tienda' && (
            <>
              <label className="mb-1 block text-sm font-medium text-admin-ink" htmlFor="brand">
                Nombre de la marca
              </label>
              <input id="brand" value={settings.brand} onChange={(e) => patch({ brand: e.target.value })} className={inputCls} />
              <label className={labelCls} htmlFor="free-from">
                Envío gratis desde (USD)
              </label>
              <input id="free-from" type="number" min={0} value={settings.freeShippingFrom} onChange={(e) => patch({ freeShippingFrom: Number(e.target.value) || 0 })} className="w-28 rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink" />
              <label className={labelCls} htmlFor="ship-cost">
                Costo de envío por debajo de ese monto (USD)
              </label>
              <input id="ship-cost" type="number" min={0} value={settings.shippingCost} onChange={(e) => patch({ shippingCost: Number(e.target.value) || 0 })} className="w-28 rounded-md border border-admin-line px-3 py-2 text-sm text-admin-ink" />
            </>
          )}
        </div>

        <div className="flex flex-none items-center justify-between gap-3 border-t border-admin-line px-4 py-2.5">
          <p className="text-xs leading-snug text-admin-ink/50">Los cambios se publican con «Guardar».</p>
          <button type="button" onClick={onClose} className="flex-none rounded-md border border-admin-line px-3 py-1.5 text-sm hover:bg-admin-bg">
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
