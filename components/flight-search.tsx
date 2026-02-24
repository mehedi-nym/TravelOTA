'use client'

import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Sparkles, Image as ImageIcon } from 'lucide-react'

export function FlightSearch() {
  return (
    
    
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 min-h-[400px] flex items-center justify-center">
      
      {/* 1. The "Ghost" Interface (Now Absolute Background) */}
      <div className="absolute inset-0 opacity-95 pointer-events-none select-none filter blur-[2px] p-8 md:p-12">
        <div className="flex gap-4 mb-8">
            <div className="h-8 w-24 bg-primary/40 rounded-full" />
            <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-r border-slate-100 dark:border-slate-700">
              <div className="h-2 w-10 bg-slate-200 mb-2 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
          ))}
          <div className="bg-primary/20 h-full rounded-2xl" />
        </div>
      </div>

      {/* 2. The Content Overlay (Now Relative to define height) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 md:p-12 w-full h-full bg-gradient-to-b from-transparent via-white/20 to-white/60 dark:via-slate-900/20 dark:to-slate-900/60">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest">SkyConnect API Integration</span>
        </div>

        <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          Seamless Flights <br /> 
          <span className="text-slate-400">Arriving Soon.</span>
        </h3>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm md:text-base leading-relaxed">
          Partnering with local & global carriers for real-time booking, easy rescheduling, and exclusive sky deals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center text-center">
  <div className="flex flex-col items-center">
    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">
      Target Launch
    </p>
    <p className="text-sm font-black">Q4 2026</p>
  </div>
</div>
      </div>
      
    </div>
  )
}