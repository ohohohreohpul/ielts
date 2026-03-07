'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import BottomNav from '@/components/BottomNav'
import {
  Flame, Star, Trophy, BookOpen, Headphones, PenTool, Mic, TrendingUp, CheckCircle2
} from 'lucide-react'

export default function ProgressPage() {
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  )

  const weekDays = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const weekActivity = [3, 5, 2, 0, 4, 6, 1]
  const maxActivity = Math.max(...weekActivity)

  const skills = [
    { icon: BookOpen, label: 'การอ่าน', sublabel: 'Reading', color: '#3b82f6', progress: 72, xp: 180, sessions: 8 },
    { icon: Headphones, label: 'การฟัง', sublabel: 'Listening', color: '#8b5cf6', progress: 58, xp: 145, sessions: 6 },
    { icon: PenTool, label: 'การเขียน', sublabel: 'Writing', color: '#FF6500', progress: 45, xp: 112, sessions: 4 },
    { icon: Mic, label: 'การพูด', sublabel: 'Speaking', color: '#f59e0b', progress: 30, xp: 75, sessions: 2 },
  ]

  const history = [
    { exam: 'TOEIC Reading', date: 'วันนี้', score: 85, questions: 5, xp: 50, correct: 4 },
    { exam: 'IELTS Listening', date: 'เมื่อวาน', score: 70, questions: 5, xp: 40, correct: 3 },
    { exam: 'TOEIC Reading', date: '2 วันก่อน', score: 90, questions: 5, xp: 55, correct: 5 },
    { exam: 'IELTS Writing', date: '3 วันก่อน', score: 75, questions: 3, xp: 45, correct: 2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="from-violet-600 pt-16 pb-8 px-5 text-white">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/70 text-sm font-medium mb-1">สถิติของคุณ</p>
          <h1 className="text-2xl font-bold">ความก้าวหน้า</h1>
        </motion.div>
      </div>

      <div className="px-4 -mt-0 pt-5 space-y-5">

        {/* Top 3 Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame, label: 'วัน Streak', value: '7', color: '#f97316', bg: 'bg-orange-50' },
              { icon: Star, label: 'XP รวม', value: '350', color: '#eab308', bg: 'bg-yellow-50' },
              { icon: Trophy, label: 'บทเรียน', value: '12', color: '#7c3aed', bg: 'bg-orange-500' },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className={`p-4 text-center ${stat.bg}`}>
                  <stat.icon className="w-6 h-6 mx-auto mb-1.5" style={{ color: stat.color }} />
                  <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900">กิจกรรมสัปดาห์นี้</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ทำไปแล้ว 21 ข้อ</p>
                </div>
                <div className="bg-orange-100 px-3 py-1 rounded-full">
                  <span className="text-orange-700 text-xs font-bold">+21 ข้อ</span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
                {weekDays.map((day, i) => {
                  const isToday = i === 6
                  const barH = maxActivity > 0 && weekActivity[i] > 0 ? Math.max((weekActivity[i] / maxActivity) * 72, 12) : 4
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex items-end justify-center" style={{ height: 72 }}>
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: barH }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                          className={`w-full rounded-t-xl ${isToday ? 'bg-orange-500 shadow-lg shadow-orange-200' : weekActivity[i] > 0 ? 'bg-orange-500' : 'bg-gray-100'}`}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${isToday ? 'text-orange-600' : 'text-gray-400'}`}>{day}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-bold text-gray-900 mb-3">ทักษะแต่ละด้าน</h3>
          <div className="space-y-3">
            {skills.map((skill, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}>
                <Card className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: skill.color + '20' }}>
                        <skill.icon className="w-5 h-5" style={{ color: skill.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-900 text-sm">{skill.label}</span>
                            <span className="text-gray-400 text-xs ml-1.5">{skill.sublabel}</span>
                          </div>
                          <span className="text-sm font-bold ml-2" style={{ color: skill.color }}>{skill.progress}%</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400">{skill.xp} XP</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{skill.sessions} เซสชัน</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progress}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: skill.color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-bold text-gray-900 mb-3">ประวัติการฝึก</h3>
          <div className="space-y-2.5">
            {history.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
                <Card className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.score >= 80 ? 'bg-orange-100' : item.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                          <CheckCircle2 className={`w-5 h-5 ${item.score >= 80 ? 'text-orange-500' : item.score >= 60 ? 'text-yellow-500' : 'text-red-400'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{item.exam}</div>
                          <div className="text-xs text-gray-400">{item.date} • {item.correct}/{item.questions} ข้อถูก</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-lg font-bold ${item.score >= 80 ? 'text-orange-600' : item.score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {item.score}%
                        </div>
                        <div className="text-xs text-gray-400">+{item.xp} XP</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
