'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { 
  Loader2, ArrowRight, ArrowLeft, UploadCloud, 
  CheckCircle2, Users, UserPlus, ClipboardCheck, 
  Info, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"

export default function VisaApplyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [visa, setVisa] = useState<any>(null)
  const [requirements, setRequirements] = useState<any[]>([])
  const [step, setStep] = useState(1)

  const [travelDate, setTravelDate] = useState('')
  const [travellerCount, setTravellerCount] = useState(1)
  const [travellers, setTravellers] = useState<any[]>([{ role: 'main' }])

  const [files, setFiles] = useState<Record<string, File>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // ----------------------------------------
  // FETCH VISA & REQUIREMENTS (KEEPING YOUR LOGIC)
  // ----------------------------------------
  useEffect(() => {
    async function fetchData() {
      const { data: visaData } = await supabase
        .from('visa_types')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: reqData } = await supabase
        .from('visa_requirements')
        .select('*')
        .eq('visa_type_id', params.id)
        .eq('is_active', true)
        .order('order_index')

      setVisa(visaData)
      setRequirements(reqData || [])
    }

    fetchData()
  }, [params.id])

  // Logic: Calculate minimum travel date based on processing days
  const minDateStr = visa ? format(addDays(new Date(), visa.visa_processing_days), "yyyy-MM-dd") : ""

  const updateTravellerCount = (count: number) => {
    setTravellerCount(count)
    const newTravellers = Array.from({ length: count }, (_, i) => ({
      role: i === 0 ? 'main' : 'additional'
    }))
    setTravellers(newTravellers)
  }

  const handleFieldChange = (index: number, key: string, value: any) => {
    const updated = [...travellers]
    updated[index][key] = value
    setTravellers(updated)
  }

  const handleFileChange = (e: any, key: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }))
      toast.success(`${file.name} attached`)
    }
  }

  // ----------------------------------------
  // VALIDATION (KEEPING YOUR LOGIC)
  // ----------------------------------------
  const validateStep = () => {
    const stepFields = requirements.filter(r => r.step_number === step && r.is_required)

    for (const field of stepFields) {
      if (step === 2) {
        for (const [idx, traveller] of travellers.entries()) {
          // Check if field applies to this traveller type
          if (
            (field.applies_to === 'main' && idx !== 0) ||
            (field.applies_to === 'additional' && idx === 0)
          ) continue;

          if (!traveller[field.field_key]) {
            toast.error(`${field.field_label} is required for Traveller ${idx + 1}`, {
                icon: <AlertCircle className="text-red-500" />
            })
            return false
          }
        }
      }

      if (step === 1 && field.field_key === 'travel_date' && !travelDate) {
        toast.error("Please select a travel date")
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(prev => prev + 1)
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  // ----------------------------------------
  // SUBMIT (KEEPING YOUR LOGIC)
  // ----------------------------------------
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const uploadedUrls: Record<string, string> = {}
      for (const [key, file] of Object.entries(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const path = `visa/${params.id}/${fileName}`

        const { error } = await supabase.storage
          .from('documents')
          .upload(path, file)

        if (error) throw error
        uploadedUrls[key] = path
      }

      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('visa_applications')
        .insert([{
          visa_type_id: params.id,
          user_id: user?.id,
          travel_date: travelDate,
          total_travellers: travellerCount,
          applicants_json: { travellers },
          document_urls: uploadedUrls,
          status: 'pending',
          total_price: visa.visa_fee * travellerCount
        }])

      if (error) throw error

      toast.success("Application Submitted Successfully")
      router.push('/dashboard/applications')

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
      setIsConfirming(false)
    }
  }

  if (!visa) return <div className="p-20 text-center font-black italic uppercase text-3xl animate-pulse">Loading...</div>

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 relative">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500", 
                step >= i ? "bg-[#14A7A2] border-[#14A7A2] text-white shadow-xl shadow-[#14A7A2]/20" : "bg-white border-slate-200 text-slate-400")}>
                {i === 1 && <Users size={20} />}
                {i === 2 && <UserPlus size={20} />}
                {i === 3 && <ClipboardCheck size={20} />}
              </div>
              {i < 3 && <div className={cn("h-[2px] flex-1 mx-4 transition-all duration-700", step > i ? "bg-[#14A7A2]" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight">Trip Details</h1>
            <Card className="p-10 rounded-[2.5rem] border-none shadow-sm space-y-8 bg-white">
              {requirements.filter(r => r.step_number === 1).map(field => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{field.field_label}</Label>
                  {field.field_key === 'traveller_count' ? (
                    <Input 
                      type="number" min="1" 
                      value={travellerCount} 
                      onChange={(e) => updateTravellerCount(Number(e.target.value))} 
                      className="h-16 rounded-2xl border-slate-100 text-lg font-bold px-6 focus:ring-[#14A7A2]" 
                    />
                  ) : (
                    <div className="relative">
                       <Input 
                         type="date" min={minDateStr} 
                         value={travelDate} 
                         onChange={(e) => setTravelDate(e.target.value)} 
                         className="h-16 rounded-2xl border-slate-100 text-lg font-bold px-6 block" 
                       />
                       <p className="mt-3 text-[10px] text-[#14A7A2] font-black uppercase italic flex items-center gap-1">
                         <Info size={12}/> Processing takes {visa.visa_processing_days} days. Dates before {minDateStr} are restricted.
                       </p>
                    </div>
                  )}
                </div>
              ))}
              <Button onClick={handleNext} className="w-full h-20 bg-black text-white rounded-full font-black text-xl hover:bg-[#14A7A2] transition-all">
                CONTINUE TO TRAVELLERS <ArrowRight className="ml-2" />
              </Button>
            </Card>
          </div>
        )}

        {/* STEP 2: TRAVELLERS */}
        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight">Traveller Information</h1>
            {travellers.map((traveller, index) => (
              <Card key={index} className="p-10 rounded-[3rem] border-none shadow-sm space-y-8 bg-white">
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <h2 className="text-xl font-black uppercase italic">Traveller {index + 1}</h2>
                  <div className="px-5 py-1.5 bg-[#14A7A2]/10 text-[#14A7A2] rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {traveller.role} applicant
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {requirements.filter(r => r.step_number === 2).map(field => {
                    if ((field.applies_to === 'main' && index !== 0) || (field.applies_to === 'additional' && index === 0)) return null
                    
                    return (
                      <div key={field.id} className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{field.field_label}</Label>
                        {field.field_type === 'text' ? (
                          <Input className="h-14 rounded-2xl border-slate-100 font-bold px-5" placeholder={`Enter ${field.field_label}`} onChange={(e) => handleFieldChange(index, field.field_key, e.target.value)} />
                        ) : field.field_type === 'select' ? (
                          <select className="w-full h-14 rounded-2xl border-slate-100 border px-5 font-bold appearance-none bg-white" onChange={(e) => handleFieldChange(index, field.field_key, e.target.value)}>
                            <option value="">Select...</option>
                            {field.options_json?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.field_type === 'radio' ? (
                          <RadioGroup className="flex gap-6 pt-2" onValueChange={(val) => handleFieldChange(index, field.field_key, val)}>
                            {field.options_json?.map((opt: string) => (
                              <div key={opt} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt} id={`${index}-${opt}`} />
                                <Label htmlFor={`${index}-${opt}`} className="font-bold">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </Card>
            ))}
            <div className="flex gap-4">
              <Button onClick={handleBack} variant="outline" className="h-20 flex-1 rounded-full font-black border-slate-200 text-lg"> <ArrowLeft className="mr-2" /> BACK</Button>
              <Button onClick={handleNext} className="h-20 flex-[2] bg-black text-white rounded-full font-black text-xl hover:bg-[#14A7A2]">CONTINUE TO DOCUMENTS <ArrowRight className="ml-2" /></Button>
            </div>
          </div>
        )}

        {/* STEP 3: DOCUMENTS */}
        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Document Checklist</h1>
            <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {requirements.filter(r => r.step_number === 3 && r.field_type === 'file').map(field => (
                  <div key={field.id} className="relative">
                    <label htmlFor={field.id} className={cn("flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2.5rem] transition-all cursor-pointer group", 
                      files[field.field_key] ? "bg-[#14A7A2]/5 border-[#14A7A2]" : "border-slate-100 hover:border-[#14A7A2] hover:bg-slate-50")}>
                      {files[field.field_key] ? (
                        <>
                          <CheckCircle2 className="text-[#14A7A2] mb-3" size={32} />
                          <span className="text-[10px] font-black uppercase text-[#14A7A2] text-center line-clamp-1 px-4">{files[field.field_key].name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="text-slate-300 group-hover:text-[#14A7A2] mb-3" size={32} />
                          <span className="text-[10px] font-black uppercase text-slate-500 text-center font-bold tracking-tight">{field.field_label}</span>
                        </>
                      )}
                      <input type="file" id={field.id} className="hidden" onChange={(e) => handleFileChange(e, field.field_key)} />
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-12">
                <Button onClick={handleBack} variant="outline" className="h-20 flex-1 rounded-full font-black border-slate-200 text-lg">BACK</Button>
                <Button onClick={() => setIsConfirming(true)} className="h-20 flex-[2] bg-[#14A7A2] text-white rounded-full font-black text-xl shadow-xl shadow-[#14A7A2]/20">REVIEW & SUBMIT</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* UX BETTER: CONFIRMATION MODAL */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="max-w-lg w-full rounded-[3.5rem] p-12 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl border-none bg-white">
            <div className="text-center space-y-3">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#14A7A2]/10 text-[#14A7A2] mb-4">
                <ClipboardCheck size={40} />
              </div>
              <h2 className="text-3xl font-black uppercase italic leading-none">Final Confirmation</h2>
              <p className="text-slate-500 font-bold text-sm px-4">Ensure all information is correct. Changes cannot be made after submission.</p>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8 space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400"><span>Destination</span><span className="text-black">{visa.name}</span></div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400"><span>Applicants</span><span className="text-black">{travellerCount} Persons</span></div>
              <div className="flex justify-between items-center pt-5 border-t border-slate-200">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Due</span>
                <span className="text-[#14A7A2] text-4xl font-black">৳{(visa.visa_fee * travellerCount).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="ghost" onClick={() => setIsConfirming(false)} className="h-16 rounded-full font-black uppercase tracking-widest text-xs" disabled={isSubmitting}>Review Info</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="h-16 rounded-full bg-black text-white font-black hover:bg-[#14A7A2] transition-colors">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "YES, SUBMIT"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}