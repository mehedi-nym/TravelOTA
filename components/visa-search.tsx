'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown, Search, MapPin, Calendar, Clock, ArrowRight, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from 'next/link'
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
  visa_processing_days: number | null
  visa_fee: number | null
}

export function VisaSearch() {
  const [countries, setCountries] = useState<Country[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchResults, setSearchResults] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCountries() {
      const supabase = createClient()
      const { data } = await supabase.from('countries').select('*').eq('is_active', true)
      setCountries(data || [])
      setLoading(false)
    }
    fetchCountries()
  }, [])

  const handleSearch = () => {
    if (!selectedCountry) return
    const results = countries.filter(c => c.name === selectedCountry)
    setSearchResults(results)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="space-y-12">
      {/* --- UNIQUE MINIMALIST SEARCH BAR --- */}
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
                {selectedCountry ? selectedCountry : "Where do you want to go?"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl overflow-hidden border-none shadow-xl" align="start">
              <Command>
                <CommandInput placeholder="Type a country name..." className="h-12" />
                <CommandList>
                  <CommandEmpty>No destination found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={(currentValue) => {
                          setSelectedCountry(currentValue === selectedCountry ? "" : currentValue)
                          setOpen(false)
                        }}
                        className="py-3 px-6 cursor-pointer"
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedCountry === country.name ? "opacity-100" : "opacity-0")} />
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
          Explore Visas
        </Button>
      </div>

      {/* --- THE UNIQUE CARD DESIGN --- */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {searchResults.map((country) => (
            <div key={country.id} className="group relative bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-transparent hover:border-slate-100 dark:hover:border-slate-800 overflow-hidden">
              
              {/* Top Accent Ring */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Official Entry</p>
                    <h3 className="text-3xl font-bold tracking-tight">{country.name}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs">{country.code}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Clock size={12}/> Processing</p>
                    <p className="font-semibold text-sm">{country.visa_processing_days || '5-7'} Days</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Calendar size={12}/> Stay Period</p>
                    <p className="font-semibold text-sm">30 Days</p>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-6 border-t border-slate-50 dark:border-slate-900">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Fee</p>
                    <p className="text-2xl font-black">৳{country.visa_fee?.toLocaleString()}</p>
                  </div>
                  <Link href={`/visa/${country.id}`}>
  <Button 
    className="rounded-full h-14 w-14 p-0 shadow-lg hover:rotate-[-45deg] transition-all cursor-pointer"
    aria-label="View visa details"
  >
    <ArrowRight size={20} />
  </Button>
</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}