"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Users,
  MessageSquare,
  Megaphone,
  Newspaper,
  UserCircle,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Business Planner",
    description:
      "Answer a few questions and get an executive summary, SWOT, business canvas, financial projection, and startup checklist — ready to export.",
  },
  {
    icon: Users,
    title: "Co-Founder Matching",
    description:
      "Build a founder profile, search by skills, industry, and availability, and send connection requests to people who complement you.",
  },
  {
    icon: Newspaper,
    title: "Community Feed",
    description:
      "Share updates, ask questions, and follow founders further along the path — with likes, comments, and bookmarks.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Messaging",
    description:
      "Chat directly with connections. Seen receipts, typing indicators, and unread counts keep conversations moving.",
  },
  {
    icon: Megaphone,
    title: "AI Marketing Playbook",
    description:
      "Generate a 30-day content calendar, channel strategies, an email campaign, and a launch plan tailored to your product.",
  },
  {
    icon: UserCircle,
    title: "Founder Profile",
    description:
      "One page for your bio, skills, achievements, and startup projects — the resume built for builders.",
  },
];

export function Features() {
  return (
    <section id="features" className="container-px mx-auto max-w-7xl py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
          Everything you need
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">
          One platform, from idea to launch
        </h2>
        <p className="mt-4 text-navy-400">
          VentureOS replaces a dozen scattered tools with a single, focused workspace for founders.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            className="group rounded-xl2 border border-navy-100/70 bg-white p-6 shadow-premium transition-shadow hover:shadow-gold"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-royal-gradient">
              <f.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-navy">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-400">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
