'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface TourPackage {
  id: string
  title: string
  description: string
  duration_days: number
  price: number
  price_per_person: number
  max_people: number
  highlights: string[]
  itinerary: Record<string, string>
  image_url: string
  country_id: string
}

interface Country {
  name: string
}

export default function TourDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null)
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  async function checkUserAndFetchData() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Check if user is logged in
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)

      // Fetch tour package details
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('[v0] Error fetching tour package:', error)
        router.push('/')
        return
      }

      setTourPackage(data)

      // Fetch country details
      if (data.country_id) {
        const { data: countryData } = await supabase
          .from('countries')
          .select('name')
          .eq('id', data.country_id)
          .single()

        if (countryData) {
          setCountry(countryData)
        }
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error)
      router.push('/')
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

  if (!tourPackage) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">Tour package not found</p>
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
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            ← Back
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            {/* Image */}
            {tourPackage.image_url && (
              <div className="rounded-lg overflow-hidden mb-6 h-96 bg-muted">
                <img
                  src={tourPackage.image_url}
                  alt={tourPackage.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title and description */}
            <h1 className="text-4xl font-bold mb-2">{tourPackage.title}</h1>
            {country && (
              <p className="text-lg text-muted-foreground mb-6">
                Destination: {country.name}
              </p>
            )}

            <p className="text-muted-foreground leading-relaxed mb-8">
              {tourPackage.description}
            </p>

            {/* Highlights */}
            {tourPackage.highlights && tourPackage.highlights.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {tourPackage.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Itinerary */}
            {tourPackage.itinerary && Object.keys(tourPackage.itinerary).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Itinerary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(tourPackage.itinerary).map(([day, description]) => (
                    <div key={day} className="pb-4 border-b last:border-b-0">
                      <h4 className="font-semibold mb-2">{day}</h4>
                      <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-3xl">
                  ${tourPackage.price}
                </CardTitle>
                <CardDescription>
                  {tourPackage.price_per_person &&
                    `$${tourPackage.price_per_person} per person`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{tourPackage.duration_days} Days</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Maximum Travelers</p>
                  <p className="font-semibold">{tourPackage.max_people} People</p>
                </div>

                <div className="pt-4 space-y-2">
                  {user ? (
                    <Link href={`/tour/${tourPackage.id}/book`}>
                      <Button className="w-full bg-primary hover:bg-primary/90 h-12">
                        Book Now
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground text-center">
                        Login to book this tour
                      </p>
                      <Link href="/auth/login" className="block">
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up" className="block">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Questions? Contact our team for more information
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
