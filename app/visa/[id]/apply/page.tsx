'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"
import { 
  Loader2, ArrowRight, ArrowLeft, UploadCloud, 
  CheckCircle2, Users, UserPlus, ClipboardCheck, 
  Info, Trash2, Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"

export default function VisaApplyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  // --- STATE ---
  const [visa, setVisa] = useState<any>(null)
  const [formConfig, setFormConfig] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)

  // Step 1 State
  const [travelDate, setTravelDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travellerCount, setTravellerCount] = useState(1)
  
  // Step 2 & 3 State: Array of objects for each traveller
  const [travellers, setTravellers] = useState<any[]>([{ profession: 'job_holder' }])
  const [files, setFiles] = useState<Record<string, File>>({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // --- FETCH CONFIGURATION ---
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Visa Basic Info from the new 'visas' table
        const { data: visaData } = await supabase
          .from('visas')
          .select('*')
          .eq('id', params.id)
          .single()

        // 2. Fetch Dynamic Form Config
        const { data: configData } = await supabase
          .from('visa_form_config')
          .select('*')
          .eq('visa_id', params.id)
          .order('order_index')

        setVisa(visaData)
        setFormConfig(configData || [])
      } catch (err) {
        toast.error("Failed to load application settings")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  // --- DYNAMIC FIELD FILTERING ---
  const getFieldsForStep = (tIdx: number, stepNum: number) => {
    const traveller = travellers[tIdx];
    return formConfig.filter(field => {
      if (field.step_number !== stepNum) return false;
      // Only show fields that match the traveller's chosen profession or 'all'
      return field.profession_target === 'all' || field.profession_target === traveller.profession;
    });
  };

  const totalPrice = useMemo(() => {
    if (!visa) return 0;
    return (visa.fees || 0) * travellerCount;
  }, [visa, travellerCount]);

  // --- HANDLERS ---
  const handleTravellerCountChange = (val: number) => {
    const count = Math.max(1, val);
    setTravellerCount(count);
    const newTravellers = Array.from({ length: count }, (_, i) => ({
      ...travellers[i], 
      profession: travellers[i]?.profession || 'job_holder'
    }));
    setTravellers(newTravellers);
  };

const handleUpdateTraveller = (index: number, field: string, value: any) => {
  const updated = [...travellers];
  // Ensure the object exists before assigning
  if (!updated[index]) updated[index] = {}; 
  updated[index][field] = value;

  // Sync others if primary changes
  if (index === 0) {
    for (let i = 1; i < updated.length; i++) {
      if (updated[i].same_as_primary || updated[i].sponsor_mode === "same_primary") {
        updated[i].sponsor_type = updated[0].sponsor_type;
        updated[i].sponsor_name = updated[0].sponsor_name;
        updated[i].sponsor_relationship = updated[0].sponsor_relationship;
      }
    }
  }
  setTravellers(updated);
};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tIdx: number, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [`${tIdx}-${key}`]: file }));
      toast.success(`${file.name} selected`);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!travelDate || !returnDate) return !!toast.error("Please select travel and return dates");
    }
    if (step === 2 || step === 3) {
      for (let i = 0; i < travellerCount; i++) {
        const visibleFields = getFieldsForStep(i, step);
        for (const f of visibleFields) {
          const value = step === 3 ? files[`${i}-${f.field_key}`] : travellers[i][f.field_key];
          if (f.is_required && !value) return !!toast.error(`${f.field_label} is required for Traveller ${i+1}`);
        }
      }
    }
    return true;
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login to apply");

      // 1. Create Main Application Record
      const { data: app, error: appErr } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          visa_id: params.id,
          travel_date: travelDate,
          return_date: returnDate,
          traveller_count: travellerCount,
          base_price_per_person: visa.fees,
          final_total_price: totalPrice,
          status: 'pending'
        }])
        .select()
        .single();

      if (appErr) throw appErr;

      // 2. Loop through Travellers and create Applicant + Documents
      for (let i = 0; i < travellerCount; i++) {
        const currentTraveller = travellers[i];
        const { data: applicant, error: applicantErr } = await supabase
          .from('application_applicants')
          .insert([{
            application_id: app.id,
            full_name: currentTraveller.full_name || 'Applicant',
            passport_number: currentTraveller.passport_number || '',
            profession: currentTraveller.profession,
            answers_json: currentTraveller // Store all dynamic inputs
          }])
          .select()
          .single();

        if (applicantErr) throw applicantErr;

        // 3. Upload and record files for this applicant
        const applicantFiles = Object.keys(files).filter(k => k.startsWith(`${i}-`));
        for (const fileKey of applicantFiles) {
          const file = files[fileKey];
          const cleanKey = fileKey.split('-')[1];
          const path = `apps/${app.id}/${applicant.id}/${Date.now()}-${file.name}`;
          
          const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
          if (uploadErr) throw uploadErr;

          await supabase.from('applicant_documents').insert([{
            applicant_id: applicant.id,
            field_key: cleanKey,
            file_url: path,
            file_name: file.name
          }]);
        }
      }

      toast.success("Application successfully submitted!");
      router.push('/dashboard/applications');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-[#14A7A2]" size={48} /></div>

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* PROGRESS BAR - Design Match */}
        <div className="flex items-center justify-between mb-16 px-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={cn("h-14 w-14 rounded-full flex items-center justify-center font-bold border-2 transition-all", 
                step >= i ? "bg-[#14A7A2] border-[#14A7A2] text-white shadow-xl shadow-[#14A7A2]/20" : "bg-white border-slate-200 text-slate-400")}>
                {i === 1 && <Calendar size={24} />}
                {i === 2 && <Users size={24} />}
                {i === 3 && <UploadCloud size={24} />}
              </div>
              {i < 3 && <div className={cn("h-[2px] flex-1 mx-4", step > i ? "bg-[#14A7A2]" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        {/* STEP 1: TRIP DATES & COUNT */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Trip Basics</h1>
            <Card className="p-10 rounded-[2.5rem] border-none shadow-sm space-y-8 bg-white">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Travel Date</Label>
                  <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="h-16 rounded-2xl border-slate-100 text-lg font-bold px-6" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Return Date</Label>
                  <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="h-16 rounded-2xl border-slate-100 text-lg font-bold px-6" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Number of Travellers</Label>
                <Input type="number" value={travellerCount} onChange={(e) => handleTravellerCountChange(Number(e.target.value))} className="h-16 rounded-2xl border-slate-100 text-lg font-bold px-6 w-full" />
              </div>

              <Button onClick={() => validateStep() && setStep(2)} className="w-full h-20 bg-black text-white rounded-full font-black text-xl hover:bg-[#14A7A2] transition-all">
                NEXT: TRAVELLER DETAILS <ArrowRight className="ml-2" />
              </Button>
            </Card>
          </div>
        )}

        {/* STEP 2: DYNAMIC QUESTIONS (BASED ON PROFESSION) */}
        {/* STEP 2: TRAVELLER PROFILES */}
      {/* STEP 2: TRAVELLER PROFILES */}
{step === 2 && (
  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Applicant Profiles</h1>

    {travellers.map((traveller, tIdx) => (
      <Card key={tIdx} className="p-10 rounded-[3rem] border-none shadow-sm bg-white relative overflow-hidden space-y-8">
        <div className="absolute top-0 right-0 px-8 py-3 bg-[#14A7A2] text-white text-[10px] font-black uppercase italic rounded-bl-3xl">
          {tIdx === 0 ? "Primary Applicant" : `Traveller ${tIdx + 1}`}
        </div>

        {/* A. MANDATORY DEFAULT FIELDS */}
        <div className="grid md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Passport Copy (Main Page)</Label>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
              <Input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={(e) => handleFileUpload(e, tIdx, 'passport_copy')} 
                className="cursor-pointer"
              />
              {files[`${tIdx}-passport_copy`] && <CheckCircle2 className="text-[#14A7A2]" />}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name (As per Passport)</Label>
            <Input 
              value={traveller.full_name || ''} 
              onChange={(e) => handleUpdateTraveller(tIdx, 'full_name', e.target.value)}
              className="h-14 rounded-2xl border-slate-100 font-bold px-5 bg-slate-50" 
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Passport Number</Label>
            <Input 
              value={traveller.passport_number || ''} 
              onChange={(e) => handleUpdateTraveller(tIdx, 'passport_number', e.target.value)}
              className="h-14 rounded-2xl border-slate-100 font-bold px-5 bg-slate-50" 
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
            <Input 
              value={traveller.phone_number || ''} 
              onChange={(e) => handleUpdateTraveller(tIdx, 'phone_number', e.target.value)}
              className="h-14 rounded-2xl border-slate-100 font-bold px-5 bg-slate-50" 
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Profession</Label>
            <select 
              className="w-full h-14 rounded-2xl border-slate-100 border px-5 font-bold bg-slate-50 outline-none focus:ring-2 ring-[#14A7A2]/20"
              value={traveller.profession}
              onChange={(e) => handleUpdateTraveller(tIdx, 'profession', e.target.value)}
            >
              <option value="job_holder">Job Holder</option>
              <option value="business">Business Man</option>
              <option value="student">Student</option>
              <option value="housewife">Housewife</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* B. CONDITIONAL QUESTIONS (PREVIOUS TRAVEL & SPONSOR) */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-slate-50 pt-8">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Previously travelled on this visa?</Label>
            <div className="flex gap-4">
              {['Yes', 'No'].map(opt => (
                <Button 
                  key={opt}
                  type="button"
                  variant={traveller.has_travelled_before === (opt === 'Yes') ? 'default' : 'outline'}
                  onClick={() => handleUpdateTraveller(tIdx, 'has_travelled_before', opt === 'Yes')}
                  className="flex-1 rounded-xl font-bold h-12"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          {/* PRIMARY APPLICANT SPONSOR LOGIC */}
          {tIdx === 0 ? (
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Who is Sponsoring?</Label>
              <select
                value={traveller.sponsor_mode || "self"}
                onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_mode", e.target.value)}
                className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 font-bold"
              >
                <option value="self">Self Sponsored</option>
                <option value="external">Sponsored by Family / Relative</option>
                <option value="external">Sponsored by Company / Organization</option>
              </select>

              {/* B. CONDITIONAL QUESTIONS (SPONSOR SECTION) */}
{traveller.sponsor_mode === "external" && (
  <div className="space-y-4 mt-4 animate-in fade-in zoom-in-95 duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sponsor Name / Company</Label>
        <Input
          placeholder="Enter name"
          value={traveller.sponsor_name || ''}
          onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_name", e.target.value)}
          className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relationship (sponsor)</Label>
        <Input
          placeholder="Or type here..."
          value={traveller.sponsor_relationship || ''}
          onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_relationship", e.target.value)}
          className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
        />
      </div>
    </div>

    {/* PRESET CHIPS FOR RELATIONSHIP */}
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-[#14A7A2]">Quick Select Relationship</Label>
      <div className="flex flex-wrap gap-2">
        {['Father', 'Mother', 'Spouse', 'Children', 'Brother', 'Sister', 'Uncle', 'Employer', 'Company'].map((rel) => (
          <button
            key={rel}
            type="button"
            onClick={() => handleUpdateTraveller(tIdx, "sponsor_relationship", rel)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border-2",
              traveller.sponsor_relationship === rel 
                ? "bg-[#14A7A2] border-[#14A7A2] text-white shadow-lg shadow-[#14A7A2]/20" 
                : "bg-white border-slate-100 text-slate-400 hover:border-[#14A7A2] hover:text-[#14A7A2]"
            )}
          >
            {rel}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
            </div>
          ) : (
            /* NON-PRIMARY APPLICANT SPONSOR LOGIC */
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Traveler Funding Source</Label>
              <select
                value={traveller.sponsor_mode || ""}
                onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_mode", e.target.value)}
                className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 font-bold"
              >
                <option value="">Select Option</option>
                <option value="same_primary">Same as Primary Applicant</option>
                <option value="primary">Sponsored by Primary Applicant</option>
                <option value="self">Self Sponsored</option>
                <option value="external">Sponsored by Someone Else</option>
              </select>

              {traveller.sponsor_mode === "same_primary" && (
                <p className="text-[10px] text-[#14A7A2] font-black uppercase">Linking to primary sponsor details</p>
              )}

              {/* PRIMARY SPONSOR RELATIONSHIP */}
{traveller.sponsor_mode === "primary" && (
  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Relationship with Primary Applicant
      </Label>
      <Input
        placeholder="Type relationship (e.g. Son, Daughter, Wife)"
        value={traveller.sponsor_relationship || ''}
        onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_relationship", e.target.value)}
        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
      />
    </div>

    {/* PRESET CHIPS FOR FAMILY/PRIMARY RELATIONSHIP */}
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-[#14A7A2]">
        Quick Select
      </Label>
      <div className="flex flex-wrap gap-2">
        {['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Employee'].map((rel) => (
          <button
            key={rel}
            type="button"
            onClick={() => handleUpdateTraveller(tIdx, "sponsor_relationship", rel)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border-2",
              traveller.sponsor_relationship === rel 
                ? "bg-[#14A7A2] border-[#14A7A2] text-white shadow-lg shadow-[#14A7A2]/20" 
                : "bg-white border-slate-100 text-slate-400 hover:border-[#14A7A2] hover:text-[#14A7A2]"
            )}
          >
            {rel}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

              {/* B. CONDITIONAL QUESTIONS (SPONSOR SECTION) */}
{traveller.sponsor_mode === "external" && (
  <div className="space-y-4 mt-4 animate-in fade-in zoom-in-95 duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sponsor Name / Company</Label>
        <Input
          placeholder="Enter name"
          value={traveller.sponsor_name || ''}
          onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_name", e.target.value)}
          className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relationship</Label>
        <Input
          placeholder="Or type here..."
          value={traveller.sponsor_relationship || ''}
          onChange={(e) => handleUpdateTraveller(tIdx, "sponsor_relationship", e.target.value)}
          className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
        />
      </div>
    </div>

    {/* PRESET CHIPS FOR RELATIONSHIP */}
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-[#14A7A2]">Quick Select Relationship</Label>
      <div className="flex flex-wrap gap-2">
        {['Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Uncle', 'Employer', 'Company'].map((rel) => (
          <button
            key={rel}
            type="button"
            onClick={() => handleUpdateTraveller(tIdx, "sponsor_relationship", rel)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border-2",
              traveller.sponsor_relationship === rel 
                ? "bg-[#14A7A2] border-[#14A7A2] text-white shadow-lg shadow-[#14A7A2]/20" 
                : "bg-white border-slate-100 text-slate-400 hover:border-[#14A7A2] hover:text-[#14A7A2]"
            )}
          >
            {rel}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
            </div>
          )}
        </div>

        {/* C. DYNAMIC ADMIN QUESTIONS (FROM DATABASE) */}
        {getFieldsForStep(tIdx, 2).length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#14A7A2]">Additional Information</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {getFieldsForStep(tIdx, 2).map(field => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{field.field_label}</Label>
                  {field.field_type === 'select' ? (
                    <select 
                      className="w-full h-14 rounded-2xl border-slate-100 border px-5 font-bold bg-slate-50"
                      value={traveller[field.field_key] || ''}
                      onChange={(e) => handleUpdateTraveller(tIdx, field.field_key, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {field.options_json?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <Input 
                      placeholder={field.field_label}
                      value={traveller[field.field_key] || ''}
                      className="h-14 rounded-2xl border-slate-100 font-bold px-5 bg-slate-50" 
                      onChange={(e) => handleUpdateTraveller(tIdx, field.field_key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    ))}

    {/* NAVIGATION BUTTONS */}
    <div className="flex gap-4">
      <Button onClick={() => setStep(1)} variant="outline" className="h-20 flex-1 rounded-full font-black border-slate-200">
        BACK
      </Button>
      <Button 
        onClick={() => validateStep() && setStep(3)} 
        className="h-20 flex-[2] bg-black text-white rounded-full font-black text-xl hover:bg-[#14A7A2]"
      >
        CONTINUE TO DOCUMENTS
      </Button>
    </div>
  </div>
)}

        {/* STEP 3: DYNAMIC UPLOADS */}
        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Document Center</h1>
            {travellers.map((traveller, tIdx) => (
              <Card key={tIdx} className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-6">
                <h2 className="text-xl font-black uppercase italic text-[#14A7A2]">Uploads: Traveller {tIdx + 1}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getFieldsForStep(tIdx, 3).map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{field.field_label}</Label>
                      <label className={cn(
                        "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer",
                        files[`${tIdx}-${field.field_key}`] ? "bg-[#14A7A2]/5 border-[#14A7A2]" : "border-slate-100 hover:border-[#14A7A2] bg-slate-50"
                      )}>
                        {files[`${tIdx}-${field.field_key}`] ? (
                          <>
                            <CheckCircle2 className="text-[#14A7A2] mb-2" size={28} />
                            <span className="text-[10px] font-black text-[#14A7A2] truncate w-full text-center px-4">{files[`${tIdx}-${field.field_key}`].name}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="text-slate-300 mb-2" size={28} />
                            <span className="text-[10px] font-black uppercase text-slate-500">Upload File</span>
                          </>
                        )}
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, tIdx, field.field_key)} />
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            <div className="flex gap-4">
              <Button onClick={() => setStep(2)} variant="outline" className="h-20 flex-1 rounded-full font-black">BACK</Button>
              <Button onClick={() => validateStep() && setIsConfirming(true)} className="h-20 flex-[2] bg-[#14A7A2] text-white rounded-full font-black text-xl">REVIEW & SUBMIT</Button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION OVERLAY */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <Card className="max-w-md w-full rounded-[3rem] p-10 space-y-8 bg-white border-none animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase italic">Final Review</h2>
              <p className="text-xs text-slate-500 font-bold uppercase">Check your details before payment.</p>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-6 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Applicants</span><span className="text-black">{travellerCount}</span></div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Price per person</span><span className="text-black">৳{visa.fees.toLocaleString()}</span></div>
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-[#14A7A2]">Total Due</span>
                <span className="text-3xl font-black">৳{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="ghost" onClick={() => setIsConfirming(false)} className="h-16 rounded-full font-black text-xs uppercase" disabled={isSubmitting}>Edit</Button>
              <Button onClick={submitApplication} disabled={isSubmitting} className="h-16 rounded-full bg-black text-white font-black">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "SUBMIT NOW"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}