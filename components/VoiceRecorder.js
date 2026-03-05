'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Circle } from 'lucide-react'

export default function VoiceRecorder({ onRecordingComplete }) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete?.(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตการใช้งาน')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="p-6">
        <div className="text-center">
          <Button
            onClick={recording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full mb-4 ${
              recording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {recording ? (
              <Circle className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
          
          <div className="font-semibold text-lg text-orange-900 mb-1">
            {recording ? formatDuration(duration) : 'พร้อมบันทึก'}
          </div>
          
          <p className="text-sm text-orange-700">
            {recording ? 'กดเพื่อหยุดบันทึก' : 'กดไมโครโฟนเพื่อเริ่มพูด'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
