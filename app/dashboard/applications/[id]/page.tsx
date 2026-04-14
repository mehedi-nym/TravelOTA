'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Loader2, CheckCircle2, Circle, Clock, FileText, 
  Users, CreditCard, ChevronLeft, Download, ExternalLink 
} from 'lucide-react'
import Link from 'next/link'

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "document_verification", label: "Document Verification" },
  { key: "processing", label: "Processing" },
  { key: "submitted_to_embassy", label: "Submitted to Embassy" },
  { key: "result_approved", label: "Approved" },
];

export default function ApplicationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetails()
  }, [id])

  async function fetchDetails() {
    try {
      setLoading(true)

      // 1. Fetch Application + Visa Details
      const { data: app } = await supabase
        .from('applications')
        .select(`*, visa:visas (name, country:countries (name))`)
        .eq('id', id)
        .single()

      if (!app) {
        router.push('/dashboard/applications')
        return
      }

      // 2. Fetch Applicants, Documents (FILTERED), and Payment
      const [applicantsRes, documentsRes, paymentRes] = await Promise.all([
        supabase.from('application_applicants').select('*').eq('application_id', id),
        supabase.from('applicant_documents').select('*').eq('application_id', id), // Added filter
        supabase.from('application_payments').select('*').eq('application_id', id).maybeSingle()
      ])

      setData({
        app,
        applicants: applicantsRes.data || [],
        documents: documentsRes.data || [],
        payment: paymentRes.data
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (stepKey: string, index: number) => {
    const currentStatus = data?.app.status;
    const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
    
    if (currentStatus === 'result_rejected') return 'rejected'; // Handle edge case
    if (index < currentIndex || currentStatus === 'result_approved') return 'complete';
    if (index === currentIndex) return 'current';
    return 'pending';
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Retrieving application details...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      
      {/* BACK BUTTON & HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/applications"><ChevronLeft className="h-4 w-4 mr-1"/> Back</Link>
        </Button>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border rounded-2xl p-6 shadow-sm gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {data.app.visa?.name}
            </Badge>
            <span className="text-muted-foreground text-sm">Order ID: {data.app.order_id}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data.app.visa?.country?.name} Visa
          </h1>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Total Amount</p>
            <p className="text-2xl font-bold text-foreground">৳{data.app.final_total_price.toLocaleString()}</p>
          </div>
          {data.app.payment_status !== 'paid' && (
            <Button asChild className="bg-[#14A7A2] hover:bg-[#0f8f8a] shadow-lg shadow-[#14A7A2]/20">
              <Link href={`/payment/${data.app.id}`}>Complete Payment</Link>
            </Button>
          )}
        </div>
      </header>

      {/* 🔹 STEP TRACKER */}
      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4" /> Application Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative flex flex-col md:flex-row justify-between gap-4">
            {STATUS_STEPS.map((step, i) => {
              const status = getStepStatus(step.key, i);
              return (
                <div key={step.key} className="flex-1 flex flex-row md:flex-col items-center gap-3 md:text-center z-10">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors 
                    ${status === 'complete' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      status === 'current' ? 'bg-white border-primary text-primary ring-4 ring-primary/10' : 
                      'bg-white border-slate-200 text-slate-400'}`}
                  >
                    {status === 'complete' ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-[11px] md:text-xs font-bold uppercase tracking-tight 
                    ${status === 'current' ? 'text-primary' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
            {/* Background Connector Line for Desktop */}
            <div className="hidden md:block absolute top-4 left-0 right-0 h-[2px] bg-slate-200 -z-0 mx-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT COL: APPLICANTS */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/30">
              <CardTitle className="text-md flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Travellers
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {data.applicants.map((a: any) => (
                <div key={a.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{a.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{a.profession} • Passport: {a.passport_number}</p>
                    </div>
                    {a.is_primary && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Primary</Badge>}
                  </div>
                  
                  {a.answers_json && (
                    <div className="grid grid-cols-2 gap-4 bg-white border rounded-xl p-4 text-sm">
                      {Object.entries(a.answers_json).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">{k.replace(/_/g, ' ')}</p>
                          <p className="font-medium">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COL: DOCUMENTS & PAYMENT */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.documents.length > 0 ? data.documents.map((doc: any) => (
                <div key={doc.id} className="group flex justify-between items-center p-3 border rounded-xl hover:border-primary/50 transition-all">
                  <span className="text-sm font-medium truncate max-w-[150px]">{doc.file_name}</span>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_url}`} target="_blank">
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </a>
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded</p>
              )}
            </CardContent>
          </Card>

          {data.payment && (
            <Card className="shadow-sm border-primary/20 bg-primary/[0.02]">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-semibold">{data.payment.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trans ID:</span>
                  <span className="font-mono text-xs">{data.payment.transaction_id}</span>
                </div>
                <Badge className="w-full justify-center bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none capitalize">
                  {data.payment.status}
                </Badge>
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${data.payment.payment_proof_url}`} target="_blank">
                    <Download className="h-3 w-3 mr-2" /> View Proof
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}