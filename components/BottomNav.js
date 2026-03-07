'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Home, BookOpen, BarChart3, User } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { id: 'home', label: 'หน้าหลัก', icon: Home, href: '/dashboard' },
  { id: 'practice', label: 'ฝึกสอบ', icon: BookOpen, href: '/practice' },
  { id: 'progress', label: 'ความก้าวหน้า', icon: BarChart3, href: '/progress' },
  { id: 'profile', label: 'โปรไฟล์', icon: User, href: '/profile' }
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show on lesson pages or auth pages
  if (pathname?.includes('/lesson') || 
      pathname?.includes('/welcome') || 
      pathname?.includes('/login') || 
      pathname?.includes('/signup') ||
      pathname?.includes('/admin')) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-green-50"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <item.icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
