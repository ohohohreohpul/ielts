'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Heart, Flame, Target, Trophy, Sparkles, X, Check, Crown, Zap } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyedStrategy, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sample questions data
const SAMPLE_LESSON = {
  id: 'lesson-1',
  title: 'TOEIC Grammar Basics',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Choose the correct word to complete the sentence:',
      text: 'The company ____ to expand its operations next year.',
      options: [
        { id: 'a', text: 'plan', correct: false },
        { id: 'b', text: 'plans', correct: true },
        { id: 'c', text: 'planning', correct: false },
        { id: 'd', text: 'planned', correct: false }
      ]
    },
    {
      id: 'q2',
      type: 'reorder',
      question: 'Arrange the words to form a correct sentence:',
      words: [
        { id: 'w1', text: 'meeting', order: 3 },
        { id: 'w2', text: 'The', order: 1 },
        { id: 'w3', text: 'has been', order: 4 },
        { id: 'w4', text: 'postponed', order: 5 },
        { id: 'w5', text: 'scheduled', order: 2 }
      ],
      correctOrder: ['w2', 'w5', 'w1', 'w3', 'w4']
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'Select the best answer:',
      text: 'The manager asked the team ____ the project by Friday.',
      options: [
        { id: 'a', text: 'complete', correct: false },
        { id: 'b', text: 'to complete', correct: true },
        { id: 'c', text: 'completing', correct: false },
        { id: 'd', text: 'completed', correct: false }
      ]
    },
    {
      id: 'q4',
      type: 'reading',
      passage: 'The Riverside Hotel is pleased to announce the opening of our new conference center. The facility features five meeting rooms equipped with the latest technology, including wireless internet and video conferencing capabilities. Booking is now available for corporate events.',
      question: 'What is the main purpose of this announcement?',
      options: [
        { id: 'a', text: 'To advertise hotel rooms', correct: false },
        { id: 'b', text: 'To announce a new conference center', correct: true },
        { id: 'c', text: 'To describe internet services', correct: false },
        { id: 'd', text: 'To promote video conferencing', correct: false }
      ]
    },
    {
      id: 'q5',
      type: 'reorder',
      question: 'Put the words in the correct order:',
      words: [
        { id: 'w1', text: 'important', order: 4 },
        { id: 'w2', text: 'is', order: 2 },
        { id: 'w3', text: 'It', order: 1 },
        { id: 'w4', text: 'to', order: 3 },
        { id: 'w5', text: 'on time', order: 6 },
        { id: 'w6', text: 'arrive', order: 5 }
      ],
      correctOrder: ['w3', 'w2', 'w4', 'w1', 'w6', 'w5']
    }
  ]
}

const GOALS = [
  { id: 'toeic-700', icon: Trophy, title: 'TOEIC 700+', description: 'Business English proficiency' },
  { id: 'ielts-7', icon: Target, title: 'IELTS 7.0+', description: 'Academic excellence' },
  { id: 'cutep-advanced', icon: Sparkles, title: 'CU-TEP Advanced', description: 'University standard' }
]

