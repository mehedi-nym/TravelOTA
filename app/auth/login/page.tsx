'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-black font-sans selection:bg-[#14A7A2]/30">
      {/* 1. Header (Mirrors Landing Page Nav) */}
      <nav className="p-8">
        <Link href="/" className="text-xl font-black tracking-tighter">
          TRAVEL<span className="text-[#14A7A2]">GPT.</span>
        </Link>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center pt-10 pb-20">
        
        {/* Left Side: Branding (Mirrors Landing Hero Text) */}
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 bg-[#14A7A2]/10 border border-[#14A7A2]/20 rounded-full">
            <span className="text-[#14A7A2] text-[10px] font-black uppercase tracking-[0.2em]">Welcome Back</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white uppercase italic">
            Access your <br />
            Global <span className="text-[#14A7A2]">Portal.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-md">
            Enter your credentials to manage your visas, bookings, and AI-curated travel itineraries.
          </p>
        </div>

        {/* Right Side: The Form (Mirrors the Search Card Style) */}
        <div className="relative group">
          {/* Decorative Glow (Mirrors Landing Page Accents) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#14A7A2] to-emerald-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tight mb-8">Secure Login</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Identification (Email)</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="passenger@travelgpt.com"
                    className="h-16 pl-12 pr-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-[#14A7A2] focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between px-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</Label>
                  <Link href="#" className="text-[10px] font-black text-[#14A7A2] uppercase tracking-widest hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-16 pl-12 pr-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-[#14A7A2] focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  <p className="text-xs font-bold text-red-500 text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full h-16 rounded-full bg-[#14A7A2] hover:bg-black text-white font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-xl shadow-[#14A7A2]/20"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <span className="flex items-center gap-2">
                    Enter Dashboard <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                New to the platform?{' '}
                <Link href="/auth/sign-up" className="text-[#14A7A2] font-black hover:underline">
                  Join the Manifest
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-8 w-full text-center pointer-events-none">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-50">
          TravelGPT Systems — Secure Access Point
        </p>
      </footer>
    </div>
  )
}