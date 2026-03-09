'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, BookOpen, Headphones, PenTool, Mic, CheckCircle2, XCircle, ChevronDown, ChevronUp, Filter, TrendingUp } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const EXAM_META = {
  'TOEIC':   { emoji: '📘', name: 'TOEIC' },
  'toeic':   { emoji: '📘', name: 'TOEIC' },
  'Grammar': { emoji: '📝', name: 'Grammar' },
  'grammar': { emoji: '📝', name: 'Grammar' },
  'IELTS':   { emoji: '🇬🇧', name: 'IELTS' },
  'ielts':   { emoji: '🇬🇧', name: 'IELTS' },
  'TOEFL':   { emoji: '🇺🇸', name: 'TOEFL' },
  'toefl':   { emoji: '🇺🇸', name: 'TOEFL' },
  'CU-TEP':  { emoji: '🏛️', name: 'CU-TEP' },
  'cutep':   { emoji: '🏛️', name: 'CU-TEP' },
  'TU-GET':  { emoji: '🎓', name: 'TU-GET' },
  'tuget':   { emoji: '🎓', name: 'TU-GET' },
  'O-NET':   { emoji: '📖', name: 'O-NET' },
  'onet':    { emoji: '📖', name: 'O-NET' },
  'OCSC':    { emoji: '🏢', name: 'กพ.' },
  'ocsc':    { emoji: '🏢', name: 'กพ.' },
}

const SECTION_ICONS = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic,
}

const SECTION_LABELS = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
}

const EXAM_FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'TOEIC', label: 'TOEIC', emoji: '📘' },
  { key: 'Grammar', label: 'Grammar', emoji: '📝' },
  { key: 'IELTS', label: 'IELTS', emoji: '🇬🇧' },
  { key: 'TOEFL', label: 'TOEFL', emoji: '🇺🇸' },
  { key: 'CU-TEP', label: 'CU-TEP', emoji: '🏛️' },
  { key: 'TU-GET', label: 'TU-GET', emoji: '🎓' },
  { key: 'O-NET', label: 'O-NET', emoji: '📖' },
  { key: 'OCSC', label: 'กพ.', emoji: '🏢' },
]

