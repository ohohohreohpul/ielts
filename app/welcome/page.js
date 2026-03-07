'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Trophy, Flame, BookOpen, Headphones, PenTool, Mic } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) router.replace('/dashboard')
  }, [])

  const features = [
    { icon: Sparkles, text: 'คำถามสร้างจาก AI ใหม่ทุกครั้ง', sub: 'ไม่ซ้ำเดิม ไม่น่าเบื่อ' },
    { icon: Trophy, text: 'TOEIC & IELTS ครบทุกพาร์ท', sub: 'Reading, Listening, Writing, Speaking' },
    { icon: Flame, text: 'ระบบ Streak กระตุ้นทุกวัน', sub: 'ฝึกทีละ 10 นาที ก็พัฒนาได้' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top section - Orange */}
      <div className="bg-orange-500 pt-16 pb-24 px-6 flex flex-col items-center text-white">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
        >
          <span className="text-5xl font-black text-orange-500">M</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-4xl font-black text-center mb-2 tracking-tight">Mydemy</h1>
          <p className="text-white/80 text-center text-base font-medium">ฝึกสอบให้เชี่ยวชาญ ทีละข้อ</p>
        </motion.div>
      </div>

      {/* White card overlapping */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-8 px-6 pt-8 pb-10 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1"
        >
          <h2 className="text-2xl font-black text-black mb-6">เริ่มต้นฝึกสอบวันนี้</h2>

          <div className="space-y-4 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-black">{f.text}</p>
                  <p className="text-sm text-gray-500">{f.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push('/signup')}
            className="w-full h-14 bg-orange-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-orange-200 active:opacity-80 transition-opacity"
          >
            เริ่มต้นใช้งานฟรี
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-14 bg-white text-black text-lg font-bold rounded-2xl border-2 border-gray-200 active:opacity-80 transition-opacity"
          >
            เข้าสู่ระบบ
          </button>
        </motion.div>
      </div>
    </div>
  )
}
