'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface Country {
  id: string
  name: string
  code: string
  priority: number
  description: string
  visa_processing_days: number | null
  visa_fee: number | null
}

export default function VisaDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUserAndFetchCountry()
  }, [])

  async function checkUserAndFetchCountry() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Check if user is logged in
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)

      // Fetch country details
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('[v0] Error fetching country:', error)
        router.push('/auth/login')
      } else {
        setCountry(data)
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (!country) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">Country not found</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            ← Back
          </Button>
        </Link>

        {/* Country header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{country.name}</h1>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Country Code</p>
              <p className="text-lg font-semibold">{country.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing Time</p>
              <p className="text-lg font-semibold">
                {country.visa_processing_days
                  ? `${country.visa_processing_days} days`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visa Fee</p>
              <p className="text-lg font-semibold">
                {country.visa_fee ? `$${country.visa_fee}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {country.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About {country.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {country.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Visa Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Visa Information</CardTitle>
            <CardDescription>
              Complete guide for applying for {country.name} visa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Processing Details</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Standard processing available</li>
                  <li>✓ Express processing available</li>
                  <li>✓ Online application supported</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Required Documents</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Valid passport</li>
                  <li>✓ Proof of funds</li>
                  <li>✓ Travel itinerary</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apply Now Button */}
        {user ? (
          <Link href={`/visa/${country.id}/apply`}>
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-lg">
              Apply Now for {country.name} Visa
            </Button>
          </Link>
        ) : (
          <div className="space-y-4">
            <Card className="p-6 bg-secondary/10 border-secondary/20">
              <p className="text-sm text-foreground mb-4">
                You need to be logged in to apply for a visa.
              </p>
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
