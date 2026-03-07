'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Headphones, PenTool, Mic, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const EXAMS = [
  {
    id: 'toeic', name: 'TOEIC',
    desc: 'Test of English for International Communication',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Part 5–7: Grammar & Comprehension' },
      { id: 'listening', icon: Headphones, label: 'Listening',  sub: 'Part 1–4: Photos & Conversations' },
    ]
  },
  {
    id: 'ielts', name: 'IELTS',
    desc: 'International English Language Testing System',
    sections: [
      { id: 'reading',   icon: BookOpen,   label: 'Reading',   sub: 'Academic & General Training' },
      { id: 'listening', icon: Headphones, label: 'Listening',  sub: 'Conversations & Monologues' },
      { id: 'writing',   icon: PenTool,    label: 'Writing',    sub: 'Task 1 & 2 Essays' },
      { id: 'speaking',  icon: Mic,        label: 'Speaking',   sub: 'Part 1–3 Interview' },
    ]
  },
]

export default function PracticePage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState('toeic')

  return (
    <div className="min-h-screen bg-gray-50 pb-40">

      {/* Header */}
      <div className="bg-orange-500 pt-14 pb-6 px-5">
        <h1 className="text-2xl font-black text-white">เลือกข้อสอบ</h1>
        <p className="text-white/70 text-sm font-medium mt-1">ฝึกทีละพาร์ท ค่อยๆ เก่งขึ้น</p>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {EXAMS.map((exam, ei) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ei * 0.1 }}
          >
            {/* Exam Header */}
            <button
              onClick={() => setExpanded(expanded === exam.id ? null : exam.id)}
              className={`w-full bg-white rounded-2xl border-2 p-5 flex items-center justify-between transition-colors active:opacity-80 ${expanded === exam.id ? 'border-orange-500' : 'border-gray-100'}`}
            >
              <div className="text-left">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-black ${expanded === exam.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {exam.name}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{exam.desc}</p>
              </div>
              {expanded === exam.id
                ? <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              }
            </button>

            {/* Sections */}
            <AnimatePresence>
              {expanded === exam.id && (
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
                      onClick={() => router.push(`/?exam=${exam.id}&section=${sec.id}`)}
                      className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 active:opacity-70 transition-opacity"
                    >
                      <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <sec.icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-900">{sec.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sec.sub}</p>
                      </div>
                      <div className="bg-orange-500 px-4 py-2 rounded-xl flex-shrink-0">
                        <p className="text-white text-sm font-bold">เริ่ม</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border-l-4 border-orange-500 p-4 flex gap-3"
        >
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">เคล็ดลับ</p>
            <p className="text-gray-500 text-sm mt-0.5">ฝึกทุกวันวันละ 10 นาที ดีกว่าฝึกนานๆ สัปดาห์ละครั้ง</p>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
