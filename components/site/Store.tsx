'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type CartItem = { key: string; name: string; detail: string; price: number; image: string; qty: number }

type StoreApi = {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: Omit<CartItem, 'qty'>) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
  toast: (msg: string) => void
  /** Cambia en cada "añadir": dispara la animación del contador del carrito. */
  bumpKey: number
}

const StoreContext = createContext<StoreApi | null>(null)
const STORAGE = 'lams-cart-v2'

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore fuera de <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const [bumpKey, setBumpKey] = useState(0)
  const loaded = useRef(false)
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    loaded.current = true
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    try {
      window.localStorage.setItem(STORAGE, JSON.stringify(items))
    } catch {}
  }, [items])

  const toast = useCallback((msg: string) => {
    clearTimeout(toastT.current)
    setToastMsg(msg)
    setToastOn(true)
    toastT.current = setTimeout(() => setToastOn(false), 2600)
  }, [])

  const add = useCallback(
    (item: Omit<CartItem, 'qty'>) => {
      setItems((prev) => {
        const found = prev.find((i) => i.key === item.key)
        if (found) return prev.map((i) => (i.key === item.key ? { ...i, qty: i.qty + 1 } : i))
        return [...prev, { ...item, qty: 1 }]
      })
      setBumpKey((k) => k + 1)
      toast(`${item.name} añadida a la cesta`)
    },
    [toast]
  )

  const api = useMemo<StoreApi>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
      add,
      setQty: (key, qty) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i))),
      remove: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      clear: () => setItems([]),
      drawerOpen,
      setDrawerOpen,
      toast,
      bumpKey,
    }),
    [items, add, drawerOpen, toast, bumpKey]
  )

  return (
    <StoreContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-8 left-1/2 z-[300] -translate-x-1/2 rounded-full border border-line bg-ink-3/95 px-6 py-3 text-[13px] font-medium whitespace-nowrap text-fog shadow-2xl backdrop-blur transition-all duration-500 ease-(--ease-out-soft) ${
          toastOn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-violet align-middle" />
        {toastMsg}
      </div>
    </StoreContext.Provider>
  )
}

export const money = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`
