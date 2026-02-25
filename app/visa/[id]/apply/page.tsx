'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { CalendarIcon, UserPlus, Users, ClipboardCheck, ArrowRight, ArrowLeft, UploadCloud } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function VisaApplyPage() {
  const params = useParams()
  const [step, setStep] = useState(1)
  const [visa, setVisa] = useState<any>(null)
  const [travellerCount, setTravellerCount] = useState(1)
  const [travelDate, setTravelDate] = useState<Date>()
  const [travellers, setTravellers] = useState<any[]>([{ id: 1, role: 'main', profession: 'job_holder', isSponsoring: 'no' }])

  // Fetch Visa info for processing days and fee
  useEffect(() => {
    async function getVisa() {
      const supabase = createClient()
      const { data } = await supabase.from('visa_types').select('*').eq('id', params.id).single()
      setVisa(data)
    }
    getVisa()
  }, [params.id])

  // Logic: Block dates during processing period [cite: 1, 4]
  const minDate = visa ? addDays(new Date(), visa.visa_processing_days) : new Date()

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const updateTravellerCount = (count: number) => {
    setTravellerCount(count)
    const newTravellers = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      role: i === 0 ? 'main' : 'additional',
      profession: 'job_holder',
      relationship: '',
      isSponsoring: i === 0 ? 'no' : 'main_sponsoring'
    }))
    setTravellers(newTravellers)
  }

  if (!visa) return <div className="p-20 text-center">Loading Application...</div>

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 transition-all", 
                step >= i ? "bg-[#14A7A2] border-[#14A7A2] text-white" : "bg-white border-slate-200 text-slate-400")}>
                {i === 1 && <Users size={18} />}
                {i === 2 && <UserPlus size={18} />}
                {i === 3 && <ClipboardCheck size={18} />}
              </div>
              {i < 3 && <div className={cn("h-[2px] flex-1 mx-4", step > i ? "bg-[#14A7A2]" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        {/* STEP 1: TRIP BASICS */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Trip Details</h1>
            <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-black uppercase">How many people are travelling?</Label>
                  <Input type="number" min="1" value={travellerCount} onChange={(e) => updateTravellerCount(parseInt(e.target.value))} className="h-14 rounded-2xl border-slate-100" />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-black uppercase">Intended Date of Visit</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-14 rounded-2xl justify-start text-left font-normal border-slate-100", !travelDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {travelDate ? format(travelDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl">
                      <Calendar mode="single" selected={travelDate} onSelect={setTravelDate} disabled={(date) => date < minDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <p className="text-[10px] text-[#14A7A2] font-bold italic uppercase">Earliest available date based on {visa.visa_processing_days} days processing.</p>
                </div>
              </div>
            </Card>
            <Button onClick={handleNext} className="w-full h-16 bg-black text-white rounded-full font-black text-lg">CONTINUE TO TRAVELLERS <ArrowRight className="ml-2" /></Button>
          </div>
        )}

        {/* STEP 2: DYNAMIC TRAVELLER FORMS */}
        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Traveller Information</h1>
            
            {travellers.map((t, idx) => (
              <Card key={t.id} className="p-10 rounded-[2.5rem] border-none shadow-sm space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-black uppercase italic">Traveller {idx + 1} {idx === 0 && "(Main Applicant)"}</h2>
                  <div className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase">{t.role}</div>
                </div>

                {/* Common Fields  */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>First Name</Label><Input className="h-12 rounded-xl" placeholder="As per passport" /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input className="h-12 rounded-xl" placeholder="As per passport" /></div>
                </div>

                {/* Sponsorship Question (Only for Main)  */}
                {idx === 0 && travellerCount > 1 && (
                  <div className="p-6 bg-[#14A7A2]/5 rounded-3xl space-y-4">
                    <Label className="font-bold">Are you sponsoring the other {travellerCount - 1} travellers? </Label>
                    <RadioGroup defaultValue="no" onValueChange={(val) => {
                       const newT = [...travellers];
                       newT[0].isSponsoring = val;
                       setTravellers(newT);
                    }}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="s-yes" /><Label htmlFor="s-yes">Yes, I am sponsoring</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="s-no" /><Label htmlFor="s-no">No, they have their own funds</Label></div>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Relationship Trigger (Only for Additional)  */}
                {idx > 0 && (
                  <div className="space-y-2">
                    <Label>Relationship to Main Traveller</Label>
                    <select className="w-full h-12 rounded-xl border px-4" onChange={(e) => {
                      const newT = [...travellers];
                      newT[idx].relationship = e.target.value;
                      setTravellers(newT);
                    }}>
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                )}

                {/* Profession selection  */}
                <div className="space-y-2">
                   <Label>Profession </Label>
                   <select className="w-full h-12 rounded-xl border px-4" onChange={(e) => {
                      const newT = [...travellers];
                      newT[idx].profession = e.target.value;
                      setTravellers(newT);
                   }}>
                     <option value="job_holder">Job Holder</option>
                     <option value="businessman">Businessman</option>
                     <option value="student">Student</option>
                   </select>
                </div>
              </Card>
            ))}

            <div className="flex gap-4">
              <Button onClick={handleBack} variant="outline" className="h-16 flex-1 rounded-full font-black border-slate-200"><ArrowLeft className="mr-2" /> BACK</Button>
              <Button onClick={handleNext} className="h-16 flex-2 rounded-full bg-black text-white font-black px-12">UPLOAD DOCUMENTS <ArrowRight className="ml-2" /></Button>
            </div>
          </div>
        )}

        {/* STEP 3: DYNAMIC DOCUMENT UPLOADS  */}
        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Document Checklist</h1>
            
            {travellers.map((t, idx) => (
              <Card key={t.id} className="p-10 rounded-[2.5rem] border-none shadow-sm space-y-8">
                <h3 className="text-xl font-black uppercase italic">Documents for Traveller {idx + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Universal Docs  */}
                  <UploadBox label="Passport Copy (Scan)" />
                  <UploadBox label="Photo (35mm x 45mm)" />

                  {/* Profession-Specific  */}
                  {t.profession === 'job_holder' && <UploadBox label="NOC Letter" />}
                  {t.profession === 'businessman' && <UploadBox label="Trade License (Translated)" />}
                  {t.profession === 'student' && <UploadBox label="School/College ID Card" />}

                  {/* Financial (Only if sponsoring or individual)  */}
                  {(t.role === 'main' || t.isSponsoring === 'no') && (
                    <UploadBox label="6 Months Bank Statement & Solvency" />
                  )}

                  {/* Relationship Specific  */}
                  {t.relationship === 'spouse' && <UploadBox label="Marriage Certificate" />}
                </div>
              </Card>
            ))}

            <Button className="w-full h-20 bg-[#14A7A2] text-white rounded-full font-black text-xl shadow-xl hover:scale-[1.02] transition-transform">
              SUBMIT APPLICATION (৳{(visa.visa_fee * travellerCount).toLocaleString()})
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

function UploadBox({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-3xl hover:bg-white hover:border-[#14A7A2] transition-colors cursor-pointer group">
      <UploadCloud className="text-slate-300 group-hover:text-[#14A7A2] mb-2" size={24} />
      <span className="text-[10px] font-black uppercase text-slate-500 text-center">{label} </span>
      <input type="file" className="hidden" />
    </div>
  )
}