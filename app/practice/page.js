'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Trophy, BookOpen, Headphones, PenTool, Mic, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const EXAMS = [
  { 
    id: 'toeic', 
    icon: Target, 
    title: 'TOEIC 700+', 
    description: 'การฟังและการอ่านภาษาอังกฤษธุรกิจ',
    color: 'blue',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'การอ่าน', color: 'blue' },
      { id: 'listening', icon: Headphones, label: 'การฟัง', color: 'purple' }
    ]
  },
  { 
    id: 'ielts', 
    icon: Trophy, 
    title: 'IELTS 7.0+', 
    description: 'การฟัง การอ่าน การเขียน และการพูด',
    color: 'purple',
    sections: [
      { id: 'listening', icon: Headphones, label: 'การฟัง', color: 'purple' },
      { id: 'reading', icon: BookOpen, label: 'การอ่าน', color: 'blue' },
      { id: 'writing', icon: PenTool, label: 'การเขียน', color: 'green' },
      { id: 'speaking', icon: Mic, label: 'การพูด', color: 'orange' }
    ]
  }
]

export default function PracticePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const examParam = searchParams?.get('exam')
  const [selectedExam, setSelectedExam] = useState(examParam || null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/welcome')
    }
  }, [])

  const startLesson = (examId, sectionId) => {
    // Use the original page.js flow
    router.push(`/?exam=${examId}&section=${sectionId}`)
  }

  if (selectedExam) {
    const exam = EXAMS.find(e => e.id === selectedExam)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 pt-12 pb-8 px-4">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setSelectedExam(null)}
              className="text-white mb-4"
            >
              ← กลับ
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-white/90">{exam.description}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">เลือกส่วนที่ต้องการฝึก</h2>
          <div className="space-y-3">
            {exam.sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => startLesson(exam.id, section.id)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-${section.color}-100 rounded-xl flex items-center justify-center`}>
                        <section.icon className={`w-7 h-7 text-${section.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{section.label}</h3>
                        <p className="text-sm text-gray-600">5 คำถามจาก AI</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-green-600 pt-12 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">ฝึกสอบ</h1>
          <p className="text-white/90">เลือกข้อสอบที่ต้องการฝึก</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="space-y-4">
          {EXAMS.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedExam(exam.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 bg-${exam.color}-100 rounded-2xl flex items-center justify-center`}>
                      <exam.icon className={`w-8 h-8 text-${exam.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-900 mb-1">{exam.title}</h3>
                      <p className="text-sm text-gray-600">{exam.description}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {exam.sections.map(section => (
                      <div key={section.id} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                        <section.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-xs text-gray-700">{section.label}</span>
                      </div>
                    ))}
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
