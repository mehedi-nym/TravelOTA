'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface TourPackage {
  id: string
  title: string
  price: number
  duration_days: number
  max_people: number
}

export default function BookTourPage() {
  const params = useParams()
  const router = useRouter()
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    numberOfPeople: '1',
    specialRequests: '',
  })

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

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Fetch tour package details
      const { data, error } = await supabase
        .from('tour_packages')
        .select('id, title, price, duration_days, max_people')
        .eq('id', params.id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('[v0] Error fetching tour package:', error)
        router.push('/')
        return
      }

      setTourPackage(data)
    } catch (error) {
      console.error('[v0] Fetch error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotalPrice = () => {
    if (!tourPackage) return 0
    return tourPackage.price * parseInt(formData.numberOfPeople || '1')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from('tour_bookings').insert({
        user_id: user.id,
        package_id: tourPackage?.id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        number_of_people: parseInt(formData.numberOfPeople),
        special_requests: formData.specialRequests || null,
        total_price: calculateTotalPrice(),
        status: 'pending',
      })

      if (error) {
        console.error('[v0] Error booking tour:', error)
        alert('Failed to book tour. Please try again.')
        return
      }

      alert('Booking confirmed! Check your dashboard for details.')
      router.push('/dashboard/bookings')
    } catch (error) {
      console.error('[v0] Submit error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (!tourPackage || !user) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Unable to load booking form
          </p>
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
        <Link href={`/tour/${tourPackage.id}`}>
          <Button variant="ghost" className="mb-6">
            ← Back
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book {tourPackage.title}</CardTitle>
                <CardDescription>
                  Fill in your booking details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Start Date <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange('startDate', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        End Date <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange('endDate', e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Number of Travelers{' '}
                      <span className="text-destructive">*</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (Max: {tourPackage.max_people})
                      </span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={tourPackage.max_people}
                      value={formData.numberOfPeople}
                      onChange={(e) =>
                        handleInputChange('numberOfPeople', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Special Requests
                    </label>
                    <Textarea
                      placeholder="Any special requests or dietary requirements?"
                      value={formData.specialRequests}
                      onChange={(e) =>
                        handleInputChange('specialRequests', e.target.value)
                      }
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 h-12"
                  >
                    {submitting ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tour</p>
                  <p className="font-semibold">{tourPackage.title}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Duration
                  </p>
                  <p className="font-semibold">
                    {tourPackage.duration_days} days
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Price per Person
                  </p>
                  <p className="font-semibold">
                    ${tourPackage.price}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Number of Travelers
                  </p>
                  <p className="font-semibold">
                    {formData.numberOfPeople || 1}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Total</p>
                  <p className="text-3xl font-bold text-primary">
                    ${calculateTotalPrice()}
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
