'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Define which paths should NOT have Header/Footer
  // includes login, sign-up, and the dashboard area
  const hideLayout = 
    pathname.startsWith('/auth') || 
    pathname === '/login' // add specific ones if needed

  if (hideLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  )
}