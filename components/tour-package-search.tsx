'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, MapPin, Search, Clock, Users, ArrowRight, Image as ImageIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'

interface Country {
  id: string
  name: string
  code: string
}

interface TourPackage {
  id: string
  title: string
  description: string
  duration_days: number
  price: number
  max_people: number
  image_url: string | null
  country_id: string
}

export function TourPackageSearch() {
  const [countries, setCountries] = useState<Country[]>([])
  const [packages, setPackages] = useState<TourPackage[]>([])
  const [filteredPackages, setFilteredPackages] = useState<TourPackage[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCountryName, setSelectedCountryName] = useState("")
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    async function initData() {
      const supabase = createClient()
      const { data: countryData } = await supabase.from('countries').select('*').eq('is_active', true)
      const { data: packageData } = await supabase.from('tour_packages').select('*').eq('is_active', true)
      setCountries(countryData || [])
      setPackages(packageData || [])
      setLoading(false)
    }
    initData()
  }, [])

  const handleSearch = () => {
    if (!selectedCountryName) return
    const countryObj = countries.find(c => c.name === selectedCountryName)
    const filtered = packages.filter(pkg => pkg.country_id === countryObj?.id)
    setFilteredPackages(filtered)
    setHasSearched(true)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="space-y-12">
      {/* --- MINIMALIST SEARCH BAR (Matches Visa Design) --- */}
      <div className="relative max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2">
        <div className="flex-1 w-full relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                className="w-full justify-start text-lg h-14 hover:bg-transparent px-6 font-medium"
              >
                <MapPin className="mr-3 h-5 w-5 text-primary shrink-0" />
                {selectedCountryName ? selectedCountryName : "Find your next adventure..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl overflow-hidden border-none shadow-xl" align="start">
              <Command>
                <CommandInput placeholder="Search destination..." className="h-12" />
                <CommandList>
                  <CommandEmpty>Destination not found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={(currentValue) => {
                          setSelectedCountryName(currentValue === selectedCountryName ? "" : currentValue)
                          setOpen(false)
                        }}
                        className="py-3 px-6 cursor-pointer"
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedCountryName === country.name ? "opacity-100" : "opacity-0")} />
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Button 
          onClick={handleSearch}
          className="w-full md:w-auto px-10 h-14 bg-black dark:bg-white dark:text-black text-white rounded-[1.5rem] text-md font-bold hover:scale-[1.02] transition-transform active:scale-95"
        >
          View Packages
        </Button>
      </div>

      {/* --- UNIQUE TOUR CARD DESIGN --- */}
      {hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="group flex flex-col bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
              
              {/* Image Section with Price Overlay */}
              <div className="relative h-72 w-full overflow-hidden">
                {pkg.image_url ? (
                  <img 
                    src={pkg.image_url} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <ImageIcon className="text-slate-300" size={48} />
                  </div>
                )}
                {/* Unique Price Tag Overlay */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md dark:bg-black/80 px-4 py-2 rounded-2xl shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-tighter opacity-60">Starting At</p>
                  <p className="text-xl font-black">৳{pkg.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                    <Clock size={12}/> {pkg.duration_days} Days
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-muted-foreground px-3 py-1 rounded-full uppercase tracking-wider">
                    <Users size={12}/> Max {pkg.max_people}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {pkg.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-8 flex-1">
                  {pkg.description}
                </p>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-900 flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground underline underline-offset-4">Explore Itinerary</span>
                  
                  <Link href={`/tour/${pkg.id}`}>
                    <Button 
                      className="rounded-full h-12 w-12 p-0 shadow-lg hover:rotate-[-45deg] transition-all cursor-pointer"
                    >
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results state */}
      {hasSearched && filteredPackages.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="text-lg text-muted-foreground font-medium">We couldn't find any packages for this location yet.</p>
           <Button variant="link" onClick={() => setHasSearched(false)} className="mt-2">Try another destination</Button>
        </div>
      )}
    </div>
  )
}