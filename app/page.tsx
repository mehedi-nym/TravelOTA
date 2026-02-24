'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroSection } from '@/components/hero-section'
import { FlightSearch } from '@/components/flight-search'
import { VisaSearch } from '@/components/visa-search'
import { TourPackageSearch } from '@/components/tour-package-search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const [activeTab, setActiveTab] = useState('visa')

  return (
    <main className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-black overflow-x-hidden">
      {/* 1. Hero Section */}
      <HeroSection />
      
      {/* 2. Main Search Area - Floating over Hero */}
      <div className="max-w-7xl mx-auto w-full px-4 -mt-32 relative z-30">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[40px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Navigation Header */}
            <div className="flex justify-center border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <TabsList className="bg-transparent h-20 gap-8 md:gap-12">
                {['flight', 'visa', 'tour'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="relative h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-2 md:px-4 font-bold text-sm md:text-base transition-all uppercase tracking-widest"
                  >
                    {tab === 'flight' && 'Flights'}
                    {tab === 'visa' && 'Visa'}
                    {tab === 'tour' && 'Packages'}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Dynamic Content Container */}
            <motion.div 
              layout 
              transition={{ type: "spring", duration: 0.6, bounce: 0 }}
              className="p-6 md:p-12"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="flight" className="mt-0 outline-none">
                    <FlightSearch />
                  </TabsContent>
                  
                  <TabsContent value="visa" className="mt-0 outline-none">
                    <VisaSearch />
                  </TabsContent>
                  
                  <TabsContent value="tour" className="mt-0 outline-none">
                    <TourPackageSearch />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </Tabs>
        </div>
      </div>

      {/* 3. Modern Bento Grid Features - Separated from Search Area */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl text-left">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-tight">
                Travel planning, <br />
                <span className="text-primary/60">reimagined.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We've stripped away the complexity to give you the fastest route to your next destination.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="md:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[320px] hover:shadow-xl transition-all group">
              <div className="text-5xl group-hover:scale-110 transition-transform origin-left">🚀</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Fast-track Processing</h3>
                <p className="text-muted-foreground max-w-sm">
                  Our automated systems ensure your visa applications reach the front of the line instantly.
                </p>
              </div>
            </div>

            <div className="p-10 bg-primary text-primary-foreground rounded-[32px] flex flex-col justify-between min-h-[320px] hover:scale-[1.02] transition-transform">
              <div className="text-5xl">🌍</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Global</h3>
                <p className="opacity-80">190+ Countries covered with local support and expertise.</p>
              </div>
            </div>

            <div className="p-10 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex flex-col justify-between min-h-[320px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <div className="text-5xl">💎</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">Human help, whenever you need it. No bots, just travelers helping travelers.</p>
              </div>
            </div>

            <div className="md:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-xl transition-all group">
               <div className="max-w-md">
                  <h3 className="text-2xl font-bold mb-2">Curated Experiences</h3>
                  <p className="text-muted-foreground">Hand-picked tour packages that focus on local authenticity over tourist traps.</p>
               </div>
               <div className="hidden sm:block text-7xl grayscale opacity-10 group-hover:opacity-30 transition-opacity">🗺️</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}