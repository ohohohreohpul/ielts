'use client'

import { motion } from 'framer-motion'
import { Clock, Zap, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TimingSummary({ questionTimings, totalTime }) {
  const avgTime = questionTimings.length > 0
    ? Math.round(questionTimings.reduce((sum, t) => sum + t.timeSpent, 0) / questionTimings.length)
    : 0

  const fastestQuestion = questionTimings.length > 0
    ? Math.min(...questionTimings.map(q => q.timeSpent))
    : 0

  const slowestQuestion = questionTimings.length > 0
    ? Math.max(...questionTimings.map(q => q.timeSpent))
    : 0

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#1B3F7A]" />
        สรุปเวลา
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#1B3F7A]" />
              <span className="text-xs text-gray-600 font-medium">เวลารวม</span>
            </div>
            <div className="text-2xl font-black text-[#152E5A]">
              {formatTime(totalTime)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600 font-medium">เฉลี่ยต่อข้อ</span>
            </div>
            <div className="text-2xl font-black text-blue-600">
              {formatTime(avgTime)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 font-medium">เร็วที่สุด</span>
            </div>
            <div className="text-2xl font-black text-green-600">
              {formatTime(fastestQuestion)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-600 font-medium">ช้าที่สุด</span>
            </div>
            <div className="text-2xl font-black text-purple-600">
              {formatTime(slowestQuestion)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question by question breakdown */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">เวลาแต่ละข้อ</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {questionTimings.map((timing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600">ข้อ {idx + 1}</span>
                  {timing.isCorrect ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      ✗
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {formatTime(timing.timeSpent)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
