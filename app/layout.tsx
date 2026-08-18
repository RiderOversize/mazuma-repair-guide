import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Prompt, Sarabun, Kanit, Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prompt',
})

const sarabun = Sarabun({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-thai',
})

export const metadata: Metadata = {
  title: 'Mazuma Repair Guide | คู่มือซ่อมช่างมาซูมา',
  description:
    'ระบบคู่มือการซ่อมแบบอินเทอร์แอคทีฟสำหรับช่างเทคนิค Mazuma ค้นหาตามอาการเสีย ดูขั้นตอนพร้อมวิดีโอ',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mazuma Guide',
  },
}

export const viewport: Viewport = {
  themeColor: '#0e6ba8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning className={`${prompt.variable} ${sarabun.variable} ${kanit.variable} ${notoSansThai.variable} bg-background`}>
      <body className="font-sans antialiased bg-muted/20 text-foreground selection:bg-primary/20">
        <div className="mx-auto flex min-h-screen flex-col bg-background relative overflow-x-hidden w-full">
          <Providers>
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </Providers>
        </div>
      </body>
    </html>
  )
}
