import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF6500',
  minimal: 'ui',
}

export const metadata = {
  title: 'Carrot School - AI Mock Exams',
  description: 'ฝึกสอบ TOEIC และ IELTS ด้วย AI - ทีละข้อ สนุกเหมือน Duolingo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Carrot School',
    startupImage: ['/icons/icon-512.png'],
  },
  icons: {
    apple: [
      { url: '/icons/icon-152.png', sizes: '152x152' },
      { url: '/icons/icon-192.png', sizes: '192x192' },
    ],
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Carrot School',
    'msapplication-TileColor': '#FF6500',
    'msapplication-TileImage': '/icons/icon-144.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        {/* PWA - iOS specific */}
        <link rel="apple-touch-icon" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />

        {/* Splash screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Carrot School" />

        {/* Prevent scroll bounce on iOS */}
        <style dangerouslySetInnerHTML={{__html: `
          * { -webkit-tap-highlight-color: transparent; }
          input, textarea, select { font-size: 16px !important; }
        `}} />

        {/* SW registration */}
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('SW registered:', reg.scope);
              }).catch(function(err) {
                console.log('SW failed:', err);
              });
            });
          }
          // Fix DataCloneError
          window.addEventListener('error', function(e) {
            if (e.error instanceof DOMException && e.error.name === 'DataCloneError') {
              e.stopImmediatePropagation(); e.preventDefault();
            }
          }, true);
        `}} />
      </head>
      <body className="antialiased bg-gray-50" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
        <div id="app-root" className="relative max-w-md mx-auto min-h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
