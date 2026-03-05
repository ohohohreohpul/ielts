'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Headphones, PenTool, Mic, Sparkles, Zap, Target, Clock, CheckCircle } from 'lucide-react'

const SECTION_TIPS = {
  reading: {
    icon: BookOpen,
    color: 'blue',
    title: 'เคล็ดลับการอ่าน',
    tips: [
      'อ่านคำถามก่อนอ่านบทความ - จะช่วยให้คุณรู้ว่าต้องมองหาข้อมูลอะไร',
      'ใช้เทคนิค Skimming และ Scanning เพื่อหาข้อมูลสำคัญอย่างรวดเร็ว',
      'จับใจความสำคัญของแต่ละย่อหน้า - มักจะอยู่ในประโยคแรกหรือสุดท้าย',
      'อย่าติดอยู่กับคำที่ไม่รู้จัก - ลองเดาความหมายจาก context'
    ]
  },
  listening: {
    icon: Headphones,
    color: 'purple',
    title: 'เคล็ดลับการฟัง',
    tips: [
      'อ่านคำถามให้ทันก่อนเสียงเริ่มเล่น - คุณจะได้รู้ว่าต้องฟังหาอะไร',
      'จดบันทึกคำสำคัญขณะฟัง - ชื่อ, เลข, สถานที่, เวลา',
      'ระวังคำพ้อง (synonyms) - คำถามกับเสียงอาจใช้คำต่างกันแต่ความหมายเดียวกัน',
      'อย่าหยุดคิดนาน - ถ้าพลาดข้อหนึ่งให้รีบไปข้อต่อไป'
    ]
  },
  writing: {
    icon: PenTool,
    color: 'green',
    title: 'เคล็ดลับการเขียน',
    tips: [
      'วางแผนโครงร่างก่อนเขียนจริง - Introduction, Body, Conclusion',
      'ใช้เวลา 5 นาทีวางแผน, 30 นาทีเขียน, 5 นาทีตรวจทาน',
      'ใช้ linking words เพื่อเชื่อมประโยค (However, Therefore, Furthermore)',
      'เขียนให้ครบตามจำนวนคำที่กำหนด - Task 1: 150 คำ, Task 2: 250 คำ'
    ]
  },
  speaking: {
    icon: Mic,
    color: 'orange',
    title: 'เคล็ดลับการพูด',
    tips: [
      'ใช้เวลาเตรียมอย่างเต็มที่ - จดโน้ตคำสำคัญที่จะพูด',
      'พูดชัดเจนและช้าพอที่จะเข้าใจง่าย - ไม่ต้องเร็วเกินไป',
      'ขยายความคำตอบ - อธิบายเหตุผล ยกตัวอย่าง เล่าประสบการณ์',
      'อย่ากลัวพูดผิด - การสื่อสารที่เข้าใจได้สำคัญกว่าไวยากรณ์ที่สมบูรณ์'
    ]
  }
}

export default function PreloaderScreen({ section, examType, onComplete }) {
  const [currentTip, setCurrentTip] = useState(0)
  const [progress, setProgress] = useState(0)
  
  const sectionInfo = SECTION_TIPS[section] || SECTION_TIPS.reading
  const tips = sectionInfo.tips

  useEffect(() => {
    // Animate through tips
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => {
        if (prev < tips.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 2000)

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(tipInterval)
          setTimeout(onComplete, 300)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => {
      clearInterval(tipInterval)
      clearInterval(progressInterval)
    }
  }, [tips.length, onComplete])

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-${sectionInfo.color}-50 via-${sectionInfo.color}-100 to-${sectionInfo.color}-50 flex items-center justify-center`}>
      <div className="w-full max-w-2xl px-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className={`mx-auto w-24 h-24 bg-gradient-to-br from-${sectionInfo.color}-400 to-${sectionInfo.color}-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl`}
        >
          <sectionInfo.icon className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-gray-900 text-center mb-4"
        >
          {sectionInfo.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-600 mb-12"
        >
          กำลังเตรียมข้อสอบด้วย AI...
        </motion.p>

        {/* Tips Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className={`mt-1 w-10 h-10 rounded-full bg-${sectionInfo.color}-100 flex items-center justify-center flex-shrink-0`}>
                <Zap className={`w-5 h-5 text-${sectionInfo.color}-600`} />
              </div>
              
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTip}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                      <span className={`text-${sectionInfo.color}-600`}>เคล็ดลับที่ {currentTip + 1}</span>
                      <CheckCircle className={`w-5 h-5 text-${sectionInfo.color}-600`} />
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {tips[currentTip]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Tip Progress Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTip 
                      ? `w-8 bg-${sectionInfo.color}-600` 
                      : index < currentTip
                      ? `w-2 bg-${sectionInfo.color}-400`
                      : `w-2 bg-gray-300`
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full bg-gradient-to-r from-${sectionInfo.color}-500 to-${sectionInfo.color}-600`}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Clock className="w-4 h-4 text-gray-600" />
            <p className="text-sm text-gray-600">กำลังสร้างคำถาม {progress}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
