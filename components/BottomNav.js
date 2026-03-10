'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Chrome as Home, BookOpen, GraduationCap, ChartBar as BarChart2, User } from 'lucide-react'

const TABS = [
  { href: '/dashboard', icon: Home, label: 'หน้าหลัก' },
  { href: '/practice', icon: BookOpen, label: 'ฝึกสอบ' },
  { href: '/lessons', icon: GraduationCap, label: 'เตรียมสอบ' },
  { href: '/progress', icon: BarChart2, label: 'ประวัติ' },
  { href: '/profile', icon: User, label: 'โปรไฟล์' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingBottom: 'constant(safe-area-inset-bottom)'
      }}
    >
      <div className="max-w-md mx-auto flex justify-around">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex-1 flex flex-col items-center py-3 gap-1 active:scale-95 transition-transform touch-manipulation"
              aria-label={label}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${active ? 'bg-orange-500 scale-110' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-medium transition-colors ${active ? 'text-orange-500' : 'text-gray-500'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
