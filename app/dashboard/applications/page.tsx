'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Globe, Calendar, CreditCard, ChevronRight, Inbox } from 'lucide-react'

// Types & Config
interface Application {
  id: string
  order_id: string
  status: string
  payment_status: string
  created_at: string
  final_total_price: number
  visa: Array<{
    name: string
    country: Array<{ name: string }>
  }>
}

const statusVariants: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

const paymentVariants: Record<string, string> = {
  unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  verification_pending: 'bg-orange-50 text-orange-700 border-orange-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id, order_id, status, payment_status, final_total_price, created_at,
          visa:visas (name, country:countries (name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setApplications(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading your applications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage your visa journey and track real-time updates.
          </p>
        </div>
        <div className="text-sm font-medium bg-secondary px-3 py-1 rounded-full">
          Total: {applications.length} Applications
        </div>
      </div>

      {/* LIST */}
      {applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="overflow-hidden transition-all hover:shadow-md border-muted/60">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Bar (Mobile: Top, Desktop: Left) */}
                  <div className={`w-full md:w-1.5 ${app.status === 'approved' ? 'bg-emerald-500' : 'bg-primary'}`} />
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      
                      {/* MAIN INFO */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-primary font-medium text-sm">
                            <Globe className="h-4 w-4" />
                            {app.visa?.[0]?.country?.[0]?.name || 'International'}
                          </div>
                          <h3 className="text-xl font-bold tracking-tight">
                            {app.visa?.[0]?.name || 'Visa Application'}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Inbox className="h-4 w-4 text-muted-foreground/70" />
                            <span>ID: <span className="font-mono text-foreground">{app.order_id || app.id.slice(0, 8)}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground/70" />
                            <span>Applied: {new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground/70" />
                            <span className="font-semibold text-foreground">৳{app.final_total_price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* BADGES & ACTIONS */}
                      <div className="flex flex-col items-start md:items-end gap-4 min-w-[200px]">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={`capitalize font-medium shadow-sm ${statusVariants[app.status]}`}>
                            {app.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`capitalize font-medium shadow-sm ${paymentVariants[app.payment_status]}`}>
                            {app.payment_status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 w-full">
                          {app.payment_status !== 'paid' && (
                            <Button asChild size="sm" className="flex-1 bg-[#14A7A2] hover:bg-[#0f8f8a] shadow-sm">
                              <Link href={`/payment/${app.id}`}>Pay Now</Link>
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm" className={app.payment_status === 'paid' ? 'w-full' : 'px-3'}>
                            <Link href={`/dashboard/applications/${app.id}`}>
                              {app.payment_status === 'paid' ? 'View Details' : <ChevronRight className="h-4 w-4" />}
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-3xl bg-muted/30">
          <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold italic text-foreground/80">No applications found</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2 mb-8">
            Your visa journey hasn't started yet. Browse available countries to begin your application.
          </p>
          <Button asChild className="rounded-full px-8 shadow-lg transition-transform hover:scale-105">
            <Link href="/">Explore Visas</Link>
          </Button>
        </div>
      )}
    </div>
  )
}