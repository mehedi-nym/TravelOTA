'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ApplicationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetails()
  }, [])

  async function fetchDetails() {
    try {
      setLoading(true)

      // 🔹 1. Fetch Application
      const { data: app } = await supabase
        .from('applications')
        .select(`
          *,
          visa:visas (
            name,
            country:countries ( name )
          )
        `)
        .eq('id', id)
        .single()

      if (!app) {
        router.push('/dashboard/applications')
        return
      }

      // 🔹 2. Fetch Applicants
      const { data: applicants } = await supabase
        .from('application_applicants')
        .select('*')
        .eq('application_id', id)

      // 🔹 3. Fetch Documents
      const { data: documents } = await supabase
        .from('applicant_documents')
        .select('*')

      // 🔹 4. Fetch Payment
      const { data: payment } = await supabase
        .from('application_payments')
        .select('*')
        .eq('application_id', id)
        .maybeSingle()

      setData({
        app,
        applicants: applicants || [],
        documents: documents || [],
        payment
      })

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 STATUS STEP LOGIC
  const getSteps = () => {
    return [
      {
        label: 'Application Submitted',
        done: true
      },
      {
        label: 'Payment',
        done: data?.app.payment_status === 'paid',
        pending: data?.app.payment_status !== 'paid'
      },
      {
        label: 'Under Review',
        done: data?.app.status === 'processing' || data?.app.status === 'approved',
      },
      {
        label: 'Approved',
        done: data?.app.status === 'approved'
      }
    ]
  }

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8">

      {/* 🔹 HEADER */}
      <Card className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">
          {data.app.visa?.country?.name} Visa
        </h1>

        <div className="flex justify-between text-sm">
          <span>Order ID:</span>
          <span className="font-bold">{data.app.order_id}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Total Amount:</span>
          <span className="font-bold">
            ৳{data.app.final_total_price}
          </span>
        </div>

        <div className="flex gap-3">
          <Badge>{data.app.status}</Badge>
          <Badge>
            {data.app.payment_status.replace('_', ' ')}
          </Badge>
        </div>

        {/* PAYMENT BUTTON */}
        {data.app.payment_status !== 'paid' && (
          <Link href={`/payment/${data.app.id}`}>
            <Button className="bg-[#14A7A2] text-white">
              Complete Payment
            </Button>
          </Link>
        )}
      </Card>

      {/* 🔹 STEP TRACKER */}
      <Card className="p-6">
        <h2 className="font-bold mb-4">Application Progress</h2>

        <div className="flex justify-between">
          {getSteps().map((step, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center 
                ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200'}
              `}>
                {i + 1}
              </div>
              <p className="text-xs mt-2">{step.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 🔹 APPLICANTS */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Travellers</h2>

        {data.applicants.map((a: any) => (
          <div key={a.id} className="border p-4 rounded-xl space-y-2">
            <p><b>Name:</b> {a.full_name}</p>
            <p><b>Passport:</b> {a.passport_number}</p>
            <p><b>Phone:</b> {a.phone_number}</p>
            <p><b>Profession:</b> {a.profession}</p>

            {a.is_primary && (
              <Badge>Primary Applicant</Badge>
            )}

            {/* Dynamic Answers */}
            {a.answers_json && (
              <div className="text-sm mt-2">
                <b>Additional Info:</b>
                {Object.entries(a.answers_json).map(([k, v]) => (
                  <p key={k}>{k}: {String(v)}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </Card>

      {/* 🔹 DOCUMENTS */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold">Documents</h2>

        {data.documents.map((doc: any) => (
          <div key={doc.id} className="flex justify-between items-center border p-3 rounded-lg">
            <span>{doc.file_name}</span>
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_url}`}
              target="_blank"
              className="text-blue-500"
            >
              View
            </a>
          </div>
        ))}
      </Card>

      {/* 🔹 PAYMENT INFO */}
      {data.payment && (
        <Card className="p-6 space-y-3">
          <h2 className="font-bold">Payment Info</h2>

          <p><b>Bank:</b> {data.payment.bank_name}</p>
          <p><b>Transaction ID:</b> {data.payment.transaction_id}</p>
          <p><b>Status:</b> {data.payment.status}</p>

          <a
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${data.payment.payment_proof_url}`}
            target="_blank"
            className="text-blue-500"
          >
            View Payment Proof
          </a>
        </Card>
      )}

    </div>
  )
}