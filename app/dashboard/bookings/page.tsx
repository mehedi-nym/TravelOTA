'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'


interface TourBooking {
  id: string
  package_id: string
  start_date: string
  end_date: string
  number_of_people: number
  status: string
  total_price: number
  booking_date: string
  tour_package: {
    title: string
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<TourBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    try {
      setLoading(true)
      const supabase = createClient()

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('tour_bookings')
          .select(
            `
            id,
            package_id,
            start_date,
            end_date,
            number_of_people,
            status,
            total_price,
            booking_date,
            tour_package:tour_packages(title)
          `
          )
          .eq('user_id', currentUser.id)
          .order('booking_date', { ascending: false })

        if (error) {
          console.error('[v0] Error fetching bookings:', error)
        } else {
          setBookings(data || [])
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
        <h1 className="text-3xl font-bold text-foreground">Tour Bookings</h1>
        <p className="text-muted-foreground">
          Manage and track your tour bookings
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {Array.isArray(booking.tour_package)
                        ? booking.tour_package[0]?.title
                        : booking.tour_package?.title}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                      <div>
                        <p className="text-xs">Start Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs">End Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs">Travelers</p>
                        <p className="font-medium text-foreground">
                          {booking.number_of_people}{' '}
                          {booking.number_of_people === 1
                            ? 'person'
                            : 'people'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs">Total Price</p>
                        <p className="font-medium text-foreground">
                          ${booking.total_price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge
                      className={`capitalize ${
                        statusColors[booking.status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </Badge>
                    <Link href={`/dashboard/bookings/${booking.id}`}>
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
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="font-semibold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground mb-6">
              Explore amazing tour packages and book your next adventure.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Browse Tours
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
