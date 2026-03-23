'use client'
import { useEffect, useRef } from "react"

export function HeroSection() {

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.67;
    }
  }, []);

  return (
    <section className="relative w-full h-96 bg-slate-900 text-white overflow-hidden">
      {/* 1. The Video Layer */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60" // Lower opacity helps text pop
      >
        <source src="https://ejjlqsybirqpwrliaute.supabase.co/storage/v1/object/public/resource/cover_vid.mp4" type="video/mp4" />
      </video> 

      {/* 1. The Image Layer 
      <img 
  src="https://ejjlqsybirqpwrliaute.supabase.co/storage/v1/object/public/resource/cover1.jpg" // or .gif
  alt="Travel Background"
  className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
/> */}

      {/* 2. Gradient Overlay (Ensures text is readable regardless of video brightness) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />

      {/* Decorative elements (Your original blurs) */}
      <div className="absolute inset-0 opacity-20 z-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="relative z-30 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance drop-shadow-lg">
          Explore the World with Confidence
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mb-8 text-balance drop-shadow-md">
          Your one-stop solution for hassle-free travel planning.
        </p>
      </div>
    </section>
  )
}