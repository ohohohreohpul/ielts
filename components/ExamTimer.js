'use client'

import { useState, useEffect } from 'react'
import { Clock, CircleAlert as AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ExamTimer({
  timeLimit,
  onTimeUp,
  isPaused = false,
  showWarningAt = 60
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    setTimeRemaining(timeLimit)
  }, [timeLimit])

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1

        if (newTime <= 0) {
          onTimeUp?.()
          return 0
        }

        if (newTime <= showWarningAt && !isWarning) {
          setIsWarning(true)
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, timeRemaining, onTimeUp, showWarningAt, isWarning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const percentage = (timeRemaining / timeLimit) * 100

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isWarning ? 'bg-red-50' : 'bg-gray-50'
      }`}
      animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
      transition={isWarning ? { repeat: Infinity, duration: 1 } : {}}
    >
      {isWarning ? (
        <AlertCircle className="w-5 h-5 text-red-500" />
      ) : (
        <Clock className="w-5 h-5 text-gray-600" />
      )}
      <span className={`font-bold text-base ${
        isWarning ? 'text-red-600' : 'text-gray-700'
      }`}>
        {formatTime(timeRemaining)}
      </span>

      {timeRemaining <= 0 && (
        <span className="text-xs text-red-500 font-medium ml-1">หมดเวลา!</span>
      )}
    </motion.div>
  )
}
