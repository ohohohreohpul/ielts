'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Key, CreditCard, Settings, Eye, EyeOff, Save, Check, Loader as Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const OPENROUTER_MODELS = [
  { value: 'meta-llama/llama-4-maverick:free', label: 'Llama 4 Maverick (Free)' },
  { value: 'meta-llama/llama-4-scout:free', label: 'Llama 4 Scout (Free)' },
  { value: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Free)' },
  { value: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek V3 (Free)' },
  { value: 'qwen/qwen3-235b-a22b:free', label: 'Qwen3 235B (Free)' },
  { value: 'microsoft/phi-4-reasoning:free', label: 'Phi-4 Reasoning (Free)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Paid)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (Paid)' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Paid)' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Paid)' },
  { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (Paid)' },
  { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (Paid)' },
]

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState({})
  
  const [config, setConfig] = useState({
    geminiKey: '',
    openAIKey: '',
    openRouterKey: '',
    openRouterModel: 'meta-llama/llama-4-maverick:free',
    llmProvider: 'gemini',
    stripeKey: '',
    googleClientId: '',
    googleClientSecret: '',
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
          openAIKey: data.openAIKey || '',
          openRouterKey: data.openRouterKey || '',
          openRouterModel: data.openRouterModel || 'meta-llama/llama-4-maverick:free',
          llmProvider: data.llmProvider || 'gemini',
          stripeKey: data.stripeKey || '',
          googleClientId: data.googleClientId || '',
          googleClientSecret: data.googleClientSecret || '',
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
      title: 'Google OAuth Configuration',
      icon: '🔵',
      description: 'ตั้งค่า Google OAuth ของคุณเองเพื่อไม่พึ่งพา Emergent Auth',
      fields: [
        { key: 'googleClientId', label: 'Google Client ID', placeholder: '123456789-abc...apps.googleusercontent.com' },
        { key: 'googleClientSecret', label: 'Google Client Secret', placeholder: 'GOCSPX-...' }
      ],
      instructions: 'รับ credentials จาก Google Cloud Console > APIs & Services > Credentials'
    },
    {
      title: 'AI Configuration',
      icon: '🤖',
      description: 'ตั้งค่า API key สำหรับ AI (Gemini, OpenAI หรือ OpenRouter)',
      fields: [
        { key: 'llmProvider', label: 'AI Provider', type: 'select', options: [
          { value: 'gemini', label: 'Google Gemini' },
          { value: 'openai', label: 'OpenAI (GPT-4)' },
          { value: 'openrouter', label: 'OpenRouter (รองรับหลาย model)' }
        ]},
        { key: 'geminiKey', label: 'Gemini API Key', placeholder: 'AIza...' },
        { key: 'openAIKey', label: 'OpenAI API Key', placeholder: 'sk-...' },
        { key: 'openRouterKey', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...' },
        { key: 'openRouterModel', label: 'OpenRouter Model', type: 'openrouter-model' }
      ],
      instructions: 'เลือก AI provider และใส่ API key ที่ต้องการใช้ สำหรับ OpenRouter ใส่ API key จาก openrouter.ai แล้วเลือก model ที่ต้องการ'
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
        {/* Google OAuth Status */}
        <Card className={config.googleClientId ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <h3 className={`font-bold ${config.googleClientId ? "text-green-800" : "text-yellow-800"}`}>
                  Google Login Status
                </h3>
                {config.googleClientId ? (
                  <>
                    <p className="text-sm text-green-700">✅ ใช้ Custom Google OAuth ของคุณเอง</p>
                    <p className="text-xs text-green-600 mt-1">อิสระแล้ว - ไม่ขึ้นกับ Emergent Auth</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-yellow-700">⚠️ กำลังใช้ Emergent Auth (ตั้งค่า Custom OAuth ด้านล่างเพื่อเป็นอิสระ)</p>
                    <p className="text-xs text-yellow-600 mt-1">ตั้งค่า Google OAuth ด้านล่างเพื่อใช้ API Key ของคุณเอง</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OpenRouter Info Banner */}
        {config.llmProvider === 'openrouter' && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="font-bold text-purple-800">OpenRouter เปิดใช้งานแล้ว</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    รองรับ 300+ AI models จากผู้ให้บริการชั้นนำ รวมถึง model ฟรี
                  </p>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 underline mt-1 inline-block"
                  >
                    รับ API key ฟรีที่ openrouter.ai/keys →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                {section.instructions && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                    💡 {section.instructions}
                  </div>
                )}
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={config[field.key]}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {field.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'openrouter-model' ? (
                      <select
                        value={config[field.key]}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {OPENROUTER_MODELS.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    ) : (
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
                    )}
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
