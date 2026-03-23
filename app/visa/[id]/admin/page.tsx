'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Clock, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  LogIn, 
  SendHorizontal,
  Info
} from "lucide-react"
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'

interface VisaDetails {
  id: string
  name: string
  description: string
  processing_days: string
  fees: number
  category: string
  validity: string
  max_stay: string
  faqs: any[]
  requirements: any // This is the JSONB column from your visas table
  countries: {
    name: string
    code: string
  }
}

export default function VisaDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [visa, setVisa] = useState<VisaDetails | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getData() {
      // 1. Get User Session
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      // 2. Get Visa Data with Country Join
      const { data, error } = await supabase
        .from('visas')
        .select(`
          *,
          countries (name, code)
        `)
        .eq('id', params.id)
        .single()

      if (data) setVisa(data)
      setLoading(false)
    }
    getData()
  }, [params.id])

  if (loading) return <div className="flex justify-center py-40"><Spinner /></div>
  if (!visa) return <div className="text-center py-40 font-bold">Visa not found</div>

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#14A7A2] font-black uppercase tracking-widest text-xs">
            <Globe size={14} />
            {visa.countries.name}
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            {visa.name}
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
            {visa.description}
          </p>
        </div>

        {/* Action Card */}
        <Card className="w-full md:w-96 p-8 rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Package</p>
            <p className="text-4xl font-black text-[#14A7A2] tracking-tighter">
              ৳{visa.fees.toLocaleString()}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-400">Validity</span>
              <span>{visa.validity}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-400">Max Stay</span>
              <span>{visa.max_stay}</span>
            </div>
          </div>

          {/* AUTH PROTECTED BUTTON */}
          {user ? (
            <Button className="w-full h-16 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-lg font-black uppercase transition-all hover:scale-[1.02] active:scale-95">
              Apply Now <SendHorizontal className="ml-2" size={20} />
            </Button>
          ) : (
            <Link href="/login" className="block w-full">
              <Button variant="outline" className="w-full h-16 border-2 border-black dark:border-white rounded-2xl text-lg font-black uppercase transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                Login to Apply <LogIn className="ml-2" size={20} />
              </Button>
            </Link>
          )}
          
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tight">
            Secure processing via Ryoko Travel
          </p>
        </Card>
      </div>

      {/* Info Grid - Same Design as before */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] space-y-4 border border-slate-100 dark:border-slate-800">
          <Clock className="text-[#14A7A2]" size={32} />
          <h4 className="font-black uppercase italic text-sm">Processing Time</h4>
          <p className="font-bold text-2xl tracking-tighter">{visa.processing_days} Working Days</p>
        </div>
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] space-y-4 border border-slate-100 dark:border-slate-800">
          <ShieldCheck className="text-[#14A7A2]" size={32} />
          <h4 className="font-black uppercase italic text-sm">Visa Category</h4>
          <p className="font-bold text-2xl tracking-tighter">{visa.category}</p>
        </div>
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] space-y-4 border border-slate-100 dark:border-slate-800">
          <Info className="text-[#14A7A2]" size={32} />
          <h4 className="font-black uppercase italic text-sm">Requirements</h4>
          <p className="font-bold text-lg tracking-tight">Check below for documentation</p>
        </div>
      </div>

      {/* Static Requirements Section (Reading from JSONB) */}
      <div className="space-y-6 pt-12">
        <h3 className="text-3xl font-black tracking-tighter uppercase italic">Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapping through the JSONB 'requirements' column */}
          {Object.entries(visa.requirements || {}).map(([category, items]: [string, any]) => (
            <div key={category} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-black uppercase text-[#14A7A2] text-xs mb-4 tracking-widest">{category.replace('_', ' ')}</h4>
              <ul className="space-y-3">
                {items.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-bold">
                    <CheckCircle2 className="text-[#14A7A2] shrink-0 mt-0.5" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}