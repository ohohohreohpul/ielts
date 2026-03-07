'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSignup = async (e) => {
    e.preventDefault()
    const { name, email, password, confirm } = form
    if (!name || !email || !password) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', icon: User, label: 'ชื่อ', placeholder: 'ชื่อของคุณ', type: 'text', autoComplete: 'name' },
    { key: 'email', icon: Mail, label: 'อีเมล', placeholder: 'your@email.com', type: 'email', autoComplete: 'email' },
    { key: 'password', icon: Lock, label: 'รหัสผ่าน', placeholder: 'อย่างน้อย 6 ตัวอักษร', type: 'password', autoComplete: 'new-password' },
    { key: 'confirm', icon: ShieldCheck, label: 'ยืนยันรหัสผ่าน', placeholder: 'พิมพ์รหัสผ่านอีกครั้ง', type: 'password', autoComplete: 'new-password' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-orange-500 pt-14 pb-20 px-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-1">สร้างบัญชีใหม่</h1>
          <p className="text-white/70 font-medium">เริ่มต้นฝึกสอบวันนี้ฟรี!</p>
        </motion.div>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-10">
        <motion.form
          onSubmit={handleSignup}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-50 border-2 border-red-100 rounded-xl p-3 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {fields.map(({ key, icon: Icon, label, placeholder, type, autoComplete }) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-bold text-black">{label}</label>
              <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl h-14 px-4 bg-gray-50 focus-within:border-orange-400 transition-colors">
                <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type={(key === 'password' || key === 'confirm') ? (showPass ? 'text' : 'password') : type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className="flex-1 bg-transparent text-base text-black placeholder-gray-400 outline-none font-medium"
                />
                {key === 'password' && (
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-orange-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2 active:opacity-80 transition-opacity mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'สร้างบัญชี'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full text-center text-gray-500 font-medium py-2"
          >
            มีบัญชีแล้ว? <span className="text-orange-500 font-bold">เข้าสู่ระบบ</span>
          </button>
        </motion.form>
      </div>
    </div>
  )
}
