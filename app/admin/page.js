'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Key, CreditCard, Settings, Eye, EyeOff, Save, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState({})
  
  const [config, setConfig] = useState({
    geminiKey: '',
    stripeKey: '',
    facebookAppId: '',
    facebookAppSecret: '',
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config')
      if (res.ok) {
        const data = await res.json()
        setConfig({
          geminiKey: data.geminiKey || '',
          stripeKey: data.stripeKey || '',
          facebookAppId: data.facebookAppId || '',
          facebookAppSecret: data.facebookAppSecret || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch config:', err)
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save config:', err)
    }
    setSaving(false)
  }

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const configSections = [
    {
      title: 'AI Configuration',
      icon: '🤖',
      description: 'ตั้งค่า API key สำหรับ AI (Gemini)',
      fields: [
        { key: 'geminiKey', label: 'Gemini API Key', placeholder: 'AIza...' }
      ]
    },
    {
      title: 'Payment (Stripe)',
      icon: '💳',
      description: 'ตั้งค่า Stripe สำหรับรับชำระเงิน Premium',
      fields: [
        { key: 'stripeKey', label: 'Stripe Secret Key', placeholder: 'sk_live_...' }
      ]
    },
    {
      title: 'Facebook Login',
      icon: '🔷',
      description: 'ตั้งค่า Facebook App สำหรับ Social Login',
      fields: [
        { key: 'facebookAppId', label: 'Facebook App ID', placeholder: '123456789...' },
        { key: 'facebookAppSecret', label: 'Facebook App Secret', placeholder: 'abc123...' }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Admin Console</h1>
            <p className="text-sm text-gray-500">ตั้งค่า API Keys และ Integrations</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Google OAuth Info */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <h3 className="font-bold text-green-800">Google Login</h3>
                <p className="text-sm text-green-700">✅ พร้อมใช้งานแล้ว! ไม่ต้องตั้งค่าอะไรเพิ่มเติม</p>
                <p className="text-xs text-green-600 mt-1">ใช้ Emergent Auth - รองรับ Google OAuth อัตโนมัติ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Config Sections */}
        {configSections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{field.label}</label>
                    <div className="relative">
                      <Input
                        type={showKeys[field.key] ? 'text' : 'password'}
                        value={config[field.key]}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Save Button */}
        <Button
          onClick={saveConfig}
          disabled={saving}
          className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังบันทึก...</>
          ) : saved ? (
            <><Check className="w-5 h-5 mr-2" /> บันทึกแล้ว!</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> บันทึกการตั้งค่า</>
          )}
        </Button>
      </div>
    </div>
  )
}
