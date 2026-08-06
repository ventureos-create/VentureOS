import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing, Testimonials, FAQ, CTA, StatsBar, Footer } from "@/components/landing/PricingFaqFooter";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <StatsBar />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
