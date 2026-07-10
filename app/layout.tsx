import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Prompt, Sarabun } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  title: 'Mazuma Repair Guide | คู่มือซ่อมช่างมาซูมา',
  description:
    'ระบบคู่มือการซ่อมแบบอินเทอร์แอคทีฟสำหรับช่างเทคนิค Mazuma ค้นหาตามอาการเสีย ดูขั้นตอนพร้อมวิดีโอ',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0e6ba8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${prompt.variable} ${sarabun.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
