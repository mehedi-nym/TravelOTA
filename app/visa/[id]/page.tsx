'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  ArrowLeft, Clock, Calendar, ShieldCheck, 
  FileText, Globe, Info, HelpCircle, CheckCircle2
} from 'lucide-react' // or lucide-react

interface FAQ {
  question: string
  answer: string
}

interface VisaType {
  id: string
  name: string
  validity: string | null
  max_stay: string | null
  category: string | null
  processing_days: string
  fees: number | string
  country_images: string[] | null
  description: string | null
  requirements: Record<string, string[]>
  faqs: FAQ[]
}

export default function VisaDetailsPage() {
  const params = useParams()
  const [visa, setVisa] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVisaDetails() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('visas')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!error) setVisa(data)
      setLoading(false)
    }
    fetchVisaDetails()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Spinner /></div>
  if (!visa) return <div className="p-20 text-center font-bold text-2xl">Visa type not found.</div>

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8 hover:bg-white dark:hover:bg-slate-900 rounded-full px-6 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </Link>



        {/* 1. HERO HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <span className="bg-[#14A7A2]/10 text-[#14A7A2] px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">
                {visa.category || 'Standard Visa'}
               </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">{visa.name}</h1>
            <div className="flex gap-3">

            </div>
          </div>
          
          <div className="flex gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Validity</p>
              <p className="font-bold text-2xl">{visa.validity || 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Max Stay</p>
              <p className="font-bold text-2xl">{visa.max_stay || 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Total Fee</p>
              <p className="text-4xl font-black text-[#14A7A2]">৳{Number(visa.fees).toLocaleString()}</p>
            </div>
          </div>

          <Link href={`/visa/${visa.id}/apply`}>
            <Button className="rounded-full px-12 h-16 bg-black dark:bg-white dark:text-black text-white font-black hover:scale-105 transition-transform text-lg shadow-lg">
              APPLY NOW
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">


            
            {/* 2. COUNTRY OVERVIEW */}
            <section className="space-y-4">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-2 tracking-tight">
                <Globe size={22} className="text-[#14A7A2]" /> Destination Info
              </h2>
              <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardContent className="p-10">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                    {visa.description || "Experience the unique culture and landscapes of your destination. Our visa service ensures a smooth entry for your visit."}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* COMPACT BENTO GALLERY */}
{visa.country_images && visa.country_images.length > 0 && (
  <section className="mb-10">
    <div className="grid grid-cols-12 gap-3 h-[300px]">
      {/* Main Feature - 50% width */}
      <div className="col-span-6 h-full relative group overflow-hidden rounded-[2rem] border-2 border-white dark:border-slate-800 shadow-md">
        <img 
          src={visa.country_images[0]} 
          alt="Destination" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Side Stack */}
      <div className="col-span-3 flex flex-col gap-3 h-full">
        <div className="h-1/2 relative group overflow-hidden rounded-[1.5rem] border-2 border-white dark:border-slate-800 shadow-sm">
          <img 
            src={visa.country_images[1] || visa.country_images[0]} 
            alt="Detail" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="h-1/2 relative group overflow-hidden rounded-[1.5rem] border-2 border-white dark:border-slate-800 shadow-sm">
          <img 
            src={visa.country_images[2] || visa.country_images[0]} 
            alt="Detail" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Final Square or "More" count */}
      <div className="col-span-3 h-full relative group overflow-hidden rounded-[1.5rem] border-2 border-white dark:border-slate-800 shadow-sm">
        <img 
          src={visa.country_images[3] || visa.country_images[0]} 
          alt="Detail" 
          className="w-full h-full object-cover"
        />
        {visa.country_images.length > 4 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <p className="text-white font-black text-xl">+{visa.country_images.length - 3}</p>
          </div>
        )}
      </div>
    </div>
  </section>
)}

            {/* 3. DYNAMIC REQUIREMENTS */}
            <section className="space-y-4">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-2 tracking-tight">
                <FileText size={22} className="text-[#14A7A2]" /> Required Documents
              </h2>
              <Tabs defaultValue={Object.keys(visa.requirements || {})[0] || "job_holder"} className="w-full">
                <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl h-auto border border-slate-100 dark:border-slate-800 flex-wrap justify-start gap-1">
                  {Object.keys(visa.requirements || {}).map((key) => (
                    <TabsTrigger key={key} value={key} className="rounded-xl px-6 py-3 data-[state=active]:bg-[#14A7A2] data-[state=active]:text-white font-bold capitalize">
                      {key.replace('_', ' ')}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(visa.requirements || {}).map(([key, docs]) => (
                  <TabsContent key={key} value={key} className="mt-6 animate-in fade-in duration-500">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                      <CardContent className="p-10">
                        {docs.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            {docs.map((doc, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <CheckCircle2 size={18} className="text-[#14A7A2] shrink-0" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{doc}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">No specific documents listed for this category.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            {/* 4. NEW: FAQ SECTION */}
            {visa.faqs && visa.faqs.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-black italic uppercase flex items-center gap-2 tracking-tight">
                  <HelpCircle size={22} className="text-[#14A7A2]" /> Common Questions
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {visa.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-none">
                      <AccordionTrigger className="bg-white dark:bg-slate-900 px-8 py-6 rounded-[1.5rem] hover:no-underline font-bold text-left shadow-sm border border-slate-100 dark:border-slate-800">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="bg-white dark:bg-slate-900 px-8 pb-6 pt-2 rounded-b-[1.5rem] text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-x border-b border-slate-100 dark:border-slate-800">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-4">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-2 tracking-tight">
                <Clock size={22} className="text-[#14A7A2]" /> Timeline
              </h2>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 mb-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-black dark:text-white">{visa.processing_days}</span>
                <span className="text-lg font-black text-slate-400 uppercase pb-1">Working Days</span>
              </div>
              <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Estimated Processing Time</p>
            </div>

            <div className="bg-[#14A7A2] rounded-[2.5rem] p-10 text-white shadow-lg">
              <ShieldCheck size={40} className="mb-6 opacity-50" />
              <h3 className="text-2xl font-black italic uppercase mb-2 leading-tight">Expert Review Included</h3>
              <p className="text-sm opacity-90 font-medium mb-8">We review every document to ensure your application meets 100% of embassy standards.</p>
              <Button className="w-full h-14 rounded-full bg-white text-black font-black hover:bg-slate-100 tracking-tighter">
                TALK TO AN EXPERT
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
              <h3 className="font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                <Info size={16} /> Legal Disclaimer
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                Visa processing fees and requirements are subject to change without prior notice by the respective embassy. The fee is non-refundable once the application is processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}