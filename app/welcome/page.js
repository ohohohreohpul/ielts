'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Target, Trophy, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl mb-6">
            <Sparkles className="w-16 h-16 text-green-500" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-bold text-white mb-3"
          >
            Mydemy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-white/90"
          >
            ฝึกสอบให้เชี่ยวชาญ ทีละข้อ
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI-Powered Questions</h3>
              <p className="text-sm text-white/80">คำถามสร้างจาก AI ใหม่ทุกครั้ง</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Instant Feedback</h3>
              <p className="text-sm text-white/80">รับ feedback ทันทีพร้อมคำอธิบาย</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Track Progress</h3>
              <p className="text-sm text-white/80">ติดตามความก้าวหน้าและคะแนน</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="space-y-3"
        >
          <Button
            onClick={() => router.push('/signup')}
            className="w-full h-14 text-lg font-semibold bg-white text-green-600 hover:bg-gray-50"
            size="lg"
          >
            เริ่มต้นใช้งานฟรี
          </Button>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="w-full h-14 text-lg font-semibold bg-transparent text-white border-2 border-white hover:bg-white/10"
            size="lg"
          >
            เข้าสู่ระบบ
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center text-white/70 text-sm mt-6"
        >
          พร้อมสำหรับ TOEIC, IELTS และ CU-TEP
        </motion.p>
      </div>
    </div>
  )
}
