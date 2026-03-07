'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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
        // Get session_id from URL hash
        const hash = window.location.hash
        const sessionIdMatch = hash.match(/session_id=([^&]+)/)
        
        if (!sessionIdMatch) {
          console.error('No session_id in URL')
          router.push('/welcome')
          return
        }

        const sessionId = sessionIdMatch[1]

        // Exchange session_id for user data via backend
        const response = await fetch('/api/auth/google-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) {
          throw new Error('Auth callback failed')
        }

        const data = await response.json()

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('session_token', data.session_token)

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/welcome')
      }
    }

    processCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  )
}
