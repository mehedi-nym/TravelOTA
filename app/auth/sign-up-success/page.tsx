'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MailCheck, ArrowLeft, Inbox } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-black font-sans flex items-center justify-center p-6">
      {/* Background Decorative Element - Matching Landing Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#14A7A2]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[500px] relative z-10 text-center">
        {/* Animated Icon Circle */}
        <div className="mb-10 relative inline-block">
          <div className="absolute inset-0 bg-[#14A7A2] blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-24 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-center shadow-xl">
            <MailCheck className="text-[#14A7A2] w-10 h-10" />
          </div>
        </div>

        {/* Branding & Header */}
        <div className="space-y-4 mb-10">
          <div className="inline-block px-4 py-1.5 bg-[#14A7A2]/10 border border-[#14A7A2]/20 rounded-full mb-2">
            <span className="text-[#14A7A2] text-[10px] font-black uppercase tracking-[0.2em]">Registration Received</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-slate-900 dark:text-white uppercase italic">
            Check your <br />
            <span className="text-[#14A7A2]">Manifest.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-[320px] mx-auto leading-tight">
            We've sent a verification link to your inbox. Please confirm to activate your dashboard.
          </p>
        </div>

        {/* Action Area - "The Boarding Pass" style */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl mb-8">
          <div className="flex items-start gap-4 text-left mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Inbox className="w-5 h-5 text-[#14A7A2] shrink-0 mt-1" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Next Step</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Click the link in the email to verify your identity. If you don't see it, check your spam folder.
              </p>
            </div>
          </div>

          <Link href="/auth/login">
            <Button 
              variant="outline"
              className="w-full h-16 rounded-full border-2 border-slate-100 dark:border-slate-800 hover:border-[#14A7A2] hover:text-[#14A7A2] transition-all font-black uppercase tracking-widest text-xs"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Login
            </Button>
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          TravelOTA Protocol - Verified Access Only
        </p>
      </div>
    </div>
  )
}