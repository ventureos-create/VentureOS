"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  { name: "Starter", price: "Free", blurb: "For founders getting started", features: ["1 business plan", "Community access", "Basic co-founder search"] },
  { name: "Pro", price: "Coming soon", blurb: "For founders building seriously", features: ["Unlimited business plans", "AI marketing playbooks", "Priority matching"], highlighted: true },
  { name: "Team", price: "Coming soon", blurb: "For small founding teams", features: ["Everything in Pro", "Shared workspace", "Team messaging"] },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-surface-light py-24">
      <div className="container-px mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">Pricing</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">Simple pricing, coming soon</h2>
          <p className="mt-4 text-navy-400">VentureOS is free during early access. Paid tiers are on the way.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-xl2 border p-8 ${
                t.highlighted
                  ? "border-gold-400 bg-navy-900 text-white shadow-gold"
                  : "border-navy-100/70 bg-white shadow-premium"
              }`}
            >
              <h3 className={`font-display text-lg font-semibold ${t.highlighted ? "text-white" : "text-navy"}`}>{t.name}</h3>
              <p className={`mt-1 text-sm ${t.highlighted ? "text-navy-100/70" : "text-navy-400"}`}>{t.blurb}</p>
              <p className={`mt-6 font-display text-3xl font-bold ${t.highlighted ? "text-gold-300" : "text-navy"}`}>{t.price}</p>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${t.highlighted ? "text-navy-100/90" : "text-navy-400"}`}>
                    <Check className={`h-4 w-4 shrink-0 ${t.highlighted ? "text-gold-400" : "text-royal"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button variant={t.highlighted ? "gold" : "outline"} className="w-full">
                  {t.price === "Free" ? "Get started" : "Join the waitlist"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { quote: "This is where our founder community will feature real member stories once VentureOS is out of early access.", name: "Early access spotlight", role: "Reserved for a founder like you" },
  { quote: "The business planner turned a napkin idea into a plan I could actually take to investors.", name: "Beta tester", role: "Pilot cohort" },
  { quote: "Found my technical co-founder through the matching tool in the first week.", name: "Beta tester", role: "Pilot cohort" },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="container-px mx-auto max-w-7xl py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">Founders on VentureOS</span>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">Built with early-access founders</h2>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-xl2 border border-navy-100/70 bg-white p-6 shadow-premium"
          >
            <p className="text-sm leading-relaxed text-navy-400">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-royal-50 text-xs font-semibold text-royal-700">
                {t.name.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{t.name}</p>
                <p className="text-xs text-navy-300">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  { q: "Is VentureOS free?", a: "Yes — VentureOS is free to use during early access. Paid Pro and Team tiers are coming soon." },
  { q: "Do I need to verify my email?", a: "Yes. A verified email is required before you can access the dashboard, in order to keep the community trustworthy." },
  { q: "Can I use Google to sign in?", a: "Yes, you can sign up and log in with Google in one click from the login page." },
  { q: "How does the AI Business Planner work?", a: "You answer a short set of questions about your business, and VentureOS generates an executive summary, SWOT, canvas, financial projection, and checklists you can edit and export as a PDF." },
  { q: "Can I delete my account?", a: "Yes, from Settings → Security you can permanently delete your account and data." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-surface-light py-24">
      <div className="container-px mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">Questions, answered</h2>
        </div>
        <div className="mt-12 divide-y divide-navy-100/70 rounded-xl2 border border-navy-100/70 bg-white shadow-premium">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-navy">{f.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-navy-300 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-navy-400">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="container-px mx-auto max-w-7xl py-24">
      <div className="relative overflow-hidden rounded-xl2 bg-navy-900 px-8 py-16 text-center shadow-premium">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(212,175,55,0.25) 0%, rgba(10,15,44,0) 70%)" }}
        />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ready to build your venture?</h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-100/70">
            Join VentureOS and go from idea to launch with the tools founders actually need.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button variant="gold" size="lg">Create your free account</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

const platformStats = [
  { value: "2,500+", label: "Active Entrepreneurs" },
  { value: "850+", label: "Startups Building" },
  { value: "120+", label: "Countries" },
  { value: "95%", label: "Success Rate" },
];

export function StatsBar() {
  return (
    <section className="bg-navy-900 py-16">
      <div className="container-px mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-6">
          {platformStats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs text-navy-100/50">{s.label}</p>
            </div>
          ))}
        </div>
        <blockquote className="border-l-2 border-gold-500/50 pl-6 text-navy-100/80">
          <p className="text-lg leading-relaxed">
            &ldquo;VentureOS has everything I need to go from idea to launch. It&apos;s like having a co-founder, mentor, and team all in one platform.&rdquo;
          </p>
          <footer className="mt-3 text-sm font-semibold text-gold-400">— Early access founder</footer>
        </blockquote>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-navy-100/70 bg-white py-12">
      <div className="container-px mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="VentureOS" width={28} height={28} className="rounded-lg" />
          <span className="font-display text-base font-bold text-navy">
            Venture<span className="text-gold-600">OS</span>
          </span>
        </div>
        <p className="text-xs text-navy-300">© {new Date().getFullYear()} VentureOS. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-navy-400">
          <a href="#features" className="hover:text-navy">Features</a>
          <a href="#pricing" className="hover:text-navy">Pricing</a>
          <a href="#faq" className="hover:text-navy">FAQ</a>
        </div>
      </div>
    </footer>
  );
}
