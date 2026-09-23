'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.ok) {
      window.location.href = '/admin'
      return
    }
    setError(json.error || 'No se pudo entrar.')
    setBusy(false)
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 [background:radial-gradient(900px_600px_at_50%_0%,rgba(75,19,102,.35),transparent_60%),#050505]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-line bg-ink-2 p-8">
        <p className="mb-2 text-sm font-medium tracking-[.42em] text-snow">LAMS STUDIO</p>
        <h1 className="mb-6 font-mono text-[11px] tracking-[.22em] text-mute uppercase">Panel de edición</h1>
        <label className="mb-2 block text-[11px] tracking-[.08em] text-mute uppercase" htmlFor="pw">
          Contraseña
        </label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-line bg-ink px-3.5 py-3 text-sm text-fog outline-none focus:border-violet"
        />
        {error && <p className="mb-4 text-sm text-[#ff8a8a]">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded bg-fog py-3 font-mono text-[11px] tracking-[.18em] text-ink uppercase transition-colors hover:bg-violet disabled:opacity-50"
        >
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
