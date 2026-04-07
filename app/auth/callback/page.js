'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader as Loader2 } from 'lucide-react'

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallbackPage() {
  const router = useRouter()
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return
    hasProcessed.current = true

    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const hash = window.location.hash

        const code = urlParams.get('code')
        const sessionIdMatch = hash.match(/session_id=([^&]+)/)

        if (code) {
          const redirectUri = `${window.location.origin}/auth/callback`

          const response = await fetch('/api/auth/google/custom-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri })
          })

          if (!response.ok) {
            throw new Error('Custom OAuth callback failed')
          }

          const data = await response.json()

          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('session_token', data.session_token)

          router.push('/dashboard')
        } else if (sessionIdMatch) {
          const sessionId = sessionIdMatch[1]

          const response = await fetch('/api/auth/google-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })

          if (!response.ok) {
            throw new Error('Emergent Auth callback failed')
          }

          const data = await response.json()

          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('session_token', data.session_token)

          router.push('/dashboard')
        } else {
          console.error('No auth code or session_id in URL')
          router.push('/welcome')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/welcome')
      }
    }

    processCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1B3F7A] mx-auto mb-4" />
        <p className="text-gray-600">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  )
}
