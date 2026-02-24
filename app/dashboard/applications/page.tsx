'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

interface VisaApplication {
  id: string
  country_id: string
  status: string
  submitted_at: string
  country: {
    name: string
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<VisaApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      setLoading(true)
      const supabase = createClient()

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('visa_applications')
          .select(
            `
            id,
            country_id,
            status,
            submitted_at,
            country:countries(name)
          `
          )
          .eq('user_id', currentUser.id)
          .order('submitted_at', { ascending: false })

        if (error) {
          console.error('[v0] Error fetching applications:', error)
        } else {
          setApplications(data || [])
        }
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Visa Applications</h1>
        <p className="text-muted-foreground">
          Track and manage your visa applications
        </p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {Array.isArray(app.country)
                        ? app.country[0]?.name
                        : app.country?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Application ID: {app.id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted:{' '}
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={`capitalize ${
                        statusColors[app.status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </Badge>
                    <Link href={`/dashboard/applications/${app.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
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
            <h3 className="font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your visa application journey by exploring available countries.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Browse Countries
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
