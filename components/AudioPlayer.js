'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, Volume2 } from 'lucide-react'

export default function AudioPlayer({ text }) {
  const [playing, setPlaying] = useState(false)

  const togglePlay = () => {
    setPlaying(!playing)
    // Here you would integrate with Google TTS API or use Web Speech API
    if (!playing) {
      // Simulate audio playback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.onend = () => setPlaying(false)
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis?.cancel()
    }
  }

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-full ${ 
              playing ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">กดเพื่อฟัง</span>
            </div>
            <p className="text-sm text-purple-700">คลิกปุ่มเล่นเพื่อฟังข้อความ</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
