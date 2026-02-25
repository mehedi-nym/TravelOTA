'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, Clock, Calendar, ShieldCheck, 
  Briefcase, GraduationCap, FileText, Globe, Info
} from 'lucide-react'

interface VisaType {
  id: string
  name: string
  validity: string
  max_stay: string
  visa_category: string
  visa_processing_days: number
  visa_fee: number
  country_overview: string
  requirements: Record<string, string[]>
  faqs: { question: string, answer: string }[]
}

export default function VisaDetailsPage() {
  const params = useParams()
  const [visa, setVisa] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVisaDetails() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('visa_types')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!error) setVisa(data)
      setLoading(false)
    }
    fetchVisaDetails()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Spinner /></div>
  if (!visa) return <div className="p-20 text-center font-bold">Visa type not found.</div>

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8 hover:bg-white dark:hover:bg-slate-900 rounded-full px-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </Link>

        {/* 1. MAIN HEADER BLOCK */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">{visa.name}</h1>
            <p className="text-[#14A7A2] font-black text-xs tracking-[0.3em] uppercase">{visa.visa_category}</p>
          </div>
          
          <div className="flex gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Validity</p>
              <p className="font-bold text-lg">{visa.validity || 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Stay Period</p>
              <p className="font-bold text-lg">{visa.max_stay || 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Total Fee</p>
              <p className="text-3xl font-black text-[#14A7A2]">৳{visa.visa_fee?.toLocaleString()}</p>
            </div>
          </div>

          <Link href={`/visa/${visa.id}/apply`}>
            <Button className="rounded-full px-12 h-16 bg-black dark:bg-white dark:text-black text-white font-black hover:scale-105 transition-transform text-lg">
              APPLY NOW
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            
            {/* 2. COUNTRY OVERVIEW (DYNAMIC) */}
            <section className="space-y-4">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-2">
                <Globe size={20} className="text-[#14A7A2]" /> Country Overview
              </h2>
              <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardContent className="p-8">
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {visa.country_overview || "Experience the unique culture and landscapes of your destination. Our visa service ensures a smooth entry for your visit."}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* 3. PROFESSION-BASED REQUIREMENTS (TABS) */}
            <section className="space-y-4">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-2">
                <FileText size={20} className="text-[#14A7A2]" /> Required Documents
              </h2>
              <Tabs defaultValue="job_holder" className="w-full">
                <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-2xl h-auto border border-slate-100 dark:border-slate-800 flex-wrap justify-start gap-1">
                  <TabsTrigger value="job_holder" className="rounded-xl px-6 py-3 data-[state=active]:bg-[#14A7A2] data-[state=active]:text-white font-bold">Job Holder</TabsTrigger>
                  <TabsTrigger value="businessman" className="rounded-xl px-6 py-3 data-[state=active]:bg-[#14A7A2] data-[state=active]:text-white font-bold">Businessman</TabsTrigger>
                  <TabsTrigger value="student" className="rounded-xl px-6 py-3 data-[state=active]:bg-[#14A7A2] data-[state=active]:text-white font-bold">Student</TabsTrigger>
                </TabsList>

                {Object.entries(visa.requirements || {}).map(([key, docs]) => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900">
                      <CardContent className="p-8">
                        <ul className="space-y-4">
                          {docs.map((doc, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                              <div className="h-2 w-2 rounded-full bg-[#14A7A2] mt-1.5 shrink-0" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </div>

          {/* 4. SIDEBAR FAQ & HELP */}
          <div className="space-y-6">
            <div className="bg-[#14A7A2] rounded-[2.5rem] p-8 text-white shadow-lg">
              <h3 className="text-lg font-black italic uppercase mb-2">Expert Guidance</h3>
              <p className="text-sm opacity-80 font-medium mb-6">Unsure about the documents? Talk to our consultants.</p>
              <Button className="w-full h-14 rounded-full bg-white text-black font-black hover:bg-slate-100">
                REQUEST ASSISTANCE
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
              <h3 className="font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                <Info size={16} /> Important Note
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                Visa processing fees and requirements are subject to change without prior notice by the respective embassy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}