'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, UserPlus, Mail, Lock } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }
    const supabase = createClient()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-black font-sans selection:bg-[#14A7A2]/30">

      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center pt-10 pb-20">
        
        {/* Left Side: Branding (Mirrors Landing Hero Text) */}
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 bg-[#14A7A2]/10 border border-[#14A7A2]/20 rounded-full">
            <span className="text-[#14A7A2] text-[10px] font-black uppercase tracking-[0.2em]">Join the Elite</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white uppercase italic">
            Your journey <br />
            begins <span className="text-[#14A7A2]">here.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-md">
            Unlock AI-powered visa assistance and curated world tours in one seamless account.
          </p>
        </div>

        {/* Right Side: The Form (Mirrors the Search Card Style) */}
        <div className="relative group">
          {/* Decorative Glow (Mirrors Landing Page Accents) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#14A7A2] to-emerald-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tight mb-8">Personal Details</h2>
            
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="h-16 pl-12 pr-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-[#14A7A2] focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-16 pl-12 pr-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-[#14A7A2] focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-16 pl-12 pr-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-[#14A7A2] focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-xs font-bold text-red-500 ml-4">{error}</p>}

              <Button 
                className="w-full h-16 rounded-full bg-[#14A7A2] hover:bg-black text-white font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-xl shadow-[#14A7A2]/20"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    Initialize Account <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Already part of the manifest?{' '}
                <Link href="/auth/login" className="text-[#14A7A2] font-black hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}