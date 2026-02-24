'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  User, FileText, Map, LogOut, LayoutDashboard, ChevronRight, Bell, Menu 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserProfile {
  first_name: string | null
  last_name: string | null
  type: string | null
  email: string | null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserProfile | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      
      // 1. Get Auth User
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // 2. Get Profile Data from Database
      // Note: Ensure your table name is 'profiles' and has these columns
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, type')
        .eq('id', user.id)
        .single()

      if (!profileError && profile) {
        setUserData({
          first_name: profile.first_name,
          last_name: profile.last_name,
          type: profile.type,
          email: user.email ?? null
        })
      }
      
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const menuItems = [
    { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
    { name: 'Visa Applications', href: '/dashboard/applications', icon: FileText },
    { name: 'Tour Bookings', href: '/dashboard/bookings', icon: Map },
  ]

  if (loading) return null

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-black overflow-hidden p-4 md:p-6 gap-6">
      
      {/* 1. Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
        
        {/* User Profile Info at Top (Common for Dashboards) */}
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 mb-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-[#14A7A2]/10 flex items-center justify-center font-black text-2xl text-[#14A7A2] border border-[#14A7A2]/20">
              {userData?.first_name?.charAt(0) || userData?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden w-full">
              <p className="text-sm font-black truncate text-slate-900 dark:text-white uppercase tracking-tight">
                {userData?.first_name} {userData?.last_name}
              </p>
              <p className="text-[10px] text-[#14A7A2] uppercase font-black tracking-[0.2em] mt-1">
                {userData?.type}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between h-14 rounded-2xl px-4 transition-all group",
                    isActive 
                      ? "bg-[#14A7A2]/10 text-[#14A7A2] hover:bg-[#14A7A2]/15" 
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? "text-[#14A7A2]" : "text-slate-400"} />
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Logout at Bottom */}
        <div className="p-6 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-12 font-bold text-xs uppercase tracking-widest"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push('/')
            }}
          >
            <LogOut size={16} className="mr-3" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* 2. Main Body Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex items-center justify-between mb-6 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-3xl border border-white/20">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu size={20} />
            </Button>
            <h1 className="font-black text-xl tracking-tight">
              {menuItems.find(i => i.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-bold text-slate-400 mr-2 hidden md:block">{userData?.email}</p>
            <Button variant="outline" size="icon" className="rounded-full border-slate-200 dark:border-slate-800">
              <Bell size={18} />
            </Button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#14A7A2] to-emerald-400" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide pr-2">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}