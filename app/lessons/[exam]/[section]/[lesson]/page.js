'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'

export default function LessonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { exam, section, lesson } = params

  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    fetchLessonContent()
    checkCompleted()
  }, [exam, section, lesson])

  const fetchLessonContent = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/lessons/${exam}/${section}/${lesson}`)
      if (!res.ok) throw new Error('Failed to fetch lesson')
      const data = await res.json()
      setContent(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const checkCompleted = () => {
    const completed = localStorage.getItem(`completed_lessons_${exam}`)
    if (completed) {
      const list = JSON.parse(completed)
      setIsCompleted(list.includes(`${section}-${lesson}`))
    }
  }

  const markAsCompleted = () => {
    const key = `completed_lessons_${exam}`
    const completed = localStorage.getItem(key)
    let list = completed ? JSON.parse(completed) : []
    const lessonKey = `${section}-${lesson}`
    
    if (!list.includes(lessonKey)) {
      list.push(lessonKey)
      localStorage.setItem(key, JSON.stringify(list))
      setIsCompleted(true)
    }
  }

  const goBack = () => {
    router.push(`/lessons/${exam}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดบทเรียน...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error || 'ไม่พบเนื้อหาบทเรียน'}</p>
            <Button onClick={goBack}>กลับ</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-14 pb-6 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-white/70 text-sm">{content.examName} • {content.sectionName}</p>
            <h1 className="text-xl font-bold text-white">{content.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        {/* Lesson Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          {content.sections?.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="mb-8"
            >
              {section.type === 'heading' && (
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-6 mb-3">
                  {section.emoji && <span>{section.emoji}</span>}
                  {section.text}
                </h2>
              )}
              
              {section.type === 'paragraph' && (
                <p className="text-gray-700 leading-relaxed mb-4">{section.text}</p>
              )}
              
              {section.type === 'tip' && (
                <Card className="bg-amber-50 border-amber-200 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-amber-800 mb-1">💡 ทริค</h4>
                        <p className="text-amber-700 text-sm">{section.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {section.type === 'example' && (
                <Card className="bg-blue-50 border-blue-200 mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-blue-800 mb-2">📝 ตัวอย่าง</h4>
                    <p className="text-blue-700 text-sm whitespace-pre-wrap">{section.text}</p>
                  </CardContent>
                </Card>
              )}
              
              {section.type === 'list' && (
                <ul className="list-none space-y-2 mb-4">
                  {section.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {section.type === 'warning' && (
                <Card className="bg-red-50 border-red-200 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <h4 className="font-bold text-red-800 mb-1">ระวัง!</h4>
                        <p className="text-red-700 text-sm">{section.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom">
        <Button
          onClick={markAsCompleted}
          disabled={isCompleted}
          className={`w-full h-14 text-lg font-bold ${
            isCompleted 
              ? 'bg-green-500 hover:bg-green-500' 
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isCompleted ? (
            <><CheckCircle2 className="w-5 h-5 mr-2" /> อ่านจบแล้ว ✓</>
          ) : (
            'อ่านจบแล้ว'
          )}
        </Button>
      </div>
    </div>
  )
}
