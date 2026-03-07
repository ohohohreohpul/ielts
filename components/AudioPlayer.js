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
    <Card className="bg-orange-500 border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-full ${ 
              playing ? 'bg-orange-500 hover:bg-orange-500' : 'bg-orange-500 hover:bg-orange-500'
            }`}
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-700">กดเพื่อฟัง</span>
            </div>
            <p className="text-sm text-gray-700">คลิกปุ่มเล่นเพื่อฟังข้อความ</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
