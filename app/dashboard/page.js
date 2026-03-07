'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, Heart, Star, BookOpen, Headphones, PenTool, Mic, ArrowRight, Crown, ChevronRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/welcome'); return }
    // Load immediately from localStorage - no waiting
    try { setUser(JSON.parse(userData)) } catch {}
    setLoading(false)
    // Verify in background silently
    fetch('/api/auth/session', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setUser(data.user); localStorage.setItem('user', JSON.stringify(data.user)) })
      .catch(() => { localStorage.removeItem('token'); router.push('/welcome') })
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'อรุณสวัสดิ์ ☀️' : hour < 18 ? 'สวัสดีตอนบ่าย 🌤' : 'สวัสดีตอนเย็น 🌙'

  const quickStart = [
    { exam: 'toeic', section: 'reading',   icon: BookOpen,   label: 'TOEIC Reading',   sub: 'Part 5–7' },
    { exam: 'toeic', section: 'listening', icon: Headphones, label: 'TOEIC Listening',  sub: 'Part 1–4' },
    { exam: 'grammar', section: 'reading', icon: BookOpen,   label: 'Grammar Practice', sub: 'ไวยากรณ์' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 20px))' }}>

      {/* Orange Header */}
      <div className="bg-orange-500 pt-14 pb-16 px-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/80 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-2xl font-black text-white">{user?.name?.split(' ')[0] || 'นักเรียน'}</h1>
        </motion.div>
      </div>

      <div className="px-4 -mt-8 space-y-4">

        {/* Stats Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { icon: Flame,  val: user?.streak || 7,  label: 'Streak',  iconColor: 'text-orange-500' },
                { icon: Heart,  val: user?.hearts || 5,  label: 'หัวใจ',   iconColor: 'text-red-500'    },
                { icon: Star,   val: user?.totalXP || 350, label: 'XP',    iconColor: 'text-yellow-500' },
              ].map(({ icon: Icon, val, label, iconColor }, i) => (
                <div key={i} className="py-5 text-center">
                  <Icon className={`w-5 h-5 ${iconColor} mx-auto mb-1`} />
                  <p className="text-2xl font-black text-gray-900">{val}</p>
                  <p className="text-xs text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Weekly Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-gray-900">🎯 เป้าหมายวันนี้</p>
              <span className="text-orange-500 font-bold text-sm">3/5 ข้อ</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-3 bg-orange-500 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">อีก 2 ข้อถึงเป้าหมายวันนี้!</p>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex justify-between items-center mb-3">
            <p className="font-black text-gray-900 text-lg">เริ่มฝึกเลย</p>
            <button onClick={() => router.push('/practice')} className="text-orange-500 text-sm font-bold">ดูทั้งหมด</button>
          </div>
          <div className="space-y-2.5">
            {quickStart.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                onClick={() => router.push(`/?exam=${item.exam}&section=${item.section}`)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 active:opacity-70 transition-opacity"
              >
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Plus Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button className="w-full bg-black rounded-2xl p-5 flex items-center justify-between active:opacity-80 transition-opacity">
            <div className="text-left">
              <p className="text-white font-black text-base">Carrot School Plus 👑</p>
              <p className="text-gray-400 text-sm mt-0.5">ปลดล็อคข้อสอบทั้งหมด · หัวใจไม่จำกัด</p>
            </div>
            <div className="bg-orange-500 px-4 py-2 rounded-xl">
              <p className="text-white font-bold text-sm">อัพเกรด</p>
            </div>
          </button>
        </motion.div>

      </div>

      <BottomNav />
    </div>
  )
}
