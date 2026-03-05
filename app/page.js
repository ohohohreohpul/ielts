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
  const [loadingTip, setLoadingTip] = useState(0)
  const [scoring, setScoring] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? (completedQuestions / questions.length) * 100 : 0

  const startSectionSelection = () => {
    if (selectedGoal) setStage('sectionSelect')
  }

  const startLesson = async (section) => {
    setSelectedSection(section)
    setLoading(true)
    setLoadingTip(0)
    
    // Animate tips while loading
    const tipInterval = setInterval(() => {
      setLoadingTip(prev => (prev + 1) % 4)
    }, 2000)
    
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: selectedGoal === 'toeic' ? 'TOEIC' : 'IELTS',
          section: section,
          count: 5
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate questions')
      }

      const data = await response.json()
      clearInterval(tipInterval)
      setQuestions(data.questions || [])
      setStage('lesson')
    } catch (error) {
      clearInterval(tipInterval)
      alert(`เกิดข้อผิดพลาด: ${error.message}\n\nกรุณาตั้งค่า Gemini API Key ที่หน้า Admin`)
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
    
    const tips = {
      reading: ['อ่านคำถามก่อนอ่านบทความ', 'ใช้เทคนิค Skimming และ Scanning', 'จับใจความสำคัญของแต่ละย่อหน้า', 'อย่าติดอยู่กับคำที่ไม่รู้จัก'],
      listening: ['อ่านคำถามให้ทันก่อนเสียงเริ่ม', 'จดบันทึกคำสำคัญขณะฟัง', 'ระวังคำพ้อง (synonyms)', 'อย่าหยุดคิดนาน - ไปข้อต่อไปเลย'],
      writing: ['วางแผนโครงร่างก่อนเขียน', 'ใช้เวลาวางแผน เขียน และตรวจ', 'ใช้ linking words เชื่อมประโยค', 'เขียนให้ครบตามจำนวนคำ'],
      speaking: ['ใช้เวลาเตรียมอย่างเต็มที่', 'พูดชัดเจนและช้าพอ', 'ขยายความคำตอบ', 'อย่ากลัวพูดผิด']
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Button variant="ghost" onClick={() => setStage('onboarding')} className="mb-6">← กลับ</Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedGoalData.title}</h1>
            <p className="text-gray-600">เลือกส่วนที่ต้องการฝึก</p>
          </div>

          {!loading && (
            <div className="space-y-4">
              {selectedGoalData.sections.map((section, index) => {
                const sectionInfo = SECTION_INFO[section]
                return (
                  <motion.div key={section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-gray-200 border-2 border-transparent" onClick={() => startLesson(section)}>
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
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-8">
                <Loader2 className="inline-block animate-spin h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">กำลังสร้างคำถามด้วย AI</h2>
                <p className="text-gray-600">กรุณารอสักครู่...</p>
              </div>

              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900 mb-2">เคล็ดลับ:</h3>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={loadingTip}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-700"
                        >
                          {tips[selectedSection]?.[loadingTip] || 'กำลังเตรียมข้อสอบ...'}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
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

  // Lesson Runner
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => setStage('sectionSelect')}>
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-500">{streak}</span>
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
                    <Card key={option.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option.id ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option.correct ? 'border-green-500 bg-green-50' : showFeedback && selectedAnswer === option.id && !option.correct ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option.id)}>
                      <CardContent className="p-6 flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${selectedAnswer === option.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'} ${showFeedback && option.correct ? 'bg-green-500 text-white' : showFeedback && selectedAnswer === option.id && !option.correct ? 'bg-red-500 text-white' : ''}`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Listening with Audio Player */}
            {currentQuestion.type === 'listening' && (
              <div className="space-y-6">
                {currentQuestion.audioText && <AudioPlayer text={currentQuestion.audioText} />}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>

                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <Card key={option.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option.id ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option.correct ? 'border-green-500 bg-green-50' : showFeedback && selectedAnswer === option.id && !option.correct ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option.id)}>
                      <CardContent className="p-6 flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${selectedAnswer === option.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'} ${showFeedback && option.correct ? 'bg-green-500 text-white' : showFeedback && selectedAnswer === option.id && !option.correct ? 'bg-red-500 text-white' : ''}`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in the Blank */}
            {currentQuestion.type === 'fill-in-blank' && (
              <div className="space-y-6">
                {currentQuestion.passage && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.question || 'Complete the sentence'}</h2>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <p className="text-lg text-gray-800 mb-4">{currentQuestion.sentence}</p>
                  </CardContent>
                </Card>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำตอบของคุณ:</label>
                  <Input 
                    value={textAnswer} 
                    onChange={(e) => setTextAnswer(e.target.value)} 
                    placeholder="พิมพ์คำตอบที่นี่..." 
                    className="text-lg p-4"
                    disabled={showFeedback}
                  />
                  {currentQuestion.wordLimit && (
                    <p className="text-sm text-gray-500 mt-2">ไม่เกิน {currentQuestion.wordLimit} คำ</p>
                  )}
                </div>

                {showFeedback && (
                  <Card className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
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
                
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-6">
                    <p className="text-lg text-gray-800">{currentQuestion.statement}</p>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                    <Card key={option} className={`cursor-pointer transition-all hover:shadow-lg ${selectedAnswer === option ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-transparent hover:border-gray-200'} ${showFeedback && option === currentQuestion.correctAnswer ? 'border-green-500 bg-green-50' : showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-50' : ''}`} onClick={() => !showFeedback && setSelectedAnswer(option)}>
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
                  <Card className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
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
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <PenTool className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">{currentQuestion.task || 'Writing Task'}</span>
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
                    จำนวนคำ: {writingAnswer.split(/\\s+/).filter(w => w).length}
                  </p>
                </div>

                {showFeedback && aiScore && (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">คะแนน AI</h3>
                        <div className="text-4xl font-bold text-blue-600">{aiScore.score}</div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Feedback:</h4>
                          <p className="text-gray-700">{aiScore.feedback}</p>
                        </div>
                        
                        {aiScore.strengths && aiScore.strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">จุดแข็ง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.strengths.map((s, i) => (
                                <li key={i} className="text-gray-700">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {aiScore.improvements && aiScore.improvements.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-orange-700 mb-2">ควรปรับปรุง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.improvements.map((imp, i) => (
                                <li key={i} className="text-gray-700">{imp}</li>
                              ))}
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
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-orange-900">{currentQuestion.part || 'Speaking Part'}</span>
                    </div>
                    <p className="text-lg text-gray-800 mb-4">{currentQuestion.question}</p>
                    {currentQuestion.preparationTime && (
                      <p className="text-sm text-gray-600">
                        เวลาเตรียม: {currentQuestion.preparationTime} วินาที | เวลาพูด: {currentQuestion.speakingTime} วินาที
                      </p>
                    )}
                  </CardContent>
                </Card>

                <VoiceRecorder onRecordingComplete={(blob) => setRecordedAudio(blob)} />

                {showFeedback && aiScore && (
                  <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">คะแนน AI</h3>
                        <div className="text-4xl font-bold text-orange-600">{aiScore.score}</div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Feedback:</h4>
                          <p className="text-gray-700">{aiScore.feedback}</p>
                        </div>
                        
                        {aiScore.strengths && aiScore.strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-green-700 mb-2">จุดแข็ง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.strengths.map((s, i) => (
                                <li key={i} className="text-gray-700">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {aiScore.improvements && aiScore.improvements.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-orange-700 mb-2">ควรปรับปรุง:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {aiScore.improvements.map((imp, i) => (
                                <li key={i} className="text-gray-700">{imp}</li>
                              ))}
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
                (currentQuestion.type === 'listening' && !selectedAnswer) ||
                (currentQuestion.type === 'fill-in-blank' && !textAnswer.trim()) ||
                (currentQuestion.type === 'true-false-notgiven' && !selectedAnswer) ||
                (currentQuestion.type === 'short-answer' && !textAnswer.trim()) ||
                (currentQuestion.type === 'writing' && writingAnswer.split(/\\s+/).filter(w => w).length < 50) ||
                (currentQuestion.type === 'speaking' && !recordedAudio)
              }
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50" 
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
                    <div className="flex items-center">
                      {isCorrect ? (
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                          <X className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{isCorrect ? 'ยอดเยี่ยม!' : 'เรียนรู้ต่อไป!'}</h3>
                        <p className="text-sm text-gray-600">{isCorrect ? 'คุณตอบถูกต้อง!' : 'ทบทวนและลองใหม่'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button onClick={nextQuestion} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" size="lg">
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
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">อัพเกรดเป็น Mydemy Plus</DialogTitle>
            <DialogDescription className="text-center">หัวใจของคุณหมดแล้ว! อัพเกรดเพื่อฝึกได้ไม่จำกัด</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-6">
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">รายเดือน</h4>
                    <p className="text-sm text-gray-600">$9.99/เดือน</p>
                  </div>
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />หัวใจไม่จำกัด</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />คะแนนการพูดโดย AI</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />บทเรียนส่วนตัว</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">รายปี</h4>
                    <p className="text-sm text-gray-600">$79.99/ปี</p>
                    <span className="text-xs font-semibold text-green-600">ประหยัด 33%!</span>
                  </div>
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />ทุกฟีเจอร์รายเดือน</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />การสนับสนุนพิเศษ</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />เข้าถึงฟีเจอร์ใหม่ก่อนใคร</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700" onClick={() => alert('ระบบชำระเงินกำลังจะมาเร็วๆ นี้!')}>
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
