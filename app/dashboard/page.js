'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Flame, Heart, Trophy, Target, Zap, ArrowRight, Award } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalXP: 0,
    averageScore: 0,
    weeklyGoal: 20,
    weeklyProgress: 12
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/welcome')
      return
    }

    try {
      const response = await fetch('/api/auth/session', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Session expired')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/welcome')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'สวัสดีตอนเช้า'
    if (hour < 18) return 'สวัสดีตอนบ่าย'
    return 'สวัสดีตอนเย็น'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-white/90">พร้อมฝึกสอบวันนี้หรือยัง?</p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">{user?.streak || 0}</span>
                  </div>
                  <p className="text-xs text-gray-600">วันติดต่อกัน</p>
                </div>

                <div className="text-center border-x border-gray-200">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="text-2xl font-bold text-red-500">{user?.hearts || 5}</span>
                  </div>
                  <p className="text-xs text-gray-600">หัวใจ</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-500">{user?.totalXP || 0}</span>
                  </div>
                  <p className="text-xs text-gray-600">XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">เรียนต่อจากที่ค้างไว้</h2>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/practice')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">TOEIC Reading</h3>
                    <p className="text-sm text-gray-600">Part 5 - Grammar</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">ความคืบหน้า</span>
                  <span className="font-semibold text-gray-900">3/10 ข้อ</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">เป้าหมายรายสัปดาห์</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900">ทำแบบฝึกหัด</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.weeklyProgress}/{stats.weeklyGoal} ข้อ
                </span>
              </div>
              <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">อีก {stats.weeklyGoal - stats.weeklyProgress} ข้อเพื่อบรรลุเป้าหมาย!</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">ฝึกสอบด่วน</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/practice?exam=toeic')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">TOEIC</h3>
                <p className="text-xs text-gray-600">Reading & Listening</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/practice?exam=ielts')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">IELTS</h3>
                <p className="text-xs text-gray-600">4 Skills</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">ความสำเร็จล่าสุด</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">First Steps</h3>
                  <p className="text-sm text-gray-600">ทำแบบทดสอบครบ 1 ชุด</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-600">+50 XP</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
