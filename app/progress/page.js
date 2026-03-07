'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, Star, Trophy, BookOpen, Headphones, PenTool, Mic, CheckCircle2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function ProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/welcome'); return }
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const weekDays = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const weekData  = [3,    5,   2,   0,    4,   6,   1  ]
  const maxVal    = Math.max(...weekData)

  const skills = [
    { icon: BookOpen,   label: 'Reading',   sub: 'การอ่าน',   pct: 72, xp: 180, barColor: '#FF6500' },
    { icon: Headphones, label: 'Listening',  sub: 'การฟัง',   pct: 58, xp: 145, barColor: '#1A1A1A' },
    { icon: PenTool,    label: 'Writing',    sub: 'การเขียน', pct: 45, xp: 112, barColor: '#FF6500' },
    { icon: Mic,        label: 'Speaking',   sub: 'การพูด',   pct: 30, xp:  75, barColor: '#1A1A1A' },
  ]

  const history = [
    { exam: 'TOEIC Reading',   date: 'วันนี้',     score: 85, correct: 4, total: 5, xp: 50 },
    { exam: 'IELTS Listening', date: 'เมื่อวาน',   score: 70, correct: 3, total: 5, xp: 40 },
    { exam: 'TOEIC Reading',   date: '2 วันก่อน', score: 90, correct: 5, total: 5, xp: 55 },
    { exam: 'IELTS Writing',   date: '3 วันก่อน', score: 75, correct: 2, total: 3, xp: 45 },
  ]

  const scoreColor = (s) => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="min-h-screen bg-gray-50 pb-40">

      {/* Header */}
      <div className="bg-orange-500 pt-14 pb-6 px-5">
        <h1 className="text-2xl font-black text-white">ความก้าวหน้า</h1>
        <p className="text-white/70 text-sm font-medium mt-1">ติดตามพัฒนาการของคุณ</p>
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* Top Stats */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { icon: Flame,   val: '7',   label: 'Streak',   color: 'text-orange-500' },
                { icon: Star,    val: '350', label: 'XP รวม',   color: 'text-yellow-500' },
                { icon: Trophy,  val: '12',  label: 'บทเรียน', color: 'text-gray-700'   },
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

        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-5">
              <p className="font-black text-gray-900">กิจกรรมสัปดาห์นี้</p>
              <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">+21 ข้อ</span>
            </div>
            <div className="flex items-end gap-2" style={{ height: 88 }}>
              {weekDays.map((day, i) => {
                const isToday = i === 6
                const barH = maxVal > 0 && weekData[i] > 0 ? Math.max((weekData[i] / maxVal) * 72, 8) : 4
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center" style={{ height: 72 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barH }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                        className="w-full rounded-t-lg"
                        style={{ backgroundColor: isToday ? '#FF6500' : weekData[i] > 0 ? '#FFD4B8' : '#F3F4F6' }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="font-black text-gray-900 mb-3">ทักษะแต่ละด้าน</p>
          <div className="space-y-2.5">
            {skills.map((sk, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sk.barColor + '15' }}>
                    <sk.icon className="w-5 h-5" style={{ color: sk.barColor }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-bold text-gray-900 text-sm">{sk.label} <span className="text-gray-400 font-medium text-xs">{sk.sub}</span></p>
                      <p className="font-black text-sm" style={{ color: sk.barColor }}>{sk.pct}%</p>
                    </div>
                    <p className="text-xs text-gray-400">{sk.xp} XP</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sk.pct}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: sk.barColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="font-black text-gray-900 mb-3">ประวัติการฝึก</p>
          <div className="space-y-2.5">
            {history.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: scoreColor(item.score) + '20' }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: scoreColor(item.score) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{item.exam}</p>
                  <p className="text-xs text-gray-400">{item.date} · {item.correct}/{item.total} ข้อถูก</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black" style={{ color: scoreColor(item.score) }}>{item.score}%</p>
                  <p className="text-xs text-gray-400">+{item.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
      <BottomNav />
    </div>
  )
}
