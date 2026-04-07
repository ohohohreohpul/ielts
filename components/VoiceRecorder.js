'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Circle, Check } from 'lucide-react'

export default function VoiceRecorder({ onRecordingComplete, hasRecording }) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [justRecorded, setJustRecorded] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      transcriptRef.current = ''
      setTranscript('')

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete?.(blob, transcriptRef.current)
        setJustRecorded(true)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()

      // Start Web Speech API transcription if supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
          let finalText = ''
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript + ' '
            }
          }
          transcriptRef.current = finalText.trim()
          setTranscript(finalText.trim())
        }

        recognition.onerror = () => { /* silently ignore */ }
        recognition.start()
        recognitionRef.current = recognition
      }

      setRecording(true)
      setDuration(0)
      setJustRecorded(false)

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
      recognitionRef.current?.stop()
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
            ) : justRecorded || hasRecording ? (
              <Check className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>

          <div className="font-semibold text-lg text-orange-900 mb-1">
            {recording ? formatDuration(duration) : justRecorded || hasRecording ? 'บันทึกเสร็จแล้ว' : 'พร้อมบันทึก'}
          </div>

          <p className="text-sm text-orange-700">
            {recording ? 'กดเพื่อหยุดบันทึก' : justRecorded || hasRecording ? 'กดอีกครั้งเพื่อบันทึกใหม่' : 'กดไมโครโฟนเพื่อเริ่มพูด'}
          </p>

          {(recording && transcript) && (
            <div className="mt-4 p-3 bg-white rounded-lg text-left border border-orange-200">
              <p className="text-xs text-gray-500 mb-1">Transcript (live):</p>
              <p className="text-sm text-gray-700 italic">{transcript}</p>
            </div>
          )}

          {(!recording && (justRecorded || hasRecording) && transcript) && (
            <div className="mt-4 p-3 bg-white rounded-lg text-left border border-orange-200">
              <p className="text-xs text-gray-500 mb-1">Transcript:</p>
              <p className="text-sm text-gray-700 italic">{transcript}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
