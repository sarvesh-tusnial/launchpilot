import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mentogram — AI-Native PM MBA',
  description: 'Become a Product Manager through doing real PM work.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
