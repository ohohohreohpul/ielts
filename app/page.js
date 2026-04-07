'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Heart, Flame, Target, Trophy, Sparkles, X, Check, Crown, Zap, BookOpen, Headphones, PenTool, Mic, Settings as SettingsIcon, Loader as Loader2 } from 'lucide-react'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'
import ExamTimer from '@/components/ExamTimer'
import TimingSummary from '@/components/TimingSummary'
import dynamic from 'next/dynamic'

const ExamChart = dynamic(() => import('@/components/ExamChart'), { ssr: false })

const EXAM_TIME_LIMITS = {
  'TOEIC': { reading: 75 * 60, listening: 45 * 60 },
  'IELTS': { reading: 60 * 60, listening: 30 * 60, writing: 60 * 60, speaking: 15 * 60 },
  'TOEFL': { reading: 54 * 60, listening: 41 * 60, writing: 50 * 60, speaking: 17 * 60 },
  'CU-TEP': { reading: 60 * 60, listening: 30 * 60 },
  'TU-GET': { reading: 60 * 60 },
  'O-NET': { reading: 60 * 60 },
  'กพ.': { reading: 40 * 60 },
  'Grammar': { grammar: 30 * 60 }
}

const GOALS = [
  { id: 'toeic', icon: Target, title: 'TOEIC 700+', description: 'การฟังและการอ่านภาษาอังกฤษธุรกิจ', sections: ['reading', 'listening'] },
  { id: 'ielts', icon: Trophy, title: 'IELTS 7.0+', description: 'การฟัง การอ่าน การเขียน และการพูด', sections: ['listening', 'reading', 'writing', 'speaking'] }
]

const SECTION_INFO = {
  reading: { icon: BookOpen, label: 'การอ่าน', color: 'blue' },
  listening: { icon: Headphones, label: 'การฟัง', color: 'purple' },
  writing: { icon: PenTool, label: 'การเขียน', color: 'orange' },
  speaking: { icon: Mic, label: 'การพูด', color: 'orange' }
}

function AppInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stage, setStage] = useState('init') // init → check auth → lesson or redirect
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [writingAnswer, setWritingAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [aiScore, setAiScore] = useState(null)
  const [hearts, setHearts] = useState(5)
  const [streak, setStreak] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingTip, setLoadingTip] = useState(0)
  const [scoring, setScoring] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [speakingTranscript, setSpeakingTranscript] = useState('')
  const [reorderWords, setReorderWords] = useState([])
  const [answerHistory, setAnswerHistory] = useState([]) // Track answers for history
  const [timeLimit, setTimeLimit] = useState(null)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [questionTimings, setQuestionTimings] = useState([])
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? (completedQuestions / questions.length) * 100 : 0

  // Auth check + URL param handling on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const examParam = searchParams?.get('exam')
    const sectionParam = searchParams?.get('section')

    if (!token) {
      // Not authenticated → go to welcome
      router.push('/welcome')
      return
    }

    if (examParam && sectionParam) {
      // Authenticated + exam params → start lesson directly
      setSelectedGoal(examParam)
      startLesson(sectionParam, examParam)
    } else {
      // Authenticated but no params → go to dashboard
      router.push('/dashboard')
    }
  }, [])

  const startLesson = async (section, examId) => {
    const goalId = examId || selectedGoal
    setSelectedSection(section)
    setLoading(true)
    setLoadingTip(0)
    setStage('loading')
    
    const tipInterval = setInterval(() => {
      setLoadingTip(prev => (prev + 1) % 4)
    }, 2000)
    
    // Retry logic for transient errors
    let lastError = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 1000)) // Wait 1s before retry
        }
        
        // Map goalId to proper examType
        const examTypeMap = {
          'toeic': 'toeic',
          'ielts': 'ielts',
          'grammar': 'grammar',
          'toefl': 'toefl',
          'cutep': 'cutep',
          'tuget': 'tuget',
          'onet': 'onet',
          'ocsc': 'ocsc',
          'gorpor': 'ocsc',
        }
        const examType = examTypeMap[goalId] || goalId.toLowerCase()
        
        const response = await fetch('/api/ai/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examType: examType,
            section: section,
            count: 15  // Generate 15 questions per batch for smoother experience
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to generate questions')
        }

        const data = await response.json()
        
        if (!data.questions || data.questions.length === 0) {
          throw new Error('No questions generated')
        }
        
        clearInterval(tipInterval)
        setQuestions(data.questions)
        const firstQ = data.questions[0]
        if (firstQ?.type === 'reorder' && firstQ?.words) {
          setReorderWords([...firstQ.words].sort(() => Math.random() - 0.5))
        }

        const examTimeLimits = EXAM_TIME_LIMITS[examType] || {}
        const sectionTimeLimit = examTimeLimits[section] || null
        setTimeLimit(sectionTimeLimit)
        setSessionStartTime(Date.now())
        setQuestionStartTime(Date.now())
        setQuestionTimings([])
        setTotalTimeSpent(0)

        setStage('lesson')
        return // Success - exit
      } catch (error) {
        lastError = error
        console.error(`Attempt ${attempt + 1} failed:`, error)
      }
    }
    
    // All retries failed
    clearInterval(tipInterval)
    setStage('error')
    console.error('startLesson error after retries:', lastError)
    setLoading(false)
  }

  // Helper to record answer for history
  const recordAnswer = (correct, userAns, correctAns, scoreData) => {
    const q = currentQuestion
    const record = {
      id: q.id,
      type: q.type,
      question: q.question || q.prompt || q.statement || q.sentence || '',
      passage: q.passage || null,
      userAnswer: userAns,
      correctAnswer: correctAns,
      isCorrect: correct,
      aiScore: scoreData || null,
    }
    setAnswerHistory(prev => [...prev, record])
  }

  const checkAnswer = async () => {
    const qType = currentQuestion.type
    
    if (qType === 'multiple-choice' || qType === 'reading' || qType === 'listening') {
      const selected = currentQuestion.options?.find(opt => opt.id === selectedAnswer)
      const correctOpt = currentQuestion.options?.find(opt => opt.correct)
      const correct = selected?.correct || false
      setIsCorrect(correct)
      recordAnswer(correct, selected?.text || selectedAnswer, correctOpt?.text || '', null)
      setStreak(prev => correct ? prev + 1 : 0)

      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) {
          setShowPaywall(true)
          return
        }
      }
      setShowFeedback(true)
    } else if (qType === 'completion' || qType === 'fill-in-blank') {
      const userAns = textAnswer.trim().toLowerCase()
      const correctAns = currentQuestion.correctAnswer.toLowerCase()
      const correct = userAns === correctAns || userAns.includes(correctAns) || correctAns.includes(userAns)
      setIsCorrect(correct)
      recordAnswer(correct, textAnswer.trim(), currentQuestion.correctAnswer, null)
      setStreak(prev => correct ? prev + 1 : 0)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) { setShowPaywall(true); return }
      }
      setShowFeedback(true)
    } else if (qType === 'true-false-notgiven') {
      const correct = selectedAnswer?.toUpperCase() === currentQuestion.correctAnswer.toUpperCase()
      setIsCorrect(correct)
      recordAnswer(correct, selectedAnswer, currentQuestion.correctAnswer, null)
      setStreak(prev => correct ? prev + 1 : 0)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) { setShowPaywall(true); return }
      }
      setShowFeedback(true)
    } else if (qType === 'short-answer') {
      const correct = textAnswer.trim().toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase())
      setIsCorrect(correct)
      recordAnswer(correct, textAnswer.trim(), currentQuestion.correctAnswer, null)
      setStreak(prev => correct ? prev + 1 : 0)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) { setShowPaywall(true); return }
      }
      setShowFeedback(true)
    } else if (qType === 'reorder') {
      const userOrder = reorderWords.map(w => w.id)
      const correct = JSON.stringify(userOrder) === JSON.stringify(currentQuestion.correctOrder)
      setIsCorrect(correct)
      recordAnswer(correct, userOrder.join(' '), (currentQuestion.correctOrder || []).join(' '), null)
      setStreak(prev => correct ? prev + 1 : 0)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) { setShowPaywall(true); return }
      }
      setShowFeedback(true)
    } else if (qType === 'writing') {
      const wordCount = writingAnswer.trim().split(/\s+/).filter(w => w).length
      const minWords = currentQuestion.wordLimit || 50
      if (wordCount < minWords) {
        alert(`กรุณาเขียนอย่างน้อย ${minWords} คำ (ตอนนี้มี ${wordCount} คำ)`)
        return
      }
      setScoring(true)
      try {
        const response = await fetch('/api/ai/score-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'writing',
            question: currentQuestion.prompt,
            answer: writingAnswer,
            rubric: currentQuestion.rubric
          })
        })
        const scoreData = await response.json()
        setAiScore(scoreData)
        setIsCorrect(scoreData.score >= 6.0)
        recordAnswer(scoreData.score >= 6.0, writingAnswer, '-', scoreData)
      } catch (error) {
        console.error('Scoring error:', error)
        setIsCorrect(true)
        recordAnswer(true, writingAnswer, '-', null)
      } finally {
        setScoring(false)
        setShowFeedback(true)
      }
    } else if (qType === 'speaking') {
      if (!recordedAudio) {
        alert('กรุณาอัดเสียงคำตอบก่อน')
        return
      }
      setScoring(true)
      try {
        const response = await fetch('/api/ai/score-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'speaking',
            question: currentQuestion.question,
            answer: speakingTranscript || '[No transcript available]',
            rubric: currentQuestion.rubric
          })
        })
        const scoreData = await response.json()
        setAiScore(scoreData)
        setIsCorrect(scoreData.score >= 6.0)
        recordAnswer(scoreData.score >= 6.0, '[Audio]', '-', scoreData)
      } catch (error) {
        console.error('Scoring error:', error)
        setIsCorrect(true)
        recordAnswer(true, '[Audio]', '-', null)
      } finally {
        setScoring(false)
        setShowFeedback(true)
      }
    }
  }

  // Save exam history to backend
  const saveExamHistory = async (answers) => {
    try {
      const userData = localStorage.getItem('user')
      const user = userData ? JSON.parse(userData) : null
      if (!user?.id) return

      const correctCount = answers.filter(a => a.isCorrect).length
      const score = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0

      // Map goalId to proper examType for history
      const examTypeMap = {
        'toeic': 'TOEIC',
        'ielts': 'IELTS',
        'grammar': 'Grammar',
        'toefl': 'TOEFL',
        'cutep': 'CU-TEP',
        'tuget': 'TU-GET',
        'onet': 'O-NET',
        'gorpor': 'กพ.'
      }
      const examType = examTypeMap[selectedGoal] || selectedGoal?.toUpperCase() || 'Unknown'

      await fetch('/api/exam-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          examType: examType,
          section: selectedSection,
          questions: answers,
          totalQuestions: answers.length,
          correctCount,
          score
        })
      })
    } catch (err) {
      console.error('Failed to save exam history:', err)
    }
  }

  const nextQuestion = () => {
    const questionEndTime = Date.now()
    const timeSpent = Math.round((questionEndTime - questionStartTime) / 1000)

    const lastAnswer = answerHistory[answerHistory.length - 1]
    setQuestionTimings(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      timeSpent,
      isCorrect: lastAnswer?.isCorrect || false
    }])

    setCompletedQuestions(completedQuestions + 1)

    if (currentQuestionIndex < questions.length - 1) {
      // Still have questions in current batch
      const nextIdx = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIdx)
      setSelectedAnswer(null)
      setTextAnswer('')
      setWritingAnswer('')
      setRecordedAudio(null)
      setSpeakingTranscript('')
      setAiScore(null)
      setShowFeedback(false)
      setQuestionStartTime(Date.now())
      const nextQ = questions[nextIdx]
      if (nextQ?.type === 'reorder' && nextQ?.words) {
        setReorderWords([...nextQ.words].sort(() => Math.random() - 0.5))
      } else {
        setReorderWords([])
      }
    } else {
      // Finished current batch - calculate total time
      const totalTime = Math.round((questionEndTime - sessionStartTime) / 1000)
      setTotalTimeSpent(totalTime)

      saveExamHistory(answerHistory)
      setStage('complete')
    }
  }

  // Fetch more questions without resetting progress (continuous mode)
  const fetchMoreQuestions = async () => {
    setLoading(true)
    setStage('loading')
    setLoadingTip(0)
    
    const tipInterval = setInterval(() => {
      setLoadingTip(prev => (prev + 1) % 4)
    }, 2000)
    
    try {
      const examTypeMap = {
        'toeic': 'TOEIC',
        'ielts': 'IELTS',
        'grammar': 'Grammar',
        'toefl': 'TOEFL',
        'cutep': 'CU-TEP',
        'tuget': 'TU-GET',
        'onet': 'O-NET',
        'gorpor': 'กพ.'
      }
      const examType = examTypeMap[selectedGoal] || selectedGoal?.toUpperCase()
      
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: examType,
          section: selectedSection,
          count: 15  // Generate 15 questions per batch
        })
      })

      if (!response.ok) throw new Error('Failed to fetch more questions')
      
      const data = await response.json()
      
      if (data.questions && data.questions.length > 0) {
        clearInterval(tipInterval)
        setQuestions(data.questions)
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setTextAnswer('')
        setWritingAnswer('')
        setRecordedAudio(null)
        setAiScore(null)
        setShowFeedback(false)
        setAnswerHistory([])
        setSessionStartTime(Date.now())
        setQuestionStartTime(Date.now())
        setQuestionTimings([])
        setStage('lesson')
      } else {
        throw new Error('No questions received')
      }
    } catch (error) {
      clearInterval(tipInterval)
      console.error('Error fetching more questions:', error)
      // On error, go to complete screen instead
      setStage('complete')
    }
    setLoading(false)
  }

  const restartLesson = () => {
    router.push('/practice')
  }

  // Init / Loading state
  if (stage === 'init') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#1B3F7A]" />
      </div>
    )
  }

  // Loading state
  if (stage === 'loading') {
    const tips = {
      reading: ['อ่านคำถามก่อนอ่านบทความ', 'ใช้เทคนิค Skimming และ Scanning', 'จับใจความสำคัญของแต่ละย่อหน้า', 'อย่าติดอยู่กับคำที่ไม่รู้จัก'],
      listening: ['อ่านคำถามให้ทันก่อนเสียงเริ่ม', 'จดบันทึกคำสำคัญขณะฟัง', 'ระวังคำพ้อง (synonyms)', 'อย่าหยุดคิดนาน - ไปข้อต่อไปเลย'],
      writing: ['วางแผนโครงร่างก่อนเขียน', 'ใช้เวลาวางแผน เขียน และตรวจ', 'ใช้ linking words เชื่อมประโยค', 'เขียนให้ครบตามจำนวนคำ'],
      speaking: ['ใช้เวลาเตรียมอย่างเต็มที่', 'พูดชัดเจนและช้าพอ', 'ขยายความคำตอบ', 'อย่ากลัวพูดผิด']
    }

    const sectionIcons = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🎤'
    }

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-6xl mb-6"
          >
            {sectionIcons[selectedSection] || '📝'}
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            กำลังสร้างข้อสอบ
          </h2>
          <p className="text-gray-500 text-sm mb-8">AI กำลังเตรียมคำถามให้คุณ...</p>

          {/* Progress Animation */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-[#1B3F7A] rounded-full"
              initial={{ width: "5%" }}
              animate={{ width: "85%" }}
              transition={{ duration: 12, ease: "easeOut" }}
            />
          </div>

          {/* Tip Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-[#1B3F7A] uppercase tracking-wider mb-2">💡 เคล็ดลับ</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingTip}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-gray-700 font-medium text-sm leading-relaxed"
              >
                {tips[selectedSection]?.[loadingTip] || 'กำลังเตรียมข้อสอบ...'}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (stage === 'error') {
    return (
      <div className="min-h-screen from-red-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600 mb-8">ไม่สามารถสร้างคำถามได้ กรุณาลองใหม่อีกครั้ง</p>
          <Button onClick={() => router.push('/practice')} className="w-full h-12 hover:hover:" size="lg">
            กลับไปเลือกข้อสอบ
          </Button>
        </motion.div>
      </div>
    )
  }

  // Complete - show stats and options to continue or stop
  if (stage === 'complete') {
    const xpEarned = completedQuestions * 10
    const correctCount = answerHistory.filter(a => a.isCorrect).length
    const accuracy = completedQuestions > 0 ? Math.round((correctCount / completedQuestions) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-20">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#2B5BA8] to-[#152E5A] rounded-full mb-6 shadow-xl"
            >
              <Trophy className="w-14 h-14 text-white" />
            </motion.div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">ยอดเยี่ยม! 🎉</h1>
            <p className="text-gray-500 mb-6">คุณทำเสร็จแล้ว {completedQuestions} ข้อ</p>

            <Card className="bg-white rounded-2xl p-5 shadow-lg mb-6 border-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-black text-[#152E5A] mb-1">{completedQuestions}</div>
                  <div className="text-xs text-gray-500 font-medium">ข้อที่ทำ</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-2xl font-black text-green-600 mb-1">{accuracy}%</div>
                  <div className="text-xs text-gray-500 font-medium">ความแม่นยำ</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-black text-purple-600 mb-1">{streak}</div>
                  <div className="text-xs text-gray-500 font-medium">🔥 Streak</div>
                </div>
              </div>
            </Card>

            {questionTimings.length > 0 && (
              <div className="mb-6 text-left">
                <TimingSummary
                  questionTimings={questionTimings}
                  totalTime={totalTimeSpent}
                />
              </div>
            )}

            <div className="space-y-3">
              {/* Back to practice selection */}
              <Button
                onClick={restartLesson}
                className="w-full h-14 text-lg font-bold bg-[#1B3F7A] hover:bg-[#152E5A]"
                size="lg"
              >
                เลือกข้อสอบอื่น
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Lesson Runner
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Loader2 className="animate-spin h-8 w-8 text-[#1B3F7A]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/practice')}>
              <X className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3">
              {timeLimit && (
                <ExamTimer
                  timeLimit={timeLimit}
                  onTimeUp={() => {
                    alert('หมดเวลา! กำลังสรุปผล...')
                    setStage('complete')
                  }}
                  isPaused={showFeedback}
                  showWarningAt={300}
                />
              )}

              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-[#1B3F7A]" />
                <span className="font-bold text-[#1B3F7A]">{streak}</span>
              </div>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            
            {/* Reading with Multiple Choice */}
            {currentQuestion.type === 'reading' && (
              <div className="space-y-6">
                {currentQuestion.passage && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>

                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <Card key={option.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option.id ? 'border-2 border-blue-200 bg-[#1B3F7A]' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option.correct ? 'border-[#1B3F7A] bg-blue-50' : showFeedback && selectedAnswer === option.id && !option.correct ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option.id)}>
                      <CardContent className="p-6 flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${selectedAnswer === option.id ? 'bg-[#1B3F7A] text-white' : 'bg-gray-100 text-gray-600'} ${showFeedback && option.correct ? 'bg-[#1B3F7A] text-white' : showFeedback && selectedAnswer === option.id && !option.correct ? 'bg-red-500 text-white' : ''}`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Multiple Choice (standalone) */}
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-6">
                {currentQuestion.passage && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                {currentQuestion.sentence && (
                  <Card className="bg-[#1B3F7A] border-blue-200">
                    <CardContent className="p-6">
                      <p className="text-lg text-gray-800">{currentQuestion.sentence}</p>
                    </CardContent>
                  </Card>
                )}

                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.question || 'Choose the best option:'}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <Card key={option.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option.id ? 'border-2 border-blue-200 bg-[#1B3F7A]' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option.correct ? 'border-[#1B3F7A] bg-blue-50' : showFeedback && selectedAnswer === option.id && !option.correct ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option.id)}>
                      <CardContent className="p-6 flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${selectedAnswer === option.id ? 'bg-[#1B3F7A] text-white' : 'bg-gray-100 text-gray-600'} ${showFeedback && option.correct ? 'bg-[#1B3F7A] text-white' : showFeedback && selectedAnswer === option.id && !option.correct ? 'bg-red-500 text-white' : ''}`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reorder / Sentence arrangement */}
            {currentQuestion.type === 'reorder' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">{currentQuestion.question || 'เรียงคำให้ถูกต้อง:'}</h2>
                <p className="text-sm text-gray-500">กดที่คำเพื่อย้ายขึ้น/ลงในลำดับ</p>

                {/* Current arrangement */}
                <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  {reorderWords.map((word, idx) => (
                    <button
                      key={word.id}
                      disabled={showFeedback}
                      onClick={() => {
                        if (idx > 0) {
                          const newWords = [...reorderWords]
                          ;[newWords[idx - 1], newWords[idx]] = [newWords[idx], newWords[idx - 1]]
                          setReorderWords(newWords)
                        }
                      }}
                      className="px-3 py-2 bg-white border-2 border-blue-300 rounded-lg font-medium text-gray-800 hover:bg-blue-50 hover:border-[#1B3F7A] transition-all cursor-pointer disabled:cursor-default"
                    >
                      {word.text}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-400 text-center">กดคำเพื่อขยับไปทางซ้าย · ลำดับปัจจุบัน: {reorderWords.map(w => w.text).join(' → ')}</p>

                {showFeedback && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm font-medium text-green-700">ลำดับที่ถูกต้อง:</p>
                    <p className="text-sm text-green-800 mt-1">
                      {(currentQuestion.correctOrder || [])
                        .map(id => currentQuestion.words?.find(w => w.id === id)?.text)
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Listening with Audio Player */}
            {currentQuestion.type === 'listening' && (
              <div className="space-y-6">
                {/* Always show AudioPlayer for listening questions - use audioText or question as fallback */}
                <AudioPlayer text={currentQuestion.audioText || currentQuestion.question || 'No audio available'} />
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>

                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <Card key={option.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option.id ? 'border-2 border-blue-200 bg-[#1B3F7A]' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option.correct ? 'border-[#1B3F7A] bg-blue-50' : showFeedback && selectedAnswer === option.id && !option.correct ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option.id)}>
                      <CardContent className="p-6 flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${selectedAnswer === option.id ? 'bg-[#1B3F7A] text-white' : 'bg-gray-100 text-gray-600'} ${showFeedback && option.correct ? 'bg-[#1B3F7A] text-white' : showFeedback && selectedAnswer === option.id && !option.correct ? 'bg-red-500 text-white' : ''}`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {currentQuestion.sentence && !currentQuestion.options && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">คำตอบของคุณ:</label>
                    <Input 
                      value={textAnswer} 
                      onChange={(e) => setTextAnswer(e.target.value)} 
                      placeholder="พิมพ์คำตอบที่นี่..." 
                      className="text-lg p-4"
                      disabled={showFeedback}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Completion / Fill-in-Blank */}
            {(currentQuestion.type === 'completion' || currentQuestion.type === 'fill-in-blank') && (
              <div className="space-y-6">
                {currentQuestion.passage && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.question || 'Complete the sentence'}
                </h2>
                
                {currentQuestion.sentence && (
                  <Card className="bg-[#1B3F7A] border-blue-200">
                    <CardContent className="p-6">
                      <p className="text-lg text-gray-800 mb-4 whitespace-pre-wrap">{currentQuestion.sentence}</p>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำตอบของคุณ:</label>
                  <Input 
                    value={textAnswer} 
                    onChange={(e) => setTextAnswer(e.target.value)} 
                    placeholder={currentQuestion.wordLimit ? `ไม่เกิน ${currentQuestion.wordLimit} คำ` : "พิมพ์คำตอบที่นี่..."} 
                    className="text-lg p-4"
                    disabled={showFeedback}
                  />
                  {currentQuestion.wordLimit && (
                    <p className="text-sm text-gray-500 mt-2">
                      ตอบด้วย NO MORE THAN {currentQuestion.wordLimit === 1 ? 'ONE WORD' : `${currentQuestion.wordLimit} WORDS`}
                    </p>
                  )}
                </div>

                {showFeedback && (
                  <Card className={`${isCorrect ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-700">คำตอบที่ถูกต้อง:</p>
                      <p className="text-lg font-semibold">{currentQuestion.correctAnswer}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* True/False/Not Given */}
            {currentQuestion.type === 'true-false-notgiven' && (
              <div className="space-y-6">
                {currentQuestion.passage && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อความนี้ถูกต้องหรือไม่?</h2>
                
                <Card className="bg-[#1B3F7A] border-gray-200">
                  <CardContent className="p-6">
                    <p className="text-lg text-gray-800">{currentQuestion.statement}</p>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                    <Card key={option} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option ? 'border-2 border-blue-200 bg-[#1B3F7A]' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option === currentQuestion.correctAnswer ? 'border-[#1B3F7A] bg-blue-50' : showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option)}>
                      <CardContent className="p-6 text-center">
                        <span className="text-lg font-semibold">{option}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.type === 'short-answer' && (
              <div className="space-y-6">
                {currentQuestion.passage && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำตอบของคุณ:</label>
                  <Input 
                    value={textAnswer} 
                    onChange={(e) => setTextAnswer(e.target.value)} 
                    placeholder="พิมพ์คำตอบสั้นๆ..." 
                    className="text-lg p-4"
                    disabled={showFeedback}
                  />
                  {currentQuestion.wordLimit && (
                    <p className="text-sm text-gray-500 mt-2">ตอบไม่เกิน {currentQuestion.wordLimit} คำ</p>
                  )}
                </div>

                {showFeedback && (
                  <Card className={`${isCorrect ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-700">คำตอบที่ถูกต้อง:</p>
                      <p className="text-lg font-semibold">{currentQuestion.correctAnswer}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Writing */}
            {currentQuestion.type === 'writing' && (
              <div className="space-y-6">
                {/* Chart for Task 1 */}
                {currentQuestion.chartData && (
                  <ExamChart chartData={currentQuestion.chartData} />
                )}

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <PenTool className="w-5 h-5 text-[#152E5A]" />
                      <span className="font-semibold text-blue-900">{currentQuestion.task || 'Writing Task'}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{currentQuestion.prompt}</p>
                    {currentQuestion.wordLimit && (
                      <p className="text-sm text-gray-600 mt-3">จำนวนคำ: ขั้นต่ำ {currentQuestion.wordLimit} คำ</p>
                    )}
                  </CardContent>
                </Card>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำตอบของคุณ:</label>
                  <Textarea 
                    value={writingAnswer} 
                    onChange={(e) => setWritingAnswer(e.target.value)} 
                    placeholder="เริ่มเขียนที่นี่..." 
                    className="min-h-[300px] text-base"
                    disabled={showFeedback}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    จำนวนคำ: {writingAnswer.split(/\s+/).filter(w => w).length}
                  </p>
                </div>

                {showFeedback && aiScore && (
                  <Card className="border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">คะแนน AI</h3>
                        <div className="text-4xl font-bold text-[#1B3F7A]">{aiScore.score}</div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Feedback:</h4>
                          <p className="text-gray-700">{aiScore.feedback}</p>
                        </div>
                        {aiScore.strengths?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">จุดแข็ง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.strengths.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {aiScore.improvements?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">ควรปรับปรุง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.improvements.map((imp, i) => <li key={i} className="text-gray-700">{imp}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Speaking */}
            {currentQuestion.type === 'speaking' && (
              <div className="space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="w-5 h-5 text-[#152E5A]" />
                      <span className="font-semibold text-blue-900">{currentQuestion.part || 'Speaking Part'}</span>
                    </div>
                    <p className="text-lg text-gray-800 mb-4">{currentQuestion.question}</p>
                    {currentQuestion.preparationTime > 0 && (
                      <p className="text-sm text-gray-600">
                        เวลาเตรียม: {currentQuestion.preparationTime} วินาที | เวลาพูด: {currentQuestion.speakingTime} วินาที
                      </p>
                    )}
                  </CardContent>
                </Card>

                <VoiceRecorder
                  onRecordingComplete={(blob, transcript) => {
                    setRecordedAudio(blob)
                    setSpeakingTranscript(transcript || '')
                  }}
                  hasRecording={!!recordedAudio}
                />

                {showFeedback && aiScore && (
                  <Card className="border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">คะแนน AI</h3>
                        <div className="text-4xl font-bold text-[#152E5A]">{aiScore.score}</div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Feedback:</h4>
                          <p className="text-gray-700">{aiScore.feedback}</p>
                        </div>
                        {aiScore.strengths?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">จุดแข็ง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.strengths.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {aiScore.improvements?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">ควรปรับปรุง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.improvements.map((imp, i) => <li key={i} className="text-gray-700">{imp}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          {!showFeedback ? (
            <Button 
              onClick={checkAnswer} 
              disabled={
                scoring ||
                (currentQuestion.type === 'multiple-choice' && !selectedAnswer) ||
                (currentQuestion.type === 'reading' && !selectedAnswer) ||
                (currentQuestion.type === 'listening' && !selectedAnswer && !textAnswer.trim()) ||
                ((currentQuestion.type === 'fill-in-blank' || currentQuestion.type === 'completion') && !textAnswer.trim()) ||
                (currentQuestion.type === 'true-false-notgiven' && !selectedAnswer) ||
                (currentQuestion.type === 'short-answer' && !textAnswer.trim()) ||
                (currentQuestion.type === 'writing' && writingAnswer.split(/\s+/).filter(w => w).length < (currentQuestion.wordLimit || 50)) ||
                (currentQuestion.type === 'speaking' && !recordedAudio) ||
                (currentQuestion.type === 'reorder' && reorderWords.length === 0)
              }
              className="w-full h-14 text-lg font-semibold hover:hover:disabled:opacity-50" 
              size="lg"
            >
              {scoring ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  กำลังให้คะแนนด้วย AI...
                </>
              ) : (
                'ตรวจคำตอบ'
              )}
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {!aiScore && (
                <Card className={`mb-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      {isCorrect ? (
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <X className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{isCorrect ? 'ยอดเยี่ยม!' : 'เกือบแล้ว!'}</h3>
                        
                        {/* Show correct answer if wrong */}
                        {!isCorrect && currentQuestion.options && (
                          <p className="text-sm text-gray-700 mt-1">
                            คำตอบที่ถูกต้อง: <span className="font-bold text-green-600">
                              {currentQuestion.options.find(o => o.correct)?.text}
                            </span>
                          </p>
                        )}
                        
                        {/* Show explanation if available */}
                        {currentQuestion.explanation && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-[#1B3F7A] uppercase mb-1">💡 อธิบาย</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
                          </div>
                        )}
                        
                        {/* Show correct answer for completion/short-answer */}
                        {(currentQuestion.type === 'completion' || currentQuestion.type === 'short-answer' || currentQuestion.type === 'true-false-notgiven') && !isCorrect && currentQuestion.correctAnswer && (
                          <p className="text-sm text-gray-700 mt-2">
                            คำตอบที่ถูกต้อง: <span className="font-bold text-green-600">{currentQuestion.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button onClick={nextQuestion} className="w-full h-14 text-lg font-semibold hover:hover:" size="lg">
                ดำเนินการต่อ
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <p className="text-5xl">🐱</p>
            </div>
            <DialogTitle className="text-center text-2xl">kedikedi Plus</DialogTitle>
            <DialogDescription className="text-center">หัวใจหมดแล้ว! อัพเกรดเพื่อฝึกได้ไม่จำกัด</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-6">
            <Card className="border-2 border-[#1B3F7A] bg-[#1B3F7A]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-black text-yellow-300 bg-yellow-300/20 px-2 py-0.5 rounded-full">ประหยัด 45%</span>
                    <h4 className="font-bold text-lg text-white mt-1">รายปี</h4>
                    <p className="text-white/70 text-sm">฿990/ปี (฿83/เดือน)</p>
                  </div>
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <ul className="space-y-2 text-sm text-white/90">
                  <li className="flex items-center"><Check className="w-4 h-4 text-yellow-300 mr-2" />ข้อสอบทั้งหมด IELTS, TOEFL, CU-TEP ฯลฯ</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-yellow-300 mr-2" />หัวใจไม่จำกัด</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-yellow-300 mr-2" />AI Scoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">รายเดือน</h4>
                    <p className="text-sm text-gray-500">฿149/เดือน</p>
                  </div>
                  <Zap className="w-6 h-6 text-[#1B3F7A]" />
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><Check className="w-4 h-4 text-[#152E5A] mr-2" />ข้อสอบทั้งหมด</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-[#152E5A] mr-2" />หัวใจไม่จำกัด</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button className="w-full hover:hover:" onClick={() => alert('ระบบชำระเงินกำลังจะมาเร็วๆ นี้!')}>
              เริ่มทดลองใช้ฟรี
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setShowPaywall(false); setHearts(5); }}>
              ภายหลัง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#1B3F7A]" />
      </div>
    }>
      <AppInner />
    </Suspense>
  )
}