export default function ProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [filterExam, setFilterExam] = useState('all')
  const [filterSection, setFilterSection] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/welcome'); return }
    try {
      const u = JSON.parse(userData)
      setUser(u)
      fetchHistory(u.id)
    } catch {
      router.push('/welcome')
    }
  }, [])

  const fetchHistory = async (userId, examType, section) => {
    try {
      let url = `/api/exam-history?userId=${userId}`
      if (examType && examType !== 'all') url += `&examType=${examType}`
      if (section && section !== 'all') url += `&section=${section}`
      
      const res = await fetch(url)
      const data = await res.json()
      setHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = (exam, section) => {
    setFilterExam(exam)
    setFilterSection(section)
    if (user?.id) {
      setLoading(true)
      fetchHistory(user.id, exam, section)
    }
  }

  const scoreColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500'
  const scoreBg = (s) => s >= 80 ? 'bg-green-50' : s >= 60 ? 'bg-yellow-50' : 'bg-red-50'

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 1) return 'เมื่อกี้'
    if (mins < 60) return `${mins} นาทีก่อน`
    if (hours < 24) return `${hours} ชม.ก่อน`
    if (days < 7) return `${days} วันก่อน`
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  }

  const getExamMeta = (examType) => EXAM_META[examType] || { emoji: '📝', name: examType }

  // Stats
  const totalExams = history.length
  const avgScore = totalExams > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / totalExams) : 0
  const totalCorrect = history.reduce((s, h) => s + (h.correctCount || 0), 0)
  const totalQuestions = history.reduce((s, h) => s + (h.totalQuestions || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 20px))' }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 pt-12 pb-8 lg:pb-12 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-4xl font-black text-white">ความก้าวหน้า</h1>
          <p className="text-white/70 text-sm lg:text-base font-medium mt-1 lg:mt-2">ประวัติการฝึกสอบทั้งหมด</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-5 lg:pt-8 space-y-4 lg:space-y-6">

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-bold text-gray-400">ทำข้อสอบ</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{totalExams}</p>
              <p className="text-xs text-gray-400 mt-0.5">ชุดข้อสอบ</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs font-bold text-gray-400">คะแนนเฉลี่ย</span>
              </div>
              <p className={`text-3xl font-black ${avgScore > 0 ? scoreColor(avgScore) : 'text-gray-300'}`}>{avgScore > 0 ? `${avgScore}%` : '-'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{totalCorrect}/{totalQuestions} ข้อถูก</p>
            </div>
          </div>
        </motion.div>

        {/* Exam Type Filters */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <p className="font-bold text-gray-500 text-xs">ข้อสอบ</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {EXAM_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => applyFilter(f.key, filterSection)}
                className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                  filterExam === f.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {f.emoji && <span>{f.emoji}</span>}
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section Filters */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {[
              { key: 'all', label: 'ทุก Section' },
              { key: 'reading', icon: BookOpen, label: 'Reading' },
              { key: 'listening', icon: Headphones, label: 'Listening' },
              { key: 'writing', icon: PenTool, label: 'Writing' },
              { key: 'speaking', icon: Mic, label: 'Speaking' },
            ].map(sec => (
              <button
                key={sec.key}
                onClick={() => applyFilter(filterExam, sec.key)}
                className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                  filterSection === sec.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {sec.icon && <sec.icon className="w-3.5 h-3.5" />}
                {sec.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* History List */}
        <div>
          <p className="font-black text-gray-900 mb-3">📋 ประวัติ ({history.length})</p>
          
          {history.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-bold text-gray-900 mb-1">ยังไม่มีประวัติ</p>
              <p className="text-sm text-gray-400 mb-4">เริ่มฝึกสอบเพื่อดูประวัติที่นี่</p>
              <button
                onClick={() => router.push('/practice')}
                className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm active:opacity-80"
              >
                เริ่มฝึกสอบ
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {history.map((item, i) => {
                const SectionIcon = SECTION_ICONS[item.section] || BookOpen
                const examMeta = getExamMeta(item.examType)
                const isExpanded = expandedId === item.id

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {/* Summary Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`w-full bg-white rounded-2xl border-2 shadow-sm p-4 text-left transition-colors ${isExpanded ? 'border-orange-200' : 'border-gray-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${scoreBg(item.score)}`}>
                          <span className="text-xl">{examMeta.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{examMeta.name}</span>
                            <span className="text-xs text-gray-400">· {SECTION_LABELS[item.section] || item.section}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.completedAt)} · {item.correctCount}/{item.totalQuestions} ข้อถูก</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <p className={`text-xl font-black ${scoreColor(item.score)}`}>{item.score}%</p>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isExpanded && item.questions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white border-2 border-t-0 border-gray-100 rounded-b-2xl px-4 pb-4 space-y-3 -mt-2 pt-4">
                            {item.questions.map((q, qi) => (
                              <div key={qi} className={`rounded-xl p-3 ${q.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                                <div className="flex items-start gap-2 mb-2">
                                  {q.isCorrect 
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  }
                                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{q.question || q.sentence || `ข้อ ${qi + 1}`}</p>
                                </div>
                                
                                <div className="ml-6 space-y-1">
                                  <div className="flex gap-2 text-xs">
                                    <span className="text-gray-500 font-medium">คำตอบ:</span>
                                    <span className={`font-bold ${q.isCorrect ? 'text-green-700' : 'text-red-700'} line-clamp-1`}>
                                      {q.type === 'writing' ? `${(q.userAnswer || '').split(/\s+/).filter(w=>w).length} คำ` : (q.userAnswer || '-')}
                                    </span>
                                  </div>
                                  {!q.isCorrect && q.correctAnswer && q.correctAnswer !== '-' && (
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-gray-500 font-medium">เฉลย:</span>
                                      <span className="font-bold text-green-700">{q.correctAnswer}</span>
                                    </div>
                                  )}
                                  {q.aiScore && (
                                    <div className="mt-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-600">AI Score</span>
                                        <span className="text-lg font-black text-orange-500">{q.aiScore.score}</span>
                                      </div>
                                      {q.aiScore.feedback && (
                                        <p className="text-xs text-gray-600 leading-relaxed">{q.aiScore.feedback}</p>
                                      )}
                                      {q.aiScore.strengths?.length > 0 && (
                                        <div className="mt-1.5">
                                          <p className="text-xs font-bold text-green-600 mb-0.5">จุดแข็ง:</p>
                                          {q.aiScore.strengths.map((s, si) => (
                                            <p key={si} className="text-xs text-gray-600 ml-2">• {s}</p>
                                          ))}
                                        </div>
                                      )}
                                      {q.aiScore.improvements?.length > 0 && (
                                        <div className="mt-1.5">
                                          <p className="text-xs font-bold text-orange-600 mb-0.5">ควรปรับปรุง:</p>
                                          {q.aiScore.improvements.map((imp, ii) => (
                                            <p key={ii} className="text-xs text-gray-600 ml-2">• {imp}</p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Retry Button */}
                            <button
                              onClick={() => router.push(`/?exam=${item.examType.toLowerCase()}&section=${item.section}`)}
                              className="w-full bg-orange-50 text-orange-600 font-bold py-3 rounded-xl text-sm active:opacity-70"
                            >
                              🔄 ฝึกอีกครั้ง
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
