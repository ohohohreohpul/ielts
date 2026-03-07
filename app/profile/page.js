'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import BottomNav from '@/components/BottomNav'
import {
  Flame, Star, Trophy, Crown, LogOut, ChevronRight,
  Bell, Shield, HelpCircle, Sparkles, Award, Target, BookOpen
} from 'lucide-react'

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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/welcome')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  )

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const menuItems = [
    { icon: Bell, label: 'การแจ้งเตือน', sublabel: 'เปิดการแจ้งเตือนรายวัน', action: () => {} },
    { icon: Crown, label: 'Mydemy Plus', sublabel: 'อัพเกรดเพื่อฟีเจอร์พิเศษ', action: () => {}, highlight: true },
    { icon: Shield, label: 'ความเป็นส่วนตัว', sublabel: 'จัดการข้อมูลของคุณ', action: () => {} },
    { icon: HelpCircle, label: 'ช่วยเหลือ', sublabel: 'คำถามที่พบบ่อย', action: () => {} },
  ]

  const badges = [
    { emoji: '🔥', label: 'Streak 7', unlocked: true },
    { emoji: '⭐', label: 'XP 100', unlocked: true },
    { emoji: '📚', label: 'TOEIC', unlocked: true },
    { emoji: '🎯', label: 'Perfect', unlocked: false },
    { emoji: '💎', label: 'IELTS', unlocked: false },
    { emoji: '🚀', label: 'Speed', unlocked: false },
    { emoji: '👑', label: 'Master', unlocked: false },
    { emoji: '🌟', label: 'Legend', unlocked: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Hero Header */}
      <div className="pt-16 pb-28 px-6 text-white text-center relative overflow-hidden">
        {/* decorative circles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/10" style={{
            width: [120, 80, 60, 40, 100, 50][i],
            height: [120, 80, 60, 40, 100, 50][i],
            top: ['10%', '60%', '-10%', '80%', '30%', '70%'][i],
            left: ['-5%', '85%', '70%', '-5%', '50%', '40%'][i],
          }} />
        ))}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="relative z-10">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/50 shadow-2xl">
            <AvatarFallback className="text-3xl font-bold bg-white/20 text-white">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-1">{user?.name || 'ผู้ใช้'}</h1>
          <p className="text-white/80 text-sm">{user?.email}</p>
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mt-3 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Free Plan</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Card - overlapping hero */}
      <div className="px-4 -mt-16 mb-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="p-5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">7</span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">วัน Streak</div>
                </div>
                <div className="p-5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-600">350</span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">XP รวม</div>
                </div>
                <div className="p-5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">12</span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">บทเรียน</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">🏅 เหรียญรางวัล</h2>
        <div className="grid grid-cols-4 gap-3">
          {badges.map((badge, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.04 }}>
              <Card className={`border ${badge.unlocked ? 'from-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-3 text-center">
                  <div className={`text-2xl mb-1 ${!badge.unlocked ? 'grayscale opacity-30' : ''}`}>{badge.emoji}</div>
                  <div className="text-xs font-medium text-gray-500 truncate">{badge.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">⚙️ ตั้งค่า</h2>
        <Card className="shadow-sm border-0 overflow-hidden rounded-2xl">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 active:opacity-70 transition-opacity ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''} ${item.highlight ? 'from-amber-50 ' : 'bg-white'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.highlight ? 'from-yellow-400 ' : 'bg-gray-100'}`}>
                <item.icon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${item.highlight ? 'text-orange-700' : 'text-gray-900'}`}>{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.sublabel}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </motion.button>
          ))}
        </Card>
      </div>

      {/* Logout */}
      <div className="px-4 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Button
            variant="outline"
            className="w-full h-12 text-red-500 border-red-200 hover:bg-red-50 rounded-xl font-semibold"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
