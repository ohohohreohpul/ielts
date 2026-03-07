'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, Star, BookOpen, ChevronRight, Bell, Crown, Shield, HelpCircle, LogOut } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/welcome'); return }
    try { setUser(JSON.parse(userData)) } catch {}
    setLoading(false)
  }, [])

  const handleLogout = () => {
    if (!confirm('ต้องการออกจากระบบ?')) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/welcome')
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const badges = [
    { emoji: '🔥', label: 'Streak 7', ok: true },
    { emoji: '⭐', label: 'XP 100',   ok: true },
    { emoji: '📚', label: 'TOEIC',    ok: true },
    { emoji: '🎯', label: 'Perfect',  ok: false },
    { emoji: '💎', label: 'IELTS',    ok: false },
    { emoji: '🚀', label: 'Speed',    ok: false },
    { emoji: '👑', label: 'Master',   ok: false },
    { emoji: '🌟', label: 'Legend',   ok: false },
  ]

  const menu = [
    { icon: Bell,        label: 'การแจ้งเตือน',     sub: 'เปิดการแจ้งเตือนรายวัน',       orange: false },
    { icon: Crown,       label: 'Mydemy Plus',       sub: 'หัวใจไม่จำกัด + AI Scoring',    orange: true  },
    { icon: Shield,      label: 'ความเป็นส่วนตัว',  sub: 'จัดการข้อมูลของคุณ',            orange: false },
    { icon: HelpCircle,  label: 'ช่วยเหลือ',        sub: 'คำถามที่พบบ่อย',                orange: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-40">

      {/* Orange Header + Avatar */}
      <div className="bg-orange-500 pt-14 pb-20 px-5 text-center relative">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <div className="w-22 h-22 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ width: 88, height: 88 }}>
            <span className="text-3xl font-black text-orange-500">{initials}</span>
          </div>
          <h1 className="text-xl font-black text-white">{user?.name || 'นักเรียน'}</h1>
          <p className="text-white/70 text-sm mt-1">{user?.email}</p>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full mt-3">
            <span className="text-white text-sm font-bold">Free Plan</span>
          </div>
        </motion.div>
      </div>

      <div className="px-4 -mt-8 space-y-4">

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { icon: Flame, val: '7',   label: 'วัน Streak', color: 'text-orange-500' },
                { icon: Star,  val: '350', label: 'XP รวม',     color: 'text-yellow-500' },
                { icon: BookOpen, val: '12', label: 'บทเรียน',  color: 'text-gray-700' },
              ].map(({ icon: Icon, val, label, color }, i) => (
                <div key={i} className="py-5 text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <p className="text-xl font-black text-gray-900">{val}</p>
                  <p className="text-xs text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="font-black text-gray-900 mb-3">🏅 เหรียญรางวัล</p>
          <div className="grid grid-cols-4 gap-2.5">
            {badges.map((b, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border p-3 text-center ${b.ok ? 'border-orange-100' : 'border-gray-100'}`}
              >
                <p className={`text-2xl mb-1 ${!b.ok ? 'grayscale opacity-30' : ''}`}>{b.emoji}</p>
                <p className={`text-xs font-semibold ${b.ok ? 'text-gray-700' : 'text-gray-300'}`}>{b.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="font-black text-gray-900 mb-3">⚙️ ตั้งค่า</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {menu.map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors ${i < menu.length - 1 ? 'border-b border-gray-50' : ''} ${item.orange ? 'bg-orange-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.orange ? 'bg-orange-500' : 'bg-gray-100'}`}>
                  <item.icon className={`w-5 h-5 ${item.orange ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold ${item.orange ? 'text-orange-600' : 'text-gray-900'}`}>{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-12 bg-white border-2 border-red-100 rounded-2xl text-red-500 font-bold active:opacity-70 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </motion.div>

      </div>
      <BottomNav />
    </div>
  )
}
