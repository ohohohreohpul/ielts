'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, ChevronRight, GraduationCap, Target, Sparkles } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const examTypes = [
  {
    id: 'ielts',
    name: 'IELTS',
    description: 'เตรียมสอบ IELTS ทุก Section',
    emoji: '🎓',
    color: 'from-red-500 to-pink-500',
    sections: [
      { id: 'reading', name: 'Reading', lessons: 6 },
      { id: 'listening', name: 'Listening', lessons: 5 },
      { id: 'writing', name: 'Writing', lessons: 6 },
      { id: 'speaking', name: 'Speaking', lessons: 5 },
    ]
  },
  {
    id: 'toeic',
    name: 'TOEIC',
    description: 'เตรียมสอบ TOEIC Listening & Reading',
    emoji: '📊',
    color: 'from-blue-500 to-indigo-500',
    sections: [
      { id: 'listening', name: 'Listening', lessons: 5 },
      { id: 'reading', name: 'Reading', lessons: 5 },
    ]
  }
]

export default function LessonsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-14 pb-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">เตรียมสอบ</h1>
              <p className="text-white/70 text-sm">เรียนรู้เทคนิคและทริคต่างๆ</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {/* Info Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-white mt-0.5" />
              <div>
                <h3 className="font-bold text-white">เรียนรู้ก่อนทำข้อสอบ</h3>
                <p className="text-white/80 text-sm">อ่านเทคนิค ทริค และวิธีทำข้อสอบแต่ละประเภท</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Types */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">เลือกข้อสอบ</h2>
        
        <div className="space-y-4">
          {examTypes.map((exam, idx) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => router.push(`/lessons/${exam.id}`)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${exam.color} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{exam.emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white">{exam.name}</h3>
                          <p className="text-white/80 text-sm">{exam.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/60" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <div className="flex flex-wrap gap-2">
                      {exam.sections.map(section => (
                        <div 
                          key={section.id}
                          className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          <span className="font-medium text-gray-700">{section.name}</span>
                          <span className="text-gray-400 ml-1">• {section.lessons} บท</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
