import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { BottomNav } from '@/components/bottom-nav'
import { Navbar } from '@/components/navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BuildIt — Build. Share. Get Ranked.',
  description: 'The community-driven platform where developers showcase their projects, get votes, and climb the leaderboard.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {/* Desktop: top navbar */}
          <div className="hidden md:block">
            <Navbar />
          </div>
          {/* Main content with safe bottom padding for mobile nav */}
          <main className="pb-safe md:pb-0">
            {children}
          </main>
          {/* Mobile: bottom navigation */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
