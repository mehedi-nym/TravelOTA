'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface Application {
  id: string
  order_id: string
  status: string
  payment_status: string
  created_at: string
  final_total_price: number

  visa: {
    name: string
    country: {
      name: string
    }
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-800',
  verification_pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      setLoading(true)
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setApplications([])
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          order_id,
          status,
          payment_status,
          final_total_price,
          created_at,
          visa:visas (
            name,
            country:countries ( name )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error)
      } else {
        setApplications(data || [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track your visa applications and payment status
        </p>
      </div>

      {/* LIST */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  {/* LEFT INFO */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">
                      {app.visa?.country?.name || 'Visa'} Visa
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {app.visa?.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Order ID: {app.order_id || app.id.slice(0, 8)}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Submitted:{' '}
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>

                    <p className="text-sm font-medium">
                      Amount: ৳{app.final_total_price}
                    </p>
                  </div>

                  {/* RIGHT ACTIONS */}
                  <div className="flex flex-col items-end gap-2">

                    {/* STATUS */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge
                        className={`capitalize ${
                          statusColors[app.status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>

                      <Badge
                        className={`capitalize ${
                          paymentColors[app.payment_status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {app.payment_status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">

                      {/* PAYMENT BUTTON */}
                      {app.payment_status !== 'paid' && (
                        <Link href={`/payment/${app.id}`}>
                          <Button
                            size="sm"
                            className="bg-[#14A7A2] text-white hover:bg-[#0f8f8a]"
                          >
                            Complete Payment
                          </Button>
                        </Link>
                      )}

                      {/* DETAILS */}
                      <Link href={`/dashboard/applications/${app.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>

                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="text-4xl mb-4">📋</div>

            <h3 className="font-semibold mb-2">
              No Applications Yet
            </h3>

            <p className="text-muted-foreground mb-6">
              Start your visa application journey by exploring countries.
            </p>

            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800">
                Browse Visas
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}