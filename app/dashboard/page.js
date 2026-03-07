'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Star, BookOpen, Headphones, PenTool, Mic, Lock, Crown, ChevronRight, X, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const EXAMS = [
  {
    id: 'toeic', name: 'TOEIC', free: true, emoji: '📘',
    difficulty: 'กลาง', diffColor: 'text-yellow-500',
    desc: 'สอบวัดระดับภาษาอังกฤษเพื่อการสื่อสารระหว่างประเทศ',
    detail: 'ใช้สมัครงาน / เลื่อนตำแหน่ง\nคะแนนเต็ม 990 (Listening 495 + Reading 495)',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'Reading', sub: 'Part 5–7: Grammar, Vocab, Comprehension' },
      { id: 'listening', icon: Headphones, label: 'Listening', sub: 'Part 1–4: Photos, Q&A, Conversations' },
    ]
  },
  {
    id: 'grammar', name: 'Grammar', free: true, emoji: '📝',
    difficulty: 'ง่าย', diffColor: 'text-green-500',
    desc: 'ฝึกไวยากรณ์ภาษาอังกฤษทุกระดับ',
    detail: 'Tenses, Prepositions, Articles, Conditionals\nเหมาะสำหรับเตรียมสอบทุกประเภท',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'Grammar Practice', sub: 'Tenses, Prepositions, Vocabulary' },
    ]
  },
  {
    id: 'ielts', name: 'IELTS', free: false, emoji: '🇬🇧',
    difficulty: 'ยาก', diffColor: 'text-red-500',
    desc: 'สอบวัดระดับเพื่อศึกษาต่อ / ย้ายถิ่นฐาน',
    detail: 'Academic & General Training\nคะแนน Band 1–9 ใช้สมัครเรียนต่อต่างประเทศ',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'Reading', sub: 'Academic & General Training' },
      { id: 'listening', icon: Headphones, label: 'Listening', sub: 'Conversations & Monologues' },
      { id: 'writing', icon: PenTool, label: 'Writing', sub: 'Task 1 (Chart) & Task 2 (Essay)' },
      { id: 'speaking', icon: Mic, label: 'Speaking', sub: 'Part 1–3 Interview' },
    ]
  },
  {
    id: 'toefl', name: 'TOEFL', free: false, emoji: '🇺🇸',
    difficulty: 'ยาก', diffColor: 'text-red-500',
    desc: 'สอบวัดระดับเพื่อศึกษาต่อในอเมริกา',
    detail: 'TOEFL iBT คะแนนเต็ม 120\nReading + Listening + Speaking + Writing',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'Reading', sub: 'Academic Passages' },
      { id: 'listening', icon: Headphones, label: 'Listening', sub: 'Lectures & Conversations' },
      { id: 'writing', icon: PenTool, label: 'Writing', sub: 'Integrated & Independent' },
      { id: 'speaking', icon: Mic, label: 'Speaking', sub: 'Tasks 1–4' },
    ]
  },
  {
    id: 'cutep', name: 'CU-TEP', free: false, emoji: '🏛️',
    difficulty: 'กลาง-ยาก', diffColor: 'text-orange-500',
    desc: 'สอบเข้าจุฬาลงกรณ์มหาวิทยาลัย',
    detail: 'ใช้สมัครเรียนต่อ ป.โท/เอก จุฬาฯ\nListening + Reading + Writing',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'Reading', sub: 'Reading Comprehension' },
      { id: 'listening', icon: Headphones, label: 'Listening', sub: 'Listening Comprehension' },
    ]
  },
  {
    id: 'tuget', name: 'TU-GET', free: false, emoji: '🎓',
    difficulty: 'กลาง-ยาก', diffColor: 'text-orange-500',
    desc: 'สอบเข้ามหาวิทยาลัยธรรมศาสตร์',
    detail: 'ใช้สมัครเรียนต่อ ป.โท/เอก ธรรมศาสตร์\nGrammar + Vocabulary + Reading',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'ภาษาอังกฤษ', sub: 'Grammar, Vocabulary, Reading' },
    ]
  },
  {
    id: 'onet', name: 'O-NET', free: false, emoji: '📖',
    difficulty: 'ง่าย-กลาง', diffColor: 'text-green-600',
    desc: 'ข้อสอบภาษาอังกฤษ O-NET ม.6',
    detail: 'ข้อสอบ O-NET วิชาภาษาอังกฤษ\nGrammar, Vocabulary, Reading, Writing',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'ภาษาอังกฤษ', sub: 'Grammar, Vocabulary, Reading' },
    ]
  },
  {
    id: 'ocsc', name: 'กพ.', free: false, emoji: '🏢',
    difficulty: 'กลาง', diffColor: 'text-yellow-500',
    desc: 'ข้อสอบ กพ. ภาค ก. วิชาภาษาอังกฤษ',
    detail: 'สอบเข้ารับราชการ ก.พ.\nGrammar, Vocabulary, Comprehension',
    sections: [
      { id: 'reading', icon: BookOpen, label: 'ภาษาอังกฤษ', sub: 'Grammar, Vocab, Comprehension' },
    ]
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)
  const [lastExam, setLastExam] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/welcome'); return }
    try {
      const u = JSON.parse(userData)
      setUser(u)
      // Load last exam from localStorage
      const last = localStorage.getItem('lastExam')
      if (last) setLastExam(JSON.parse(last))
    } catch {}
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const freeExams = EXAMS.filter(e => e.free)
  const premiumExams = EXAMS.filter(e => !e.free)

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 20px))' }}>

      {/* Header */}
      <div className="bg-orange-500 pt-12 pb-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">สวัสดี 👋</p>
            <h1 className="text-2xl font-black text-white">{user?.name || 'นักเรียน'}</h1>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-bold">7</span>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-bold">350</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* Continue Learning */}
        {lastExam && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => router.push(`/?exam=${lastExam.examId}&section=${lastExam.section}`)}
              className="w-full bg-white rounded-2xl border-2 border-orange-100 p-4 flex items-center gap-4 active:opacity-70 transition-opacity"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{lastExam.emoji || '📘'}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-orange-500">ฝึกต่อ</p>
                <p className="font-bold text-gray-900">{lastExam.name} - {lastExam.sectionLabel}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0" />
            </button>
          </motion.div>
        )}

        {/* Free Exams */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🆓 ข้อสอบฟรี</p>
          <div className="grid grid-cols-2 gap-3">
            {freeExams.map((exam, i) => (
              <motion.button
                key={exam.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedExam(exam)}
                className="bg-white rounded-2xl border-2 border-gray-100 p-4 text-left active:border-orange-300 active:scale-95 transition-all"
              >
                <span className="text-3xl">{exam.emoji}</span>
                <h3 className="font-black text-gray-900 mt-2">{exam.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{exam.desc}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs font-bold ${exam.diffColor}`}>● {exam.difficulty}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-400">{exam.sections.length} พาร์ท</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Premium Exams */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">👑 Premium</p>
            <button onClick={() => router.push('/practice')} className="text-xs font-bold text-orange-500">ดูทั้งหมด</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {premiumExams.map((exam, i) => (
              <motion.button
                key={exam.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => setSelectedExam(exam)}
                className="bg-white rounded-2xl border-2 border-gray-100 p-4 text-left relative overflow-hidden active:scale-95 transition-all"
              >
                {/* Lock overlay */}
                <div className="absolute top-2 right-2">
                  <Lock className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <span className="text-3xl opacity-60">{exam.emoji}</span>
                <h3 className="font-black text-gray-500 mt-2">{exam.name}</h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{exam.desc}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-xs font-bold ${exam.diffColor} opacity-60`}>● {exam.difficulty}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-300">{exam.sections.length} พาร์ท</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Plus Banner */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/practice')}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-5 text-left active:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🥕</span>
            <div className="flex-1">
              <p className="text-white font-black text-base">Carrot School Plus 👑</p>
              <p className="text-white/70 text-sm mt-0.5">ปลดล็อคข้อสอบทั้งหมด เริ่มต้น ฿83/เดือน</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
          </div>
        </motion.button>
      </div>

      {/* Exam Detail Modal */}
      <AnimatePresence>
        {selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setSelectedExam(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-md overflow-hidden"
              style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-orange-50 px-6 pt-6 pb-4">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedExam.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-gray-900">{selectedExam.name}</h2>
                      {!selectedExam.free && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Plus
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{selectedExam.desc}</p>
                    <span className={`text-xs font-bold ${selectedExam.diffColor} mt-1 inline-block`}>● ระดับ: {selectedExam.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Detail */}
              {selectedExam.detail && (
                <div className="px-6 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📋 รายละเอียด</p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    {selectedExam.detail.split('\n').map((line, i) => (
                      <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections */}
              <div className="px-6 pt-4 pb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📚 เลือกพาร์ท ({selectedExam.sections.length})</p>
                <div className="space-y-2">
                  {selectedExam.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        if (!selectedExam.free) {
                          // Navigate to practice which will show pricing
                          router.push('/practice')
                          setSelectedExam(null)
                          return
                        }
                        // Save last exam
                        localStorage.setItem('lastExam', JSON.stringify({
                          examId: selectedExam.id,
                          name: selectedExam.name,
                          emoji: selectedExam.emoji,
                          section: sec.id,
                          sectionLabel: sec.label,
                        }))
                        router.push(`/?exam=${selectedExam.id}&section=${sec.id}`)
                        setSelectedExam(null)
                      }}
                      className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 active:opacity-70 transition-opacity"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedExam.free ? 'bg-orange-50' : 'bg-gray-100'}`}>
                        <sec.icon className={`w-5 h-5 ${selectedExam.free ? 'text-orange-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-bold ${selectedExam.free ? 'text-gray-900' : 'text-gray-400'}`}>{sec.label}</p>
                        <p className="text-xs text-gray-400">{sec.sub}</p>
                      </div>
                      {selectedExam.free ? (
                        <div className="bg-orange-500 px-3.5 py-2 rounded-xl flex-shrink-0">
                          <p className="text-white text-sm font-bold">เริ่ม</p>
                        </div>
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unlock Button for Premium */}
              {!selectedExam.free && (
                <div className="px-6 pt-3 pb-2">
                  <button
                    onClick={() => { router.push('/practice'); setSelectedExam(null) }}
                    className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:opacity-80"
                  >
                    <Crown className="w-4 h-4" />
                    ปลดล็อคด้วย Carrot School Plus
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
