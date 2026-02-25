'use client'

import { useState, useEffect } from 'react'
import { Check, MapPin, Clock, ArrowRight, ShieldCheck, Zap, SearchX } from 'lucide-react'
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

interface VisaType {
  id: string
  name: string
  description: string
  visa_processing_days: number
  visa_fee: number
  is_active: boolean
  status_badge: string | null // New field from DB
  visa_category: string 
}

interface Country {
  id: string
  name: string
  code: string
  visa_types: VisaType[]
}

export function VisaSearch() {
  const [countries, setCountries] = useState<Country[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchResults, setSearchResults] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    async function fetchCountries() {
      const supabase = createClient()
      const { data } = await supabase
        .from('countries')
        .select(`
          id, name, code,
          visa_types (
            id, name, description, visa_processing_days, visa_fee, is_active, status_badge, visa_category
          )
        `)
        .eq('is_active', true)
      
      setCountries(data || [])
      setLoading(false)
    }
    fetchCountries()
  }, [])

  const handleSearch = () => {
    if (!selectedCountry) return
    setHasSearched(true)
    const results = countries.filter(c => c.name === selectedCountry)
    setSearchResults(results)
  }

  const activeVisaCards = searchResults.flatMap(c => c.visa_types.filter(v => v.is_active))

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="space-y-12">
      {/* Search Input Section */}
      <div className="relative max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2">
        <div className="flex-1 w-full relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                className="w-full justify-start text-lg h-14 hover:bg-transparent px-6 font-medium"
              >
                <MapPin className="mr-3 h-5 w-5 text-[#14A7A2] shrink-0" />
                {selectedCountry ? selectedCountry : "Select destination country..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl overflow-hidden border-none shadow-xl" align="start">
              <Command>
                <CommandInput placeholder="Search countries..." className="h-12" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={(currentValue) => {
                          setSelectedCountry(currentValue === selectedCountry ? "" : currentValue)
                          setOpen(false)
                        }}
                        className="py-4 px-6 cursor-pointer"
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
          className="w-full md:w-auto px-10 h-14 bg-black dark:bg-white dark:text-black text-white rounded-[1.5rem] text-md font-bold transition-all active:scale-95"
        >
          Explore Options
        </Button>
      </div>

      {/* Grid Displaying Multiple Visa Cards per Country */}
      {hasSearched && activeVisaCards.length === 0 ? (
        // THIS IS THE SORRY MESSAGE
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2.5rem] mb-6">
            <SearchX size={48} className="text-slate-300" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tighter leading-tight mb-4">
            Sorry, No Visas Available
          </h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">
            We currently don't have active visa plans for {selectedCountry}. Please try searching for a different destination.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {searchResults.map((country) => (
            country.visa_types
              .filter(type => type.is_active) // Only show active visas
              .map((type) => (
                <div key={type.id} className="group relative bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl border border-slate-100/50 dark:border-slate-800/50 overflow-hidden">
                  
                  {/* Top Accent Ring */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700 z-0" />

                  {/* Dynamic Status Badge */}
                  {type.status_badge && (
                    <div className="absolute top-6 right-6 z-20">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#14A7A2]/10 border border-[#14A7A2]/20 rounded-full">
                        <Zap size={10} className="text-[#14A7A2] fill-[#14A7A2]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#14A7A2]">
                          {type.status_badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#14A7A2] uppercase">
                          {type.name} {/* Specific Visa Name */}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tighter leading-tight">{country.name}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Clock size={12}/> Processing</p>
                        <p className="font-bold text-sm tracking-tight">{type.visa_processing_days} Working Days</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><ShieldCheck size={12}/> Category</p>
                        <p className="font-bold text-sm tracking-tight">{type.visa_category}</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-6 border-t border-slate-50 dark:border-slate-900">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em]">Total Fee</p>
                        <p className="text-3xl font-black text-[#14A7A2] tracking-tighter">৳{type.visa_fee?.toLocaleString()}</p>
                      </div>
                      
                      <Link href={`/visa/${type.id}`} className="z-20">
                        <Button 
                          className="rounded-full h-14 w-14 p-0 shadow-lg hover:rotate-[-45deg] transition-all bg-black dark:bg-white text-white dark:text-black hover:bg-[#14A7A2] dark:hover:bg-[#14A7A2] hover:text-white"
                        >
                          <ArrowRight size={20} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
          ))}
        </div>
      )}
    </div>
  )
}