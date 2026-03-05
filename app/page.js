'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Heart, Flame, Target, Trophy, Sparkles, X, Check, Crown, Zap, BookOpen, Headphones, PenTool, Mic, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import AudioPlayer from '@/components/AudioPlayer'
import VoiceRecorder from '@/components/VoiceRecorder'
import PreloaderScreen from '@/components/PreloaderScreen'

const GOALS = [
  { id: 'toeic', icon: Target, title: 'TOEIC 700+', description: 'การฟังและการอ่านภาษาอังกฤษธุรกิจ', sections: ['reading', 'listening'] },
  { id: 'ielts', icon: Trophy, title: 'IELTS 7.0+', description: 'การฟัง การอ่าน การเขียน และการพูด', sections: ['listening', 'reading', 'writing', 'speaking'] }
]

const SECTION_INFO = {
  reading: { icon: BookOpen, label: 'การอ่าน', color: 'blue' },
  listening: { icon: Headphones, label: 'การฟัง', color: 'purple' },
  writing: { icon: PenTool, label: 'การเขียน', color: 'green' },
  speaking: { icon: Mic, label: 'การพูด', color: 'orange' }
}

export default function App() {
  const [stage, setStage] = useState('onboarding')
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
  const [streak, setStreak] = useState(3)
  const [showPaywall, setShowPaywall] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState(0)
  const [loading, setLoading] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [showPreloader, setShowPreloader] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? (completedQuestions / questions.length) * 100 : 0

  const startSectionSelection = () => {
    if (selectedGoal) setStage('sectionSelect')
  }

  const startLesson = async (section) => {
    setSelectedSection(section)
    setShowPreloader(true)
  }

  const handlePreloaderComplete = async () => {
    setShowPreloader(false)
    setLoading(true)
    
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: selectedGoal === 'toeic' ? 'TOEIC' : 'IELTS',
          section: selectedSection,
          count: 5
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate questions')
      }

      const data = await response.json()
      setQuestions(data.questions || [])
      setStage('lesson')
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}\n\nกรุณาตั้งค่า Gemini API Key ที่หน้า Admin`)
      setStage('sectionSelect')
    } finally {
      setLoading(false)
    }
  }

  const checkAnswer = async () => {
    const qType = currentQuestion.type
    
    if (qType === 'multiple-choice' || qType === 'reading' || qType === 'listening') {
      const selected = currentQuestion.options?.find(opt => opt.id === selectedAnswer)
      const correct = selected?.correct || false
      setIsCorrect(correct)
      
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) {
          setShowPaywall(true)
          return
        }
      }
      setShowFeedback(true)
    } else if (qType === 'fill-in-blank') {
      const correct = textAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
      setIsCorrect(correct)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) {
          setShowPaywall(true)
          return
        }
      }
      setShowFeedback(true)
    } else if (qType === 'true-false-notgiven') {
      const correct = selectedAnswer?.toUpperCase() === currentQuestion.correctAnswer.toUpperCase()
      setIsCorrect(correct)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) {
          setShowPaywall(true)
          return
        }
      }
      setShowFeedback(true)
    } else if (qType === 'short-answer') {
      const correct = textAnswer.trim().toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase())
      setIsCorrect(correct)
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) {
          setShowPaywall(true)
          return
        }
      }
      setShowFeedback(true)
    } else if (qType === 'writing') {
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
      } catch (error) {
        console.error('Scoring error:', error)
        setIsCorrect(true)
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
        // For now, use placeholder text. In production, convert audio to text first
        const response = await fetch('/api/ai/score-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'speaking',
            question: currentQuestion.question,
            answer: '[Audio transcription would go here]',
            rubric: currentQuestion.rubric
          })
        })
        const scoreData = await response.json()
        setAiScore(scoreData)
        setIsCorrect(scoreData.score >= 6.0)
      } catch (error) {
        console.error('Scoring error:', error)
        setIsCorrect(true)
      } finally {
        setScoring(false)
        setShowFeedback(true)
      }
    }
  }

  const nextQuestion = () => {
    setCompletedQuestions(completedQuestions + 1)
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setTextAnswer('')
      setWritingAnswer('')
      setRecordedAudio(null)
      setAiScore(null)
      setShowFeedback(false)
    } else {
      setStage('complete')
    }
  }

  const restartLesson = () => {
    setStage('sectionSelect')
    setCurrentQuestionIndex(0)
    setCompletedQuestions(0)
    setSelectedAnswer(null)
    setTextAnswer('')
    setWritingAnswer('')
    setRecordedAudio(null)
    setAiScore(null)
    setShowFeedback(false)
    setQuestions([])
  }

  // Onboarding
  if (stage === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mydemy</h1>
            <p className="text-gray-600">ฝึกสอบให้เชี่ยวชาญ ทีละข้อ</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">เลือกเป้าหมายของคุณ</h2>
            {GOALS.map((goal, index) => (
              <motion.div key={goal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedGoal === goal.id ? 'border-2 border-green-500 bg-green-50' : 'border-2 border-transparent hover:border-gray-200'}`} onClick={() => setSelectedGoal(goal.id)}>
                  <CardContent className="flex items-center p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedGoal === goal.id ? 'bg-green-500' : 'bg-gray-100'}`}>
                      <goal.icon className={`w-6 h-6 ${selectedGoal === goal.id ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    {selectedGoal === goal.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button onClick={startSectionSelection} disabled={!selectedGoal} className="w-full mt-8 h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50" size="lg">เริ่มเรียนรู้</Button>

          <div className="mt-6 text-center">
            <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              ตั้งค่า API Keys
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  // Section Selection
  if (stage === 'sectionSelect') {
    const selectedGoalData = GOALS.find(g => g.id === selectedGoal)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Button variant="ghost" onClick={() => setStage('onboarding')} className="mb-6">← กลับ</Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedGoalData.title}</h1>
            <p className="text-gray-600">เลือกส่วนที่ต้องการฝึก</p>
          </div>

          <div className="space-y-4">
            {selectedGoalData.sections.map((section, index) => {
              const sectionInfo = SECTION_INFO[section]
              return (
                <motion.div key={section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-gray-200 border-2 border-transparent" onClick={() => !loading && startLesson(section)}>
                    <CardContent className="flex items-center p-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${sectionInfo.color}-100`}>
                        <sectionInfo.icon className={`w-7 h-7 text-${sectionInfo.color}-600`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{sectionInfo.label}</h3>
                        <p className="text-sm text-gray-600">5 คำถามจาก AI</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {loading && (
            <div className="text-center mt-8">
              <Loader2 className="inline-block animate-spin h-8 w-8 text-green-500" />
              <p className="mt-2 text-gray-600">กำลังโหลด...</p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Preloader
  if (showPreloader) {
    return <PreloaderScreen section={selectedSection} examType={selectedGoal} onComplete={handlePreloaderComplete} />
  }

  // Complete
  if (stage === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8, delay: 0.2 }} className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl">
            <Trophy className="w-16 h-16 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">เสร็จสิ้น!</h1>
          <p className="text-gray-600 mb-8">คุณได้รับ 50 XP</p>

          <Card className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{completedQuestions}</div>
                <div className="text-sm text-gray-600">ข้อที่ทำ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{streak}</div>
                <div className="text-sm text-gray-600">วันติดต่อกัน</div>
              </div>
            </div>
          </Card>

          <Button onClick={restartLesson} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" size="lg">ฝึกอีกครั้ง</Button>
        </motion.div>
      </div>
    )
  }

  // Continue with lesson runner...
  // (Due to length, splitting into next section)
  return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
}
