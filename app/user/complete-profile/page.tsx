'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CompleteProfilePage() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') || '/user/home'

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to complete profile')
      }
      // After success, go back to the intended page
      router.replace(from)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-primary">
      <div className="w-full max-w-md bg-secondary/95 backdrop-blur-md border border-control-border rounded-2xl p-6 shadow-2xl">
        <h1 className="text-xl font-semibold text-text">Complete your profile</h1>
        <p className="mt-2 text-sm text-secondary-text">
          Please provide a display name to finish setting up your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              id="name"
              type="text"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="peer w-full h-12 px-3 rounded-lg border border-control-border bg-transparent text-text placeholder-transparent focus:border-text focus:outline-none"
            />
            <label
              htmlFor="name"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-text transition-all bg-secondary px-1
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-secondary-text peer-placeholder-shown:text-sm
                peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-text
                peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-text"
            >
              Display name
            </label>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-text text-primary font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </main>
  )
}
