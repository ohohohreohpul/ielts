'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Check, Crown, Loader as Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Check if returning from Stripe - read directly without dependency
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      checkPaymentStatus(sessionId)
    }
  }, [])

  const checkPaymentStatus = async (sessionId) => {
    setCheckingPayment(true)
    try {
      const res = await fetch(`/api/payments/status/${sessionId}`)
      const data = await res.json()
      
      if (data.payment_status === 'paid') {
        // Update local user data
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          user.premium = true
          localStorage.setItem('user', JSON.stringify(user))
        }
        // Redirect to success
        router.push('/pricing/success')
      }
    } catch (err) {
      console.error('Payment check failed:', err)
    }
    setCheckingPayment(false)
  }

  const handleSubscribe = async (plan) => {
    if (!user) {
      router.push('/welcome')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          userId: user.id,
          email: user.email,
          originUrl: window.location.origin
        })
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout failed:', err)
    }
    setLoading(false)
  }

  const plans = [
    {
      id: 'monthly',
      name: 'รายเดือน',
      price: 199,
      period: '/เดือน',
      features: [
        'เข้าถึงข้อสอบทุกประเภท',
        'IELTS, TOEFL, CU-TEP, TU-GET',
        'O-NET, กพ.',
        'คำอธิบายละเอียดทุกข้อ',
        'ประวัติการทำข้อสอบ',
        'ยกเลิกได้ทุกเมื่อ'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'รายปี',
      price: 1490,
      originalPrice: 2388,
      period: '/ปี',
      discount: 'ประหยัด 38%',
      features: [
        'ทุกอย่างใน Premium รายเดือน',
        'ประหยัดกว่า 898 บาท',
        'ล็อคราคาตลอด 1 ปี',
        'สิทธิพิเศษในอนาคต',
        'Support ลำดับความสำคัญ'
      ],
      popular: true
    }
  ]

  if (checkingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">อัพเกรด Premium</h1>
            <p className="text-sm text-gray-500">ปลดล็อคข้อสอบทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">kedikedi Premium</h2>
          <p className="text-gray-600">เข้าถึงข้อสอบทุกประเภท ไม่จำกัด</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${plan.popular ? 'border-orange-500 border-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ยอดนิยม
                  </div>
                )}
                {plan.discount && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                    {plan.discount}
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-orange-600">฿{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-sm text-gray-400 line-through mb-4">฿{plan.originalPrice}/ปี</p>
                  )}
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    className={`w-full h-12 font-bold ${plan.popular ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>เลือกแผน {plan.name}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Free tier info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium">ใช้ฟรีได้เสมอ</h4>
                <p className="text-sm text-gray-500">TOEIC และ Grammar ยังคงฟรีตลอดไป ไม่ต้องอัพเกรด</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PricingContent />
    </Suspense>
  )
}
