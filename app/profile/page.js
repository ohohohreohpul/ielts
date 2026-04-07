'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Star, BookOpen, ChevronRight, Bell, Crown, Shield, HelpCircle, LogOut, X, Check, Moon, Sun } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSheet, setActiveSheet] = useState(null)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/welcome'); return }
    try { setUser(JSON.parse(userData)) } catch {}
    setLoading(false)
  }, [])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (activeSheet) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeSheet])

  const handleLogout = () => {
    if (!confirm('ต้องการออกจากระบบ?')) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/welcome')
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const isPremium = user?.premium === true

  const badges = [
    { emoji: '🔥', label: 'Streak 7', ok: true },
    { emoji: '⭐', label: 'XP 100',   ok: true },
    { emoji: '📚', label: 'TOEIC',    ok: true },
    { emoji: '🎯', label: 'Perfect',  ok: false },
    { emoji: '💎', label: 'IELTS',    ok: isPremium },
    { emoji: '🚀', label: 'Speed',    ok: false },
    { emoji: '👑', label: 'Pro',      ok: isPremium },
    { emoji: '🌟', label: 'Legend',   ok: false },
  ]

  const menu = [
    { icon: Bell,        label: 'การแจ้งเตือน',        sub: notifications ? 'เปิดอยู่' : 'ปิดอยู่', sheet: 'notifications' },
    { icon: Crown,       label: 'kedikedi Plus',   sub: isPremium ? 'คุณเป็นสมาชิก Plus ✨' : 'ปลดล็อคข้อสอบทั้งหมด', sheet: 'plus', orange: !isPremium },
    { icon: Shield,      label: 'ความเป็นส่วนตัว',     sub: 'จัดการข้อมูลของคุณ', sheet: 'privacy' },
    { icon: HelpCircle,  label: 'ช่วยเหลือ',           sub: 'คำถามที่พบบ่อย', sheet: 'help' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 20px))' }}>

      {/* Header */}
      <div className="bg-orange-500 pt-12 pb-5 px-5 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-2 relative">
            <span className="text-xl font-black text-orange-500">{initials}</span>
            {isPremium && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-lg font-black text-white">{user?.name || 'นักเรียน'}</h1>
          <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full mt-2 ${isPremium ? 'bg-yellow-400/30' : 'bg-white/20'}`}>
            {isPremium && <Crown className="w-3 h-3 text-yellow-300 mr-1" />}
            <span className="text-white text-xs font-bold">{isPremium ? 'Plus Member' : 'Free Plan'}</span>
          </div>
        </motion.div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                { icon: Flame, val: '7',   label: 'วัน Streak', color: 'text-orange-500' },
                { icon: Star,  val: '350', label: 'XP รวม',     color: 'text-yellow-500' },
                { icon: BookOpen, val: '12', label: 'บทเรียน',  color: 'text-gray-700' },
              ].map(({ icon: Icon, val, label, color }, i) => (
                <div key={i} className="py-4 text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <p className="text-xl font-black text-gray-900">{val}</p>
                  <p className="text-xs text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="font-black text-gray-900 mb-2">🏅 เหรียญรางวัล</p>
          <div className="grid grid-cols-4 gap-2">
            {badges.map((b, i) => (
              <div key={i} className={`bg-white rounded-xl border p-2.5 text-center ${b.ok ? 'border-orange-100' : 'border-gray-100'}`}>
                <p className={`text-xl mb-0.5 ${!b.ok ? 'grayscale opacity-30' : ''}`}>{b.emoji}</p>
                <p className={`text-[10px] font-semibold ${b.ok ? 'text-gray-700' : 'text-gray-300'}`}>{b.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="font-black text-gray-900 mb-2">⚙️ ตั้งค่า</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {menu.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveSheet(item.sheet)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors ${i < menu.length - 1 ? 'border-b border-gray-50' : ''} ${item.orange ? 'bg-orange-50' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.orange ? 'bg-orange-500' : 'bg-gray-100'}`}>
                  <item.icon className={`w-4 h-4 ${item.orange ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold ${item.orange ? 'text-orange-600' : 'text-gray-900'}`}>{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-12 bg-white border-2 border-red-100 rounded-2xl text-red-500 font-bold active:opacity-70 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </motion.div>
      </div>

      {/* Settings Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="h-full overflow-y-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900">
                  {activeSheet === 'notifications' && '🔔 การแจ้งเตือน'}
                  {activeSheet === 'plus' && '🐱 kedikedi Plus'}
                  {activeSheet === 'privacy' && '🔒 ความเป็นส่วนตัว'}
                  {activeSheet === 'help' && '❓ ช่วยเหลือ'}
                </h2>
                <button onClick={() => setActiveSheet(null)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-5 pt-5 pb-20 space-y-5">
                {/* Notifications */}
                {activeSheet === 'notifications' && (
                  <>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">แจ้งเตือนรายวัน</p>
                          <p className="text-xs text-gray-400 mt-0.5">เตือนให้ฝึกสอบทุกวัน</p>
                        </div>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`w-12 h-7 rounded-full transition-colors relative ${notifications ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${notifications ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">แจ้งเตือนสถิติ</p>
                          <p className="text-xs text-gray-400 mt-0.5">สรุปความก้าวหน้ารายสัปดาห์</p>
                        </div>
                        <button
                          className="w-12 h-7 rounded-full bg-orange-500 relative"
                        >
                          <div className="w-5 h-5 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Plus */}
                {activeSheet === 'plus' && (
                  <>
                    {isPremium ? (
                      <div className="text-center py-6">
                        <p className="text-5xl mb-3">🎉</p>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">คุณเป็นสมาชิก Plus!</h3>
                        <p className="text-gray-500">ปลดล็อคข้อสอบทั้งหมดแล้ว</p>
                        <div className="mt-6 space-y-3">
                          {['ข้อสอบทั้งหมด IELTS, TOEFL, CU-TEP ฯลฯ', 'หัวใจไม่จำกัด', 'AI Scoring Writing & Speaking', 'คำถามใหม่ไม่ซ้ำ'].map((t, i) => (
                            <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-700">{t}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-center py-4">
                          <p className="text-5xl mb-2">🥕</p>
                          <h3 className="text-2xl font-black text-gray-900">อัพเกรดเป็น Plus</h3>
                          <p className="text-gray-500 text-sm mt-1">ปลดล็อคข้อสอบทั้งหมด</p>
                        </div>
                        <div className="space-y-2">
                          {['ข้อสอบ IELTS, TOEFL, CU-TEP, TU-GET, O-NET, กพ.', 'หัวใจไม่จำกัด ฝึกได้ทั้งวัน', 'AI Scoring สำหรับ Writing & Speaking', 'คำถามใหม่ไม่มีซ้ำ'].map((t, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <p className="text-sm text-gray-700">{t}</p>
                            </div>
                          ))}
                        </div>
                        <button className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl active:opacity-80 mt-4 text-lg">
                          ฿990/ปี (ประหยัด 45%)
                        </button>
                        <button className="w-full bg-white border-2 border-gray-200 text-gray-900 font-bold py-3.5 rounded-2xl active:opacity-80">
                          ฿149/เดือน
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* Privacy */}
                {activeSheet === 'privacy' && (
                  <>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                      <div>
                        <p className="font-bold text-gray-900">ข้อมูลส่วนตัว</p>
                        <p className="text-xs text-gray-400 mt-0.5">ชื่อ: {user?.name}</p>
                        <p className="text-xs text-gray-400">อีเมล: {user?.email}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                      <p className="font-bold text-gray-900">การจัดการข้อมูล</p>
                      <button className="w-full text-left py-3 border-b border-gray-50 text-sm text-gray-600 active:text-orange-500">ดาวน์โหลดข้อมูลของฉัน</button>
                      <button className="w-full text-left py-3 text-sm text-red-500 active:opacity-70">ลบบัญชี</button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        kedikedi เก็บข้อมูลเฉพาะที่จำเป็นสำหรับการใช้งาน เราไม่แชร์ข้อมูลกับบุคคลที่สาม ข้อมูลของคุณจะถูกเข้ารหัสและเก็บอย่างปลอดภัย
                      </p>
                    </div>
                  </>
                )}

                {/* Help */}
                {activeSheet === 'help' && (
                  <>
                    {[
                      { q: 'kedikedi คืออะไร?', a: 'แอปฝึกสอบภาษาอังกฤษด้วย AI สร้างข้อสอบจำลองเหมือนจริง รองรับ TOEIC, IELTS, TOEFL, CU-TEP, TU-GET, O-NET และ กพ.' },
                      { q: 'ข้อสอบสร้างจากอะไร?', a: 'ข้อสอบสร้างโดย AI (Gemini) ทุกครั้งที่ฝึกจะได้ข้อสอบใหม่ไม่ซ้ำ ความยากเหมาะสมกับข้อสอบจริง' },
                      { q: 'Premium ต่างจาก Free อย่างไร?', a: 'Free: TOEIC + Grammar / Premium: ปลดล็อคทุกข้อสอบ + หัวใจไม่จำกัด + AI Scoring' },
                      { q: 'หัวใจหมดแล้วทำอย่างไร?', a: 'หัวใจจะรีเซ็ตทุกวัน หรืออัพเกรดเป็น Plus เพื่อหัวใจไม่จำกัด' },
                      { q: 'ข้อมูลของฉันปลอดภัยไหม?', a: 'ข้อมูลทั้งหมดเข้ารหัสและเก็บอย่างปลอดภัย เราไม่แชร์ข้อมูลกับใคร' },
                    ].map((faq, i) => (
                      <details key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
                        <summary className="px-4 py-3.5 font-bold text-gray-900 text-sm cursor-pointer list-none flex items-center justify-between">
                          {faq.q}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="px-4 pb-3.5 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
                      </details>
                    ))}
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-400">มีคำถามเพิ่มเติม?</p>
                      <p className="text-sm font-bold text-orange-500 mt-1">support@carrotschool.com</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
