'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Check, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Fire confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-xl"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-3xl font-black mb-2">ยินดีต้อนรับสู่ Premium! 🎉</h1>
        <p className="text-gray-600 mb-8">ขอบคุณที่สนับสนุน Carrot School</p>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              สิทธิพิเศษของคุณ
            </h3>
            <ul className="space-y-3 text-left">
              {[
                'เข้าถึงข้อสอบทุกประเภท',
                'IELTS, TOEFL, CU-TEP, TU-GET',
                'O-NET, กพ.',
                'คำอธิบายละเอียดภาษาไทย',
                'ประวัติการทำข้อสอบไม่จำกัด'
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button
          onClick={() => router.push('/practice')}
          className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600"
        >
          เริ่มทำข้อสอบเลย! 🚀
        </Button>
      </motion.div>
    </div>
  )
}
