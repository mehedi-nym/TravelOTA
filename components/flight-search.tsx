'use client'

import { Card } from '@/components/ui/card'

export function FlightSearch() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">✈️</div>
      <h3 className="text-2xl font-bold mb-4 text-foreground">Flight Search Coming Soon</h3>
      <p className="text-muted-foreground max-w-lg mx-auto mb-6">
        We're working on integrating flight search capabilities. This feature will be available soon with real-time pricing and availability for flights worldwide.
      </p>
      <Card className="p-6 max-w-lg mx-auto bg-secondary/10 border-secondary/20">
        <p className="text-sm text-muted-foreground">
          In the meantime, you can browse our visa services and tour packages to plan your next adventure.
        </p>
      </Card>
    </div>
  )
}
