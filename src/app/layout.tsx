import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/providers/session-provider'

export const metadata: Metadata = {
  title: 'GG Production Knowledge Platform',
  description: 'Professional poker production training and knowledge management system',
  keywords: 'poker, production, training, GGP, knowledge management',
  authors: [{ name: 'GG Production Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}