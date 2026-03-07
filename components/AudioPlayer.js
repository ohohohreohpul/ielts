'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, Volume2, RotateCcw, Loader2 } from 'lucide-react'

export default function AudioPlayer({ text }) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(true)
  const [playCount, setPlayCount] = useState(0)
  const utteranceRef = useRef(null)

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSupported(false)
    }
    
    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Reset playing state when text changes
  useEffect(() => {
    setPlaying(false)
    setPlayCount(0)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [text])

  const togglePlay = () => {
    if (!supported) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียง')
      return
    }

    if (playing) {
      // Stop playing
      window.speechSynthesis.cancel()
      setPlaying(false)
    } else {
      // Start playing
      setLoading(true)
      
      // Cancel any existing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9 // Slightly slower for learners
      utterance.pitch = 1
      
      utterance.onstart = () => {
        setLoading(false)
        setPlaying(true)
      }
      
      utterance.onend = () => {
        setPlaying(false)
        setPlayCount(prev => prev + 1)
      }
      
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e)
        setLoading(false)
        setPlaying(false)
      }
      
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const replay = () => {
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
    }
    setTimeout(() => togglePlay(), 100)
  }

  if (!supported) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">⚠️ เบราว์เซอร์ไม่รองรับการเล่นเสียง</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 border-0 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlay}
            disabled={loading}
            className={`w-14 h-14 rounded-full transition-all shadow-md ${
              playing 
                ? 'bg-white text-purple-600 hover:bg-gray-100' 
                : 'bg-white text-purple-600 hover:bg-gray-100'
            }`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : playing ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-5 h-5 text-white" />
              <span className="font-bold text-white">
                {playing ? 'กำลังเล่น...' : 'กดเพื่อฟัง'}
              </span>
            </div>
            <p className="text-sm text-white/80">
              {playCount > 0 
                ? `เล่นแล้ว ${playCount} ครั้ง` 
                : 'คลิกปุ่มเพื่อฟังข้อความ'
              }
            </p>
          </div>

          {/* Replay Button */}
          {playCount > 0 && !playing && (
            <Button
              onClick={replay}
              variant="ghost"
              className="w-10 h-10 rounded-full text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Audio Wave Animation */}
        {playing && (
          <div className="flex items-center justify-center gap-1 mt-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/80 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.5s'
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
