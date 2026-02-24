'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-32 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
      {/* 1. Floating Newsletter Box */}
      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-40">
        <div className="bg-black dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-md">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Join the adventure.
            </h3>
            <p className="text-slate-400 text-sm md:text-base">
              Get exclusive visa updates and curated tour packages delivered to your inbox weekly.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
            <Input 
              placeholder="Your email" 
              className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-slate-500 w-full md:w-64"
            />
            <Button className="bg-white text-black hover:bg-slate-200 rounded-xl px-6 font-bold">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand Identity */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter">
              TRAVEL<span className="text-primary">OTA.</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              We're redefining the travel experience by simplifying complex visa processes and curating authentic global adventures. Minimalist design for maximum exploration.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-muted-foreground hover:bg-primary hover:text-white transition-all"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Services</h4>
            <ul className="space-y-3">
              {['Visa Search', 'Tour Packages', 'Flight Booking', 'Travel Insurance'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium hover:text-primary transition-colors flex items-center group">
                    {item} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Our Partners', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Contact</h4>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex gap-3">
                <MapPin size={18} className="text-primary shrink-0" />
                <span>123 Global Way, <br /> Travel Hub, NY 10001</span>
              </div>
              <div className="flex gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+1 (555) 000-1234</span>
              </div>
              <div className="flex gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@travelgpt.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} TravelGPT. All rights reserved. Built for modern explorers.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}