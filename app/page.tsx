import { AnimatedGrid } from "@/components/home/animated-grid"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { Navbar } from "@/components/home/navbar"

export default function Page() {
  return (
    <div style={{ background: "#0A0A0B", minHeight: "100vh" }}>
      <AnimatedGrid />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <HowItWorks />
        </main>
      </div>
    </div>
  )
}
