'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Orange header */}
      <div className="bg-orange-500 pt-14 pb-20 px-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-1">เข้าสู่ระบบ</h1>
          <p className="text-white/70 font-medium">ยินดีต้อนรับกลับมา!</p>
        </motion.div>
      </div>

      {/* White card */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
          className="space-y-5"
        >
          {error && (
            <div className="bg-red-50 border-2 border-red-100 rounded-xl p-3 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">อีเมล</label>
            <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl h-14 px-4 bg-gray-50 focus-within:border-orange-400 transition-colors">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-base text-black placeholder-gray-400 outline-none font-medium"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">รหัสผ่าน</label>
            <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl h-14 px-4 bg-gray-50 focus-within:border-orange-400 transition-colors">
              <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-base text-black placeholder-gray-400 outline-none font-medium"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-orange-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'เข้าสู่ระบบ'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">หรือ</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="w-full h-14 bg-white text-black text-lg font-bold rounded-2xl border-2 border-gray-200 active:opacity-80 transition-opacity"
          >
            สร้างบัญชีใหม่
          </button>
        </motion.form>
      </div>
    </div>
  )
}
