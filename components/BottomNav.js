'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, BarChart2, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', icon: Home, label: 'หน้าหลัก' },
  { href: '/practice', icon: BookOpen, label: 'ฝึกสอบ' },
  { href: '/progress', icon: BarChart2, label: 'ความก้าวหน้า' },
  { href: '/profile', icon: User, label: 'โปรไฟล์' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-md mx-auto flex">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-60 transition-opacity"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-orange-500' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-orange-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
