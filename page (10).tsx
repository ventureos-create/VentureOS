"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, RefreshCw, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  getBusinessPlan,
  regenerateBusinessPlan,
  deleteBusinessPlan,
} from "@/services/businessPlans.service";
import { BusinessPlanDoc, BusinessPlanInputs } from "@/types";
import { exportBusinessPlanPDF } from "@/lib/pdf";

export default function BusinessPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<BusinessPlanDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inputs, setInputs] = useState<BusinessPlanInputs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getBusinessPlan(id);
      setPlan(data);
      if (data) setInputs(data.inputs);
      setLoading(false);
    })();
  }, [id]);

  const handleRegenerate = async () => {
    if (!inputs) return;
    setSaving(true);
    try {
      await regenerateBusinessPlan(id, inputs);
      const data = await getBusinessPlan(id);
      setPlan(data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this business plan? This can't be undone.")) return;
    await deleteBusinessPlan(id);
    router.push("/dashboard/planner");
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner /></div>;
  }

  if (!plan || !inputs) {
    return <p className="py-16 text-center text-sm text-navy-400">Business plan not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/dashboard/planner")}
          className="flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
            <Pencil className="h-4 w-4" /> {editing ? "Cancel edit" : "Edit"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportBusinessPlanPDF(plan)}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-navy">{plan.inputs.businessName}</h2>

      {editing && inputs ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {(Object.keys(inputs) as (keyof BusinessPlanInputs)[]).map((key) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium capitalize text-navy">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <Textarea
                  value={inputs[key]}
                  onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                />
              </div>
            ))}
            <Button onClick={handleRegenerate} loading={saving}>
              <RefreshCw className="h-4 w-4" /> Save & regenerate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader2 title="Executive Summary" />
            <CardContent className="p-6 pt-3 text-sm leading-relaxed text-navy-400">
              {plan.executiveSummary}
            </CardContent>
          </Card>

          <Card>
            <CardHeader2 title="Business Plan" />
            <CardContent className="whitespace-pre-line p-6 pt-3 text-sm leading-relaxed text-navy-400">
              {plan.businessPlan}
            </CardContent>
          </Card>

          <Card>
            <CardHeader2 title="SWOT Analysis" />
            <CardContent className="grid gap-4 p-6 pt-3 sm:grid-cols-2">
              {(
                [
                  ["Strengths", plan.swot.strengths, "default"],
                  ["Weaknesses", plan.swot.weaknesses, "outline"],
                  ["Opportunities", plan.swot.opportunities, "gold"],
                  ["Threats", plan.swot.threats, "outline"],
                ] as const
              ).map(([label, items, variant]) => (
                <div key={label}>
                  <p className="mb-2 text-sm font-semibold text-navy">{label}</p>
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <p key={i} className="text-sm text-navy-400">
                        <Badge variant={variant} className="mr-1.5">•</Badge>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader2 title="Business Model Canvas" />
            <CardContent className="grid gap-4 p-6 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(plan.canvas).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-navy-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-royal">{key}</p>
                  <p className="mt-1 text-sm text-navy-400">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader2 title="Financial Projection" />
            <CardContent className="overflow-x-auto p-6 pt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-left text-navy-300">
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium">Revenue</th>
                    <th className="pb-2 font-medium">Costs</th>
                    <th className="pb-2 font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.financialProjection.map((row) => (
                    <tr key={row.year} className="border-b border-navy-50 last:border-0">
                      <td className="py-2.5 font-medium text-navy">{row.year}</td>
                      <td className="py-2.5 text-navy-400">{row.revenue}</td>
                      <td className="py-2.5 text-navy-400">{row.costs}</td>
                      <td className="py-2.5 font-medium text-royal">{row.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader2 title="Marketing Summary" />
            <CardContent className="p-6 pt-3 text-sm leading-relaxed text-navy-400">
              {plan.marketingSummary}
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader2 title="Legal Checklist" />
              <CardContent className="space-y-2 p-6 pt-3">
                {plan.legalChecklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-2 text-sm text-navy-400">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-navy-200 text-royal" />
                    {item}
                  </label>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader2 title="Startup Checklist" />
              <CardContent className="space-y-2 p-6 pt-3">
                {plan.startupChecklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-2 text-sm text-navy-400">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-navy-200 text-royal" />
                    {item}
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function CardHeader2({ title }: { title: string }) {
  return (
    <div className="p-6 pb-0">
      <CardTitle>{title}</CardTitle>
    </div>
  );
}
