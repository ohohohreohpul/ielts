'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, ChevronRight, CheckCircle2, Clock, Loader2, Lock } from 'lucide-react'

const examData = {
  ielts: {
    name: 'IELTS',
    emoji: '🎓',
    color: 'from-red-500 to-pink-500',
    sections: {
      reading: {
        name: 'Reading',
        icon: '📖',
        lessons: [
          { id: 'question-types', title: 'ประเภทคำถาม IELTS Reading', duration: '10 นาที', free: true },
          { id: 'skimming-scanning', title: 'เทคนิค Skimming & Scanning', duration: '15 นาที', free: true },
          { id: 'true-false-ng', title: 'ทริค True/False/Not Given', duration: '12 นาที', free: false },
          { id: 'matching-headings', title: 'วิธีทำ Matching Headings', duration: '10 นาที', free: false },
          { id: 'sentence-completion', title: 'Sentence Completion Tips', duration: '8 นาที', free: false },
          { id: 'time-management', title: 'การบริหารเวลา Reading', duration: '10 นาที', free: false },
        ]
      },
      listening: {
        name: 'Listening',
        icon: '🎧',
        lessons: [
          { id: 'question-types', title: 'ประเภทคำถาม IELTS Listening', duration: '10 นาที', free: true },
          { id: 'note-taking', title: 'เทคนิค Note Taking', duration: '12 นาที', free: true },
          { id: 'prediction', title: 'การ Predict คำตอบ', duration: '10 นาที', free: false },
          { id: 'spelling-tips', title: 'Spelling Tips & Common Mistakes', duration: '8 นาที', free: false },
          { id: 'map-diagram', title: 'ทำข้อ Map & Diagram', duration: '10 นาที', free: false },
        ]
      },
      writing: {
        name: 'Writing',
        icon: '✍️',
        lessons: [
          { id: 'task1-overview', title: 'Task 1: Overview & Structure', duration: '15 นาที', free: true },
          { id: 'task1-graphs', title: 'Task 1: การบรรยาย Graphs', duration: '12 นาที', free: true },
          { id: 'task2-structure', title: 'Task 2: Essay Structure', duration: '15 นาที', free: false },
          { id: 'task2-opinion', title: 'Task 2: Opinion Essay', duration: '12 นาที', free: false },
          { id: 'vocabulary', title: 'Vocabulary for High Score', duration: '10 นาที', free: false },
          { id: 'common-mistakes', title: 'Common Mistakes to Avoid', duration: '10 นาที', free: false },
        ]
      },
      speaking: {
        name: 'Speaking',
        icon: '🗣️',
        lessons: [
          { id: 'part1-tips', title: 'Part 1: Introduction Tips', duration: '10 นาที', free: true },
          { id: 'part2-structure', title: 'Part 2: Cue Card Strategy', duration: '15 นาที', free: true },
          { id: 'part3-discussion', title: 'Part 3: Discussion Skills', duration: '12 นาที', free: false },
          { id: 'fluency-tips', title: 'เพิ่ม Fluency & Coherence', duration: '10 นาที', free: false },
          { id: 'vocabulary-range', title: 'Vocabulary Range Tips', duration: '10 นาที', free: false },
        ]
      }
    }
  },
  toeic: {
    name: 'TOEIC',
    emoji: '📊',
    color: 'from-blue-500 to-indigo-500',
    sections: {
      listening: {
        name: 'Listening',
        icon: '🎧',
        lessons: [
          { id: 'part1-photos', title: 'Part 1: Photographs', duration: '10 นาที', free: true },
          { id: 'part2-qa', title: 'Part 2: Question-Response', duration: '12 นาที', free: true },
          { id: 'part3-conversations', title: 'Part 3: Conversations', duration: '15 นาที', free: false },
          { id: 'part4-talks', title: 'Part 4: Talks', duration: '15 นาที', free: false },
          { id: 'listening-tricks', title: 'Listening Tricks & Traps', duration: '10 นาที', free: false },
        ]
      },
      reading: {
        name: 'Reading',
        icon: '📖',
        lessons: [
          { id: 'part5-incomplete', title: 'Part 5: Incomplete Sentences', duration: '12 นาที', free: true },
          { id: 'part6-text-completion', title: 'Part 6: Text Completion', duration: '10 นาที', free: true },
          { id: 'part7-single', title: 'Part 7: Single Passages', duration: '15 นาที', free: false },
          { id: 'part7-multiple', title: 'Part 7: Multiple Passages', duration: '15 นาที', free: false },
          { id: 'time-management', title: 'Time Management Strategy', duration: '10 นาที', free: false },
        ]
      }
    }
  }
}

export default function ExamLessonsPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.exam
  
  const [selectedSection, setSelectedSection] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [user, setUser] = useState(null)

  const exam = examData[examId]

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Load completed lessons
    const completed = localStorage.getItem(`completed_lessons_${examId}`)
    if (completed) {
      setCompletedLessons(JSON.parse(completed))
    }

    // Auto-select first section
    if (exam) {
      setSelectedSection(Object.keys(exam.sections)[0])
    }
  }, [examId, exam])

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ไม่พบข้อมูลข้อสอบ</p>
      </div>
    )
  }

  const isPremium = user?.premium === true

  const handleLessonClick = (sectionId, lessonId, isFree) => {
    if (!isFree && !isPremium) {
      router.push('/pricing')
      return
    }
    router.push(`/lessons/${examId}/${sectionId}/${lessonId}`)
  }

  const currentSection = selectedSection ? exam.sections[selectedSection] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${exam.color} pt-14 pb-6 px-4`}>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/lessons')}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>{exam.emoji}</span> {exam.name}
            </h1>
            <p className="text-white/70 text-sm">เลือก Section ที่ต้องการเรียน</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {Object.entries(exam.sections).map(([sectionId, section]) => (
            <button
              key={sectionId}
              onClick={() => setSelectedSection(sectionId)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
                selectedSection === sectionId
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List */}
      <div className="px-4 py-6">
        {currentSection && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {currentSection.icon} {currentSection.name} Lessons
              </h2>
              <span className="text-sm text-gray-500">
                {currentSection.lessons.length} บทเรียน
              </span>
            </div>

            <div className="space-y-3">
              {currentSection.lessons.map((lesson, idx) => {
                const lessonKey = `${selectedSection}-${lesson.id}`
                const isCompleted = completedLessons.includes(lessonKey)
                const isLocked = !lesson.free && !isPremium

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={`overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
                        isLocked ? 'opacity-70' : ''
                      } ${isCompleted ? 'border-green-200 bg-green-50/50' : ''}`}
                      onClick={() => handleLessonClick(selectedSection, lesson.id, lesson.free)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : isLocked
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-blue-100 text-[#152E5A]'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{lesson.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {lesson.duration}
                              </span>
                              {lesson.free && (
                                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                  ฟรี
                                </span>
                              )}
                              {!lesson.free && (
                                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronRight className={`w-5 h-5 ${
                            isLocked ? 'text-gray-300' : 'text-gray-400'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
