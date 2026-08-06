"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Code2, Palette, Rocket, Landmark, ArrowRight, ArrowLeft, X } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { UserRole, StartupStage } from "@/types";

const roles: { value: UserRole; icon: typeof Code2; blurb: string }[] = [
  { value: "Founder", icon: Rocket, blurb: "Leading or starting a venture" },
  { value: "Developer", icon: Code2, blurb: "Building the product" },
  { value: "Designer", icon: Palette, blurb: "Shaping the experience" },
  { value: "Investor", icon: Landmark, blurb: "Backing great teams" },
];

const stages: StartupStage[] = ["Idea", "Validating", "Building", "Launched", "Scaling"];

const suggestedSkills = [
  "Product", "Engineering", "Design", "Marketing", "Sales", "Fundraising",
  "Growth", "Data", "Operations", "Finance", "AI/ML", "Community",
];

const suggestedInterests = [
  "SaaS", "Fintech", "Healthtech", "Climate", "Consumer", "Marketplaces",
  "AI", "Developer Tools", "E-commerce", "Web3",
];

export default function OnboardingPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [stage, setStage] = useState<StartupStage | "">("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.emailVerified) {
      router.replace("/verify-email");
      return;
    }
    if (userDoc?.onboardingComplete) {
      router.replace("/dashboard");
      return;
    }
    if (userDoc?.displayName) setName(userDoc.displayName);
  }, [user, userDoc, loading, router]);

  const toggleSkill = (s: string) => {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const addCustomSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const toggleInterest = (s: string) => {
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const steps = [
    { title: "Welcome", valid: name.trim().length > 1 && country.trim().length > 1 },
    { title: "Your role", valid: !!role },
    { title: "Skills & interests", valid: skills.length > 0 && interests.length > 0 },
    { title: "Startup stage", valid: !!stage },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: name,
          country,
          role,
          skills,
          interests,
          startupStage: stage,
          onboardingComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || !userDoc) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="container-px mx-auto flex max-w-2xl flex-col py-12">
        <div className="mb-10 flex items-center gap-2.5">
          <Image src="/logo.png" alt="VentureOS" width={28} height={28} className="rounded-lg" />
          <span className="font-display text-base font-bold text-navy">
            Venture<span className="text-gold-600">OS</span>
          </span>
        </div>

        <div className="mb-8 flex gap-2">
          {steps.map((s, i) => (
            <div key={s.title} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-royal" : "bg-navy-100"}`} />
          ))}
        </div>

        <div className="rounded-xl2 border border-navy-100 bg-white p-8 shadow-premium">
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Tell us about you</h2>
              <p className="mt-1 text-sm text-navy-400">We'll use this to personalize your dashboard.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Full name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Founder" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">Country</label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">What's your role?</h2>
              <p className="mt-1 text-sm text-navy-400">This helps us match you with the right people.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      role === r.value ? "border-royal bg-royal-50" : "border-navy-100 hover:border-navy-200"
                    }`}
                  >
                    <r.icon className={`h-5 w-5 ${role === r.value ? "text-royal" : "text-navy-300"}`} />
                    <p className="mt-2 text-sm font-semibold text-navy">{r.value}</p>
                    <p className="mt-0.5 text-xs text-navy-400">{r.blurb}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Skills & interests</h2>
              <p className="mt-1 text-sm text-navy-400">Pick what applies — you can add your own too.</p>

              <p className="mb-2 mt-6 text-sm font-medium text-navy">Skills</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      skills.includes(s) ? "border-royal bg-royal text-white" : "border-navy-100 text-navy-400 hover:border-navy-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                  placeholder="Add a custom skill"
                />
                <Button type="button" variant="outline" onClick={addCustomSkill}>Add</Button>
              </div>
              {skills.some((s) => !suggestedSkills.includes(s)) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.filter((s) => !suggestedSkills.includes(s)).map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-royal text-white px-3 py-1.5 text-xs font-medium">
                      {s}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSkill(s)} />
                    </span>
                  ))}
                </div>
              )}

              <p className="mb-2 mt-6 text-sm font-medium text-navy">Interests</p>
              <div className="flex flex-wrap gap-2">
                {suggestedInterests.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleInterest(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      interests.includes(s) ? "border-gold-500 bg-gold-500 text-navy-900" : "border-navy-100 text-navy-400 hover:border-navy-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Where's your startup at?</h2>
              <p className="mt-1 text-sm text-navy-400">We'll tailor your AI tools around this stage.</p>
              <div className="mt-6 space-y-2">
                {stages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
                      stage === s ? "border-royal bg-royal-50" : "border-navy-100 hover:border-navy-200"
                    }`}
                  >
                    <span className="text-sm font-medium text-navy">{s}</span>
                    {stage === s && <div className="h-2.5 w-2.5 rounded-full bg-royal" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={handleNext} disabled={!steps[step].valid} loading={saving}>
              {step === steps.length - 1 ? "Finish setup" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
