'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Loader2, 
  UploadCloud, 
  CheckCircle2, 
  Copy, 
  Check, 
  Building2, 
  Info, 
  ArrowRight,
  ChevronRight
} from 'lucide-react'

const supabase = createClient()

export default function PaymentPage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState(null)
  const [otaBanks, setOtaBanks] = useState([])
  const [selectedOtaBank, setSelectedOtaBank] = useState(null)
  const [userBankList, setUserBankList] = useState([])
  const [file, setFile] = useState(null)

  const [form, setForm] = useState({
    user_bank_id: '',
    sender_account_number: '',
    sender_account_name: '',
    transaction_id: '',
  })

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [appRes, otaRes, bankRes] = await Promise.all([
          supabase.from('applications').select('*').eq('id', id).single(),
          supabase.from('ota_bank_accounts').select('*').eq('is_active', true),
          supabase.from('banks').select('id,name').order('name')
        ])

        if (appRes.error) throw appRes.error
        setApplication(appRes.data)

        if (otaRes.data?.length) {
          setOtaBanks(otaRes.data)
          setSelectedOtaBank(otaRes.data[0]) 
        }
        if (bankRes.data) setUserBankList(bankRes.data)
      } catch (err) {
        toast.error('Failed to load transaction data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async () => {
    if (!file) return toast.error('Please upload payment proof')
    if (!form.transaction_id || !form.user_bank_id) return toast.error('Missing required fields')

    setSubmitting(true)
    try {
      // 1. Storage Upload
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const path = `payments/${id}/${cleanFileName}`

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(path, file)

      if (uploadErr) throw uploadErr

      // 2. Insert Payment Record
      const { error: payErr } = await supabase.from('application_payments').insert({
        application_id: id,
        ota_bank_id: selectedOtaBank?.id,
        user_bank_id: form.user_bank_id,
        ...form,
        payment_proof_url: path,
        status: 'pending'
      })

      if (payErr) throw payErr

      // 3. Update App Status
      await supabase.from('applications').update({ 
        payment_status: 'verification_pending' 
      }).eq('id', id)
      
      toast.success('Payment submitted for verification!')
      router.push('/dashboard/applications')
    } catch (err: any) {
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#2b8494] mb-4" size={40} />
      <p className="text-slate-500 font-medium animate-pulse">Preparing secure checkout...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#F4F7F8] py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: SELECTION & INFO (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BANK SELECTION */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#2b8494] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">1</div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Select Our Bank for Transfer</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
              {otaBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedOtaBank(bank)}
                  className={`group relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedOtaBank?.id === bank.id 
                      ? 'border-[#2b8494] bg-[#2b8494]/5 ring-4 ring-[#2b8494]/10' 
                      : 'border-slate-100 hover:border-[#2b8494]/30 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                    {bank.logo_url ? (
                      <img src={bank.logo_url} alt={bank.bank_name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Building2 className="text-slate-300" size={24} />
                    )}
                  </div>
                  <span className={`text-[11px] font-bold text-center uppercase leading-tight ${selectedOtaBank?.id === bank.id ? 'text-[#2b8494]' : 'text-slate-500'}`}>
                    {bank.bank_name}
                  </span>
                </button>
              ))}
            </div>

            {selectedOtaBank && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-dashed border-[#2b8494]/40 animate-in fade-in slide-in-from-bottom-2">
                <DetailRow label="Account Name" value={selectedOtaBank.account_name} />
                <DetailRow label="Account Number" value={selectedOtaBank.account_number} />
                <DetailRow label="Routing" value={`${selectedOtaBank.routing_number || 'N/A'}`} />
                <DetailRow label="Branch" value={`${selectedOtaBank.branch_name || 'N/A'}`} />
              </div>
            )}
          </section>

          {/* PAYMENT FORM */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#2b8494] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Submit Your Transaction Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold">Sent From (Your Bank)</Label>
                <select 
                  className="w-full h-12 border-2 border-slate-100 rounded-xl px-4 bg-slate-50 focus:border-[#2b8494] focus:ring-0 transition-all outline-none text-slate-700"
                  onChange={e => setForm({...form, user_bank_id: e.target.value})}
                >
                  <option value="">Choose Bank</option>
                  {userBankList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Transaction ID <span className="text-red-500">*</span></Label>
                <Input 
                  className="h-12 border-2 border-slate-100 rounded-xl bg-slate-50 focus:border-[#2b8494]" 
                  placeholder="e.g. TRX992831..." 
                  onChange={e => setForm({...form, transaction_id: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Sender Name</Label>
                <Input className="h-12 border-2 border-slate-100 rounded-xl bg-slate-50" placeholder="John Doe" onChange={e => setForm({...form, sender_account_name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">Sender Account No.</Label>
                <Input className="h-12 border-2 border-slate-100 rounded-xl bg-slate-50" placeholder="Optional" onChange={e => setForm({...form, sender_account_number: e.target.value})} />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Label className="text-slate-600 font-semibold text-sm">Payment Proof (Screenshot)</Label>
              <div className={`relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                file ? 'border-green-500 bg-green-50/50' : 'border-slate-200 hover:border-[#2b8494] bg-slate-50'
              }`}>
                <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files?.[0])} />
                <div className="flex flex-col items-center">
                  {file ? (
                    <div className="animate-in zoom-in">
                      <div className="bg-green-100 p-3 rounded-full mb-3 text-green-600"><CheckCircle2 size={32} /></div>
                      <p className="text-sm font-bold text-slate-700">{file.name}</p>
                      <button className="text-xs text-red-500 mt-2 hover:underline">Change File</button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-[#2b8494] group-hover:scale-110 transition-transform"><UploadCloud size={32} /></div>
                      <p className="text-sm text-slate-600 font-semibold">Click to upload or drag & drop</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF (max 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: SUMMARY (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-6 overflow-hidden border-0 shadow-xl rounded-2xl bg-white">
            <div className="bg-[#2b8494] p-6 text-white">
              <p className="text-sm opacity-80 mb-1">Total Payable Amount</p>
              <div className="text-4xl font-black">৳ {application?.final_total_price}</div>
              <div className="mt-4 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
                <Info size={12} /> Verification Pending
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Order ID</span>
                <span className="font-mono font-bold text-[#2b8494]">{application?.order_id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Application ID</span>
                <span className="text-slate-700 font-medium truncate ml-4">#{id.toString().slice(-8)}</span>
              </div>
              
              <div className="h-px bg-slate-100 my-2" />

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-500">
                  <div className="mt-0.5"><ChevronRight size={14} className="text-[#2b8494]" /></div>
                  <p>Transfer the exact amount as shown above.</p>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-500">
                  <div className="mt-0.5"><ChevronRight size={14} className="text-[#2b8494]" /></div>
                  <p>Upload a clear screenshot of your transaction receipt.</p>
                </div>
              </div>

              <Button 
                disabled={submitting} 
                onClick={handleSubmit}
                className="w-full h-14 bg-[#2b8494] hover:bg-[#226a77] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#2b8494]/20 transition-all active:scale-[0.98] mt-4"
              >
                {submitting ? (
                  <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Submitting...</div>
                ) : (
                  <div className="flex items-center gap-2">Confirm Payment <ArrowRight size={20} /></div>
                )}
              </Button>
            </div>
          </Card>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
             <h4 className="text-sm font-bold text-amber-800 mb-1">Secure Transaction</h4>
             <p className="text-xs text-amber-700 leading-relaxed">
               Your payment is processed manually. Once submitted, our team will verify the Transaction ID against our bank statement.
             </p>
          </div>
        </div>

      </div>
    </main>
  )
}

function DetailRow({ label, value }) {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase font-bold text-[#2b8494]/60 tracking-wider">{label}</p>
      <div className="flex items-center gap-2 group">
  <span className="font-mono text-sm font-bold text-slate-700 break-all">
    {value}
  </span>

  <button
    onClick={onCopy}
    className={`p-1.5 rounded-md transition-all ${
      copied
        ? 'bg-green-100 text-green-600'
        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }`}
  >
    {copied ? <Check size={12} /> : <Copy size={12} />}
  </button>
</div>
    </div>
  )
}