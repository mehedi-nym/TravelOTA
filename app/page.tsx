'use client'

import { useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { FlightSearch } from '@/components/flight-search'
import { VisaSearch } from '@/components/visa-search'
import { TourPackageSearch } from '@/components/tour-package-search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const [activeTab, setActiveTab] = useState('visa')

  return (
    <main className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-black text-foreground">
      {/* 1. Hero Section with dynamic typography */}
      <div className="relative pt-20 pb-32 overflow-hidden">
         <HeroSection />
      </div>
      
      {/* 2. Floating Search Interface (The "Glass" Core) */}
      <div className="max-w-6xl mx-auto w-full px-4 -mt-40 relative z-30">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center border-b border-border/50">
              <TabsList className="bg-transparent h-16 gap-8">
                {['flight', 'visa', 'tour'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="relative h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-4 font-medium transition-all"
                  >
                    {tab === 'flight' && 'Flights'}
                    {tab === 'visa' && 'Visa'}
                    {tab === 'tour' && 'Packages'}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-8 md:p-12">
              <TabsContent value="flight" className="mt-0 focus-visible:ring-0">
                <FlightSearch />
              </TabsContent>
              <TabsContent value="visa" className="mt-0 focus-visible:ring-0">
                <VisaSearch />
              </TabsContent>
              <TabsContent value="tour" className="mt-0 focus-visible:ring-0">
                <TourPackageSearch />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* 3. Modern Bento Grid Features */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Travel planning, <span className="text-primary/60">reimagined.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                We've stripped away the complexity to give you the fastest route to your next destination.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature Card */}
            <div className="md:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[32px] border border-border flex flex-col justify-between min-h-[300px] hover:border-primary/30 transition-colors">
              <div className="text-5xl">🚀</div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Fast-track Processing</h3>
                <p className="text-muted-foreground max-w-sm">
                  Our automated systems ensure your visa applications reach the front of the line instantly.
                </p>
              </div>
            </div>

            {/* Small Feature Card 1 */}
            <div className="p-10 bg-primary text-primary-foreground rounded-[32px] flex flex-col justify-between hover:opacity-90 transition-opacity">
              <div className="text-5xl">🌍</div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Global</h3>
                <p className="opacity-80">190+ Countries covered.</p>
              </div>
            </div>

            {/* Small Feature Card 2 */}
            <div className="p-10 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex flex-col justify-between hover:border-primary/30 border border-transparent transition-all">
              <div className="text-5xl">💎</div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">Human help, whenever you need it.</p>
              </div>
            </div>

            {/* Wide Feature Card */}
            <div className="md:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[32px] border border-border flex items-center justify-between hover:border-primary/30 transition-colors">
               <div className="max-w-md">
                  <h3 className="text-2xl font-semibold mb-2">Curated Experiences</h3>
                  <p className="text-muted-foreground">Hand-picked tour packages that focus on local authenticity over tourist traps.</p>
               </div>
               <div className="hidden sm:block text-6xl grayscale opacity-20">🗺️</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}