import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaunchPilot School',
  description: 'From idea to first revenue. Pick your launch pathway and build your business — step by step.',
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