// Sortable Item Component
function SortableItem({ id, text, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 bg-white border-2 border-gray-200 rounded-xl text-center font-medium cursor-move touch-none select-none ${
        isDragging ? 'opacity-50' : 'hover:border-green-400 hover:shadow-md'
      } transition-all`}
    >
      {text}
    </div>
  )
}

export default function App() {
  const [stage, setStage] = useState('onboarding') // onboarding, lesson, complete
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hearts, setHearts] = useState(5)
  const [streak, setStreak] = useState(3)
  const [showPaywall, setShowPaywall] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState(0)
  const [reorderItems, setReorderItems] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const currentQuestion = SAMPLE_LESSON.questions[currentQuestionIndex]
  const progress = (completedQuestions / SAMPLE_LESSON.questions.length) * 100

  // Initialize reorder items
  useEffect(() => {
    if (currentQuestion?.type === 'reorder') {
      const shuffled = [...currentQuestion.words].sort(() => Math.random() - 0.5)
      setReorderItems(shuffled)
    }
  }, [currentQuestionIndex, currentQuestion])

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId)
  }

  const startLesson = () => {
    if (selectedGoal) {
      setStage('lesson')
    }
  }

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setReorderItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const checkAnswer = () => {
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'reading') {
      const selected = currentQuestion.options.find(opt => opt.id === selectedAnswer)
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
    } else if (currentQuestion.type === 'reorder') {
      const currentOrder = reorderItems.map(item => item.id)
      const correct = JSON.stringify(currentOrder) === JSON.stringify(currentQuestion.correctOrder)
      setIsCorrect(correct)
      
      if (!correct) {
        const newHearts = hearts - 1
        setHearts(newHearts)
        if (newHearts === 0) {
          setShowPaywall(true)
          return
        }
      }
    }
    
    setShowFeedback(true)
  }

  const nextQuestion = () => {
    setCompletedQuestions(completedQuestions + 1)
    
    if (currentQuestionIndex < SAMPLE_LESSON.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setStage('complete')
    }
  }

  const restartLesson = () => {
    setCurrentQuestionIndex(0)
    setCompletedQuestions(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setHearts(5)
    setStage('lesson')
  }

  // Onboarding Screen
  if (stage === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl mb-4 shadow-lg"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mydemy</h1>
            <p className="text-gray-600">Master your exam, one lesson at a time</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">Choose your goal</h2>
            {GOALS.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedGoal === goal.id
                      ? 'border-2 border-green-500 bg-green-50'
                      : 'border-2 border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => handleGoalSelect(goal.id)}
                >
                  <CardContent className="flex items-center p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedGoal === goal.id ? 'bg-green-500' : 'bg-gray-100'
                    }`}>
                      <goal.icon className={`w-6 h-6 ${
                        selectedGoal === goal.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    {selectedGoal === goal.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={startLesson}
            disabled={!selectedGoal}
            className="w-full mt-8 h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
            size="lg"
          >
            Start Learning
          </Button>
        </motion.div>
      </div>
    )
  }

  // Lesson Complete Screen
  if (stage === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl"
          >
            <Trophy className="w-16 h-16 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Lesson Complete!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mb-8"
          >
            You've earned 50 XP
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{completedQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">{streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </motion.div>

          <Button
            onClick={restartLesson}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            size="lg"
          >
            Practice Again
          </Button>
        </motion.div>
      </div>
    )
  }

  // Lesson Runner
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => setStage('onboarding')}>
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-500">{streak}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 ${
                      i < hearts ? 'fill-red-500 text-red-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Multiple Choice */}
            {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'reading') && (
              <div className="space-y-6">
                {currentQuestion.type === 'reading' && (
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                    </CardContent>
                  </Card>
                )}
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentQuestion.question}</h2>
                  {currentQuestion.text && (
                    <p className="text-lg text-gray-700 mb-6">{currentQuestion.text}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedAnswer === option.id
                            ? 'border-2 border-blue-500 bg-blue-50'
                            : 'border-2 border-transparent hover:border-gray-200'
                        } ${
                          showFeedback && option.correct
                            ? 'border-green-500 bg-green-50'
                            : showFeedback && selectedAnswer === option.id && !option.correct
                            ? 'border-red-500 bg-red-50'
                            : ''
                        }`}
                        onClick={() => !showFeedback && handleAnswerSelect(option.id)}
                      >
                        <CardContent className="p-6 flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${
                            selectedAnswer === option.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          } ${
                            showFeedback && option.correct
                              ? 'bg-green-500 text-white'
                              : showFeedback && selectedAnswer === option.id && !option.correct
                              ? 'bg-red-500 text-white'
                              : ''
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-lg">{option.text}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Sentence Reordering */}
            {currentQuestion.type === 'reorder' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentQuestion.question}</h2>
                  <p className="text-gray-600">Drag the words to form a correct sentence</p>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={reorderItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {reorderItems.map((item) => (
                        <SortableItem key={item.id} id={item.id} text={item.text} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {showFeedback && (
                  <Card className={`${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-700">Correct answer:</p>
                      <p className="text-lg">
                        {currentQuestion.correctOrder.map(id => 
                          currentQuestion.words.find(w => w.id === id).text
                        ).join(' ')}
                      </p>
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
                (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'reading') && !selectedAnswer
              }
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              size="lg"
            >
              Check Answer
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`mb-4 ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
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
                      <h3 className="font-bold text-lg">
                        {isCorrect ? 'Excellent!' : 'Keep learning!'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isCorrect ? 'You got it right!' : 'Review and try again'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button
                onClick={nextQuestion}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                size="lg"
              >
                Continue
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
            <DialogTitle className="text-center text-2xl">Upgrade to Mydemy Plus</DialogTitle>
            <DialogDescription className="text-center">
              You've run out of hearts! Get unlimited practice with our premium plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-6">
            <Card className="border-2 border-purple-300 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">Monthly</h4>
                    <p className="text-sm text-gray-600">$9.99/month</p>
                  </div>
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Unlimited Hearts
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    AI Speaking Score
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Personalized Lessons
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-300 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">Yearly</h4>
                    <p className="text-sm text-gray-600">$79.99/year</p>
                    <span className="text-xs font-semibold text-green-600">Save 33%!</span>
                  </div>
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    All Monthly features
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Priority Support
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Early Access to Features
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              onClick={() => alert('Payment integration coming soon!')}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowPaywall(false)
                setHearts(5)
              }}
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
