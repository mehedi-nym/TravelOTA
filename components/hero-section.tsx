'use client'

export function HeroSection() {
  return (
    <section className="relative w-full h-96 bg-gradient-to-br from-primary via-accent to-primary/80 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
          Explore the World with Confidence
        </h1>
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl text-pretty">
          Simplifying visa processing, booking amazing tours, and connecting you to incredible travel experiences worldwide.
        </p>
      </div>
    </section>
  )
}
