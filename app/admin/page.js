'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Key, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminPage() {
  const [geminiKey, setGeminiKey] = useState('')
  const [googleTTSKey, setGoogleTTSKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showTTSKey, setShowTTSKey] = useState(false)
  const [currentKeys, setCurrentKeys] = useState({ gemini: false, googleTTS: false })

  useEffect(() => {
    loadCurrentKeys()
  }, [])

  const loadCurrentKeys = async () => {
    try {
      const response = await fetch('/api/admin/keys')
      if (response.ok) {
        const data = await response.json()
        setCurrentKeys(data)
      }
    } catch (err) {
      console.error('Failed to load keys:', err)
    }
  }

  const handleSaveKeys = async () => {
    setLoading(true)
    setSuccess(false)
    setError('')

    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiKey: geminiKey || undefined,
          googleTTSKey: googleTTSKey || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setGeminiKey('')
        setGoogleTTSKey('')
        await loadCurrentKeys()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Failed to save keys')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
              <p className="text-gray-600">Manage API Keys & Configuration</p>
            </div>
          </div>
        </motion.div>

        {/* Status Alerts */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                API keys saved successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* API Keys Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys Configuration
              </CardTitle>
              <CardDescription>
                Configure your AI service providers for exam generation and audio services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Gemini API Key */}
              <div className="space-y-2">
                <Label htmlFor="gemini-key" className="text-base font-semibold">
                  Google Gemini API Key
                  {currentKeys.gemini && (
                    <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✓ Configured
                    </span>
                  )}
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Used for AI-powered question generation (Reading, Writing, Speaking)
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="gemini-key"
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..." 
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-block"
                >
                  Get your Gemini API key →
                </a>
              </div>

              {/* Google Cloud TTS/STT Key */}
              <div className="space-y-2">
                <Label htmlFor="google-tts-key" className="text-base font-semibold">
                  Google Cloud API Key (Optional)
                  {currentKeys.googleTTS && (
                    <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✓ Configured
                    </span>
                  )}
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Used for Text-to-Speech (Listening) and Speech-to-Text (Speaking)
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="google-tts-key"
                      type={showTTSKey ? 'text' : 'password'}
                      value={googleTTSKey}
                      onChange={(e) => setGoogleTTSKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTTSKey(!showTTSKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showTTSKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-block"
                >
                  Get Google Cloud API key →
                </a>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveKeys}
                  disabled={loading || (!geminiKey && !googleTTSKey)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save API Keys'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• API keys are stored securely in the database</li>
                <li>• Gemini API key is required for AI question generation</li>
                <li>• Google Cloud key is optional (for audio features)</li>
                <li>• You can update keys anytime by entering new values</li>
                <li>• Leave fields empty to keep existing keys unchanged</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← กลับไปหน้าหลัก
          </a>
        </div>
      </div>
    </div>
  )
}
