'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Headphones, PenTool, Mic, Sparkles, Zap, Target, Clock, CheckCircle } from 'lucide-react'

const SECTION_TIPS = {
  reading: {
    icon: BookOpen,
    color: 'blue',
    title: 'เคล็ดลับการอ่าน',
    bgClass: 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50',
    iconBgClass: 'bg-gradient-to-br from-blue-400 to-blue-600',
    badgeBgClass: 'bg-blue-100',
    badgeTextClass: 'text-blue-600',
    progressClass: 'bg-gradient-to-r from-blue-500 to-blue-600',
    dotActiveClass: 'bg-blue-600',
    dotPassedClass: 'bg-blue-400',
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
    bgClass: 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50',
    iconBgClass: 'bg-gradient-to-br from-purple-400 to-purple-600',
    badgeBgClass: 'bg-purple-100',
    badgeTextClass: 'text-purple-600',
    progressClass: 'bg-gradient-to-r from-purple-500 to-purple-600',
    dotActiveClass: 'bg-purple-600',
    dotPassedClass: 'bg-purple-400',
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
    bgClass: 'bg-gradient-to-br from-green-50 via-green-100 to-green-50',
    iconBgClass: 'bg-gradient-to-br from-green-400 to-green-600',
    badgeBgClass: 'bg-green-100',
    badgeTextClass: 'text-green-600',
    progressClass: 'bg-gradient-to-r from-green-500 to-green-600',
    dotActiveClass: 'bg-green-600',
    dotPassedClass: 'bg-green-400',
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
    bgClass: 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50',
    iconBgClass: 'bg-gradient-to-br from-orange-400 to-orange-600',
    badgeBgClass: 'bg-orange-100',
    badgeTextClass: 'text-orange-600',
    progressClass: 'bg-gradient-to-r from-orange-500 to-orange-600',
    dotActiveClass: 'bg-orange-600',
    dotPassedClass: 'bg-orange-400',
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
    let tipInterval
    let progressInterval
    let completed = false

    // Animate through tips
    tipInterval = setInterval(() => {
      setCurrentTip((prev) => {
        if (prev < tips.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    // Progress bar - faster to 100%
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100 && !completed) {
          completed = true
          clearInterval(progressInterval)
          clearInterval(tipInterval)
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 300)
          return 100
        }
        return prev + 4 // Faster: 0 to 100 in 2.5 seconds
      })
    }, 100)

    return () => {
      clearInterval(tipInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${sectionInfo.bgClass}`}>
      <div className="w-full max-w-2xl px-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className={`mx-auto w-24 h-24 ${sectionInfo.iconBgClass} rounded-3xl flex items-center justify-center mb-8 shadow-2xl`}
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
              <div className={`mt-1 w-10 h-10 rounded-full ${sectionInfo.badgeBgClass} flex items-center justify-center flex-shrink-0`}>
                <Zap className={`w-5 h-5 ${sectionInfo.badgeTextClass}`} />
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
                      <span className={sectionInfo.badgeTextClass}>เคล็ดลับที่ {currentTip + 1}</span>
                      <CheckCircle className={`w-5 h-5 ${sectionInfo.badgeTextClass}`} />
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
                      ? `w-8 ${sectionInfo.dotActiveClass}` 
                      : index < currentTip
                      ? `w-2 ${sectionInfo.dotPassedClass}`
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
              className={`h-full ${sectionInfo.progressClass}`}
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
