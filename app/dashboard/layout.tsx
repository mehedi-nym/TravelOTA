'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-white dark:bg-slate-900">
        <div className="p-6">
          <h2 className="text-lg font-bold text-primary mb-8">Dashboard</h2>
          <nav className="space-y-2">
            <Link href="/dashboard/profile">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-secondary/20"
              >
                Profile
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-secondary/20"
              >
                Visa Applications
              </Button>
            </Link>
            <Link href="/dashboard/bookings">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-secondary/20"
              >
                Tour Bookings
              </Button>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
