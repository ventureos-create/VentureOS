"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getMarketingPlan, deleteMarketingPlan } from "@/services/marketingPlans.service";
import { MarketingPlanDoc } from "@/types";
import { exportMarketingPlaybookPDF } from "@/lib/pdf";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="p-6 pb-0">
        <CardTitle>{title}</CardTitle>
      </div>
      <CardContent className="p-6 pt-3 text-sm leading-relaxed text-navy-400">{children}</CardContent>
    </Card>
  );
}

export default function MarketingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<MarketingPlanDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setPlan(await getMarketingPlan(id));
      setLoading(false);
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this playbook? This can't be undone.")) return;
    await deleteMarketingPlan(id);
    router.push("/dashboard/marketing");
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!plan) return <p className="py-16 text-center text-sm text-navy-400">Playbook not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => router.push("/dashboard/marketing")} className="flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy">
          <ArrowLeft className="h-4 w-4" /> Back to playbooks
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportMarketingPlaybookPDF(plan)}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-navy">{plan.inputs.businessName} — Marketing Playbook</h2>

      <Card>
        <div className="p-6 pb-0"><CardTitle>30-Day Content Calendar</CardTitle></div>
        <CardContent className="grid gap-2 p-6 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {plan.contentCalendar.map((d) => (
            <div key={d.day} className="rounded-lg border border-navy-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-royal">Day {d.day} · {d.platform}</p>
              <p className="mt-1 text-sm text-navy-400">{d.idea}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Section title="Instagram Strategy">{plan.instagramStrategy}</Section>
      <Section title="TikTok Strategy">{plan.tiktokStrategy}</Section>
      <Section title="LinkedIn Strategy">{plan.linkedinStrategy}</Section>

      <Card>
        <div className="p-6 pb-0"><CardTitle>Email Campaign</CardTitle></div>
        <CardContent className="space-y-2 p-6 pt-3">
          {plan.emailCampaign.map((e, i) => (
            <p key={i} className="text-sm text-navy-400"><span className="font-medium text-navy">{i + 1}.</span> {e}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <div className="p-6 pb-0"><CardTitle>Launch Plan</CardTitle></div>
        <CardContent className="space-y-2 p-6 pt-3">
          {plan.launchPlan.map((e, i) => (
            <p key={i} className="text-sm text-navy-400">• {e}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <div className="p-6 pb-0"><CardTitle>Sales Funnel</CardTitle></div>
        <CardContent className="grid gap-3 p-6 pt-3 sm:grid-cols-2">
          {plan.salesFunnel.map((s) => (
            <div key={s.stage} className="rounded-lg border border-navy-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-royal">{s.stage}</p>
              <p className="mt-1 text-sm text-navy-400">{s.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <div className="p-6 pb-0"><CardTitle>SEO Plan</CardTitle></div>
        <CardContent className="space-y-2 p-6 pt-3">
          {plan.seoPlan.map((e, i) => (
            <p key={i} className="text-sm text-navy-400">• {e}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
