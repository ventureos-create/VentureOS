"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(29,78,216,0.5) 0%, rgba(10,15,44,0) 70%)",
        }}
      />
      <div className="container-px relative mx-auto flex max-w-5xl flex-col items-center py-28 text-center md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium text-gold-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Build. Connect. Launch.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          The Operating System
          <br />
          for <span className="text-gradient-gold">Entrepreneurs</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-navy-100/80"
        >
          Plan your business with AI, find a co-founder who complements you,
          and grow inside a community built by founders — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link href="/signup">
            <Button variant="gold" size="lg" className="group">
              Start building free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
              See what&apos;s inside
            </Button>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-xs text-navy-100/50"
        >
          No credit card required · Free while in early access
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex items-center gap-3"
        >
          <div className="flex -space-x-3">
            {["#1D4ED8", "#D4AF37", "#10296F", "#B08D24"].map((color, i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-full border-2 border-navy-900"
                style={{ background: color }}
              />
            ))}
          </div>
          <p className="text-left text-xs text-navy-100/60">
            Join 2,500+ entrepreneurs
            <br />
            building the next big thing
          </p>
        </motion.div>
      </div>
    </section>
  );
}
