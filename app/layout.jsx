import './globals.css'

export const metadata = {
  title: 'HospiBudget | Department Budget Planner',
  description: 'Comprehensive department budget planning tool for corporate hospitals — covering equipment, maintenance, and manpower requirements.',
  keywords: 'hospital budget, department planning, healthcare finance, equipment budget, manpower planning',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
