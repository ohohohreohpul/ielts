'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Headphones, PenTool, Mic, ChevronDown, ChevronUp, Lock, Crown, Check } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const EXAMS = [
  // FREE TIER
  {
    id: 'toeic', name: 'TOEIC', free: true,
    desc: 'Test of English for International Communication',
    emoji: '📘',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Part 5–7: Grammar & Comprehension' },
      { id: 'listening', icon: Headphones, label: 'Listening',  sub: 'Part 1–4: Photos & Conversations' },
    ]
  },
  {
    id: 'grammar', name: 'Grammar', free: true,
    desc: 'ไวยากรณ์ภาษาอังกฤษ พื้นฐาน - ขั้นสูง',
    emoji: '📝',
    sections: [
      { id: 'grammar',   icon: BookOpen,   label: 'Grammar Practice',   sub: 'Tenses, Prepositions, Vocabulary' },
    ]
  },
  // PREMIUM TIER
  {
    id: 'ielts', name: 'IELTS', free: false,
    desc: 'International English Language Testing System',
    emoji: '🇬🇧',
    sections: [

      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Academic Texts (Science, History, Society)' },

      { id: 'listening', icon: Headphones, label: 'Listening',  sub: 'Conversations & Monologues' },
      { id: 'writing',   icon: PenTool,    label: 'Writing',    sub: 'Task 1 & 2 Essays' },
      { id: 'speaking',  icon: Mic,        label: 'Speaking',   sub: 'Part 1–3 Interview' },
    ]
  },
  {
    id: 'toefl', name: 'TOEFL', free: false,
    desc: 'Test of English as a Foreign Language',
    emoji: '🇺🇸',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Academic Passages' },
      { id: 'listening', icon: Headphones, label: 'Listening',  sub: 'Lectures & Conversations' },

      { id: 'writing',   icon: PenTool,    label: 'Writing',    sub: 'Integrated & Academic Discussion' },

      { id: 'speaking',  icon: Mic,        label: 'Speaking',   sub: 'Tasks 1–4' },
    ]
  },
  {
    id: 'cutep', name: 'CU-TEP', free: false,
    desc: 'Chulalongkorn University Test of English Proficiency',
    emoji: '🏛️',
    sections: [

      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Structure, Vocabulary & Comprehension' },

      { id: 'listening', icon: Headphones, label: 'Listening',  sub: 'Listening Comprehension' },
    ]
  },
  {
    id: 'tuget', name: 'TU-GET', free: false,
    desc: 'Thammasat University General English Test',
    emoji: '🎓',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Grammar, Vocabulary, Reading' },
    ]
  },
  {
    id: 'onet', name: 'O-NET', free: false,
    desc: 'ข้อสอบภาษาอังกฤษ O-NET ม.6',
    emoji: '📖',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'ภาษาอังกฤษ',   sub: 'Grammar, Vocabulary, Reading' },
    ]
  },
  {
    id: 'ocsc', name: 'กพ. ภาษาอังกฤษ', free: false,
    desc: 'ข้อสอบ กพ. ภาค ก. วิชาภาษาอังกฤษ',
    emoji: '🏢',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'ภาษาอังกฤษ',   sub: 'Grammar, Vocabulary, Comprehension' },
    ]
  },
]

export default function PracticePage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState('toeic')
  const [showPricing, setShowPricing] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const u = JSON.parse(userData)
        setIsPremium(u.premium === true)
      } catch {}
    }
    // Background refresh
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/session', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user))
            setIsPremium(data.user.premium === true)
          }
        }).catch(() => {})
    }
  }, [])

  const freeExams = EXAMS.filter(e => e.free)
  const premiumExams = EXAMS.filter(e => !e.free)

  const handleExamClick = (exam) => {
    if (!exam.free && !isPremium) {
      setShowPricing(true)
      return
    }
    setExpanded(expanded === exam.id ? null : exam.id)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 20px))' }}>

      {/* Header */}
      <div className="bg-[#1B3F7A] pt-12 pb-5 px-5">
        <h1 className="text-2xl font-black text-white">เลือกข้อสอบ</h1>
        <p className="text-white/70 text-sm font-medium mt-1">ฝึกทีละพาร์ท ค่อยๆ เก่งขึ้น</p>
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* FREE SECTION */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">🆓 ฟรี</p>
        {freeExams.map((exam, ei) => (
          <ExamCard key={exam.id} exam={exam} expanded={expanded} onToggle={() => setExpanded(expanded === exam.id ? null : exam.id)} router={router} />
        ))}

        {/* PREMIUM SECTION */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isPremium ? '📚 ข้อสอบเพิ่มเติม' : '👑 Premium'}</p>
          {!isPremium && <button onClick={() => setShowPricing(true)} className="text-xs font-bold text-[#1B3F7A]">ปลดล็อค</button>}
        </div>
        {premiumExams.map((exam, ei) => (
          isPremium ? (
            <ExamCard key={exam.id} exam={exam} expanded={expanded} onToggle={() => setExpanded(expanded === exam.id ? null : exam.id)} router={router} />
          ) : (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + ei * 0.05 }}
            >
              <button
                onClick={() => setShowPricing(true)}
                className="w-full bg-white rounded-2xl border-2 border-gray-100 p-4 flex items-center gap-4 opacity-60 active:opacity-40 transition-opacity"
              >
                <span className="text-2xl">{exam.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{exam.name}</span>
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">{exam.desc}</p>
                </div>
              </button>
            </motion.div>
          )
        ))}

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border-l-4 border-[#1B3F7A] p-4 flex gap-3"
        >
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">เคล็ดลับ</p>
            <p className="text-gray-500 text-sm mt-0.5">ฝึกทุกวันวันละ 10 นาที ดีกว่าฝึกนานๆ สัปดาห์ละครั้ง</p>
          </div>
        </motion.div>
      </div>

      {/* Pricing Modal */}
      <AnimatePresence>
        {showPricing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setShowPricing(false)}
            onTouchMove={e => e.preventDefault()}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-md p-6 overflow-y-auto overscroll-contain"
              style={{ maxHeight: '85vh', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', WebkitOverflowScrolling: 'touch' }}
              onClick={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <p className="text-4xl mb-2">🥕</p>
                <h2 className="text-2xl font-black text-gray-900">kedikedi Plus</h2>
                <p className="text-gray-500 text-sm mt-1">ปลดล็อคข้อสอบทั้งหมด</p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                {[
                  'ข้อสอบ IELTS, TOEFL, CU-TEP, TU-GET, O-NET, กพ.',
                  'หัวใจไม่จำกัด ฝึกได้ทั้งวัน',
                  'AI Scoring สำหรับ Writing & Speaking',
                  'คำถามใหม่ไม่มีซ้ำ',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-700">{text}</p>
                  </div>
                ))}
              </div>

              {/* Pricing Plans */}
              <div className="space-y-3 mb-6">
                {/* Yearly - Recommended */}
                <button className="w-full bg-[#1B3F7A] rounded-2xl p-4 text-left relative overflow-hidden active:opacity-80">
                  <div className="absolute top-0 right-0 bg-yellow-400 px-3 py-0.5 rounded-bl-xl">
                    <span className="text-xs font-black text-black">ประหยัด 45%</span>
                  </div>
                  <p className="text-white font-black text-lg">รายปี</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-white font-black text-3xl">฿990</span>
                    <span className="text-white/70 text-sm">/ปี</span>
                  </div>
                  <p className="text-white/70 text-xs mt-1">เฉลี่ย ฿83/เดือน</p>
                </button>

                {/* Monthly */}
                <button className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left active:opacity-80">
                  <p className="text-gray-900 font-black text-lg">รายเดือน</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-gray-900 font-black text-3xl">฿149</span>
                    <span className="text-gray-400 text-sm">/เดือน</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPricing(false)}
                className="w-full text-center text-gray-400 text-sm font-medium py-2"
              >
                ไว้ทีหลัง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

function ExamCard({ exam, expanded, onToggle, router }) {
  const isOpen = expanded === exam.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Exam Header */}
      <button
        onClick={onToggle}
        className={`w-full bg-white rounded-2xl border-2 p-4 flex items-center gap-4 transition-colors active:opacity-80 ${isOpen ? 'border-[#1B3F7A]' : 'border-gray-100'}`}
      >
        <span className="text-2xl">{exam.emoji}</span>
        <div className="flex-1 text-left">
          <span className={`font-bold ${isOpen ? 'text-[#1B3F7A]' : 'text-gray-900'}`}>{exam.name}</span>
          <p className="text-xs text-gray-400">{exam.desc}</p>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[#1B3F7A]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {/* Sections */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2 space-y-2 pl-2"
          >
            {exam.sections.map((sec, si) => (
              <motion.button
                key={sec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: si * 0.06 }}
                onClick={() => router.push(`/?exam=${exam.id}&section=${sec.id}&v=${Date.now()}`)}
                className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 active:opacity-70 transition-opacity"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <sec.icon className="w-5 h-5 text-[#1B3F7A]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">{sec.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sec.sub}</p>
                </div>
                <div className="bg-[#1B3F7A] px-4 py-2 rounded-xl flex-shrink-0">
                  <p className="text-white text-sm font-bold">เริ่ม</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
