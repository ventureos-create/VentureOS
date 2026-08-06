"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowRight, Brain, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  createBusinessPlan,
  deleteBusinessPlan,
  listBusinessPlans,
} from "@/services/businessPlans.service";
import { BusinessPlanDoc, BusinessPlanInputs } from "@/types";
import { timeAgo } from "@/lib/utils";

const emptyInputs: BusinessPlanInputs = {
  businessName: "",
  problem: "",
  solution: "",
  targetMarket: "",
  revenueModel: "",
  competitors: "",
  pricing: "",
  goals: "",
};

const fields: { key: keyof BusinessPlanInputs; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "businessName", label: "Business name", placeholder: "e.g. Northbeam" },
  { key: "problem", label: "Problem", placeholder: "What problem are you solving?", multiline: true },
  { key: "solution", label: "Solution", placeholder: "How do you solve it?", multiline: true },
  { key: "targetMarket", label: "Target market", placeholder: "Who is this for?", multiline: true },
  { key: "revenueModel", label: "Revenue model", placeholder: "How do you make money?" },
  { key: "competitors", label: "Competitors", placeholder: "Who else solves this?" },
  { key: "pricing", label: "Pricing", placeholder: "e.g. $29/month per seat" },
  { key: "goals", label: "Goals", placeholder: "What are you aiming for in the next 6-12 months?", multiline: true },
];

export default function PlannerListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<BusinessPlanDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inputs, setInputs] = useState<BusinessPlanInputs>(emptyInputs);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setPlans(await listBusinessPlans(user.uid));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGenerating(true);
    try {
      const id = await createBusinessPlan(user.uid, inputs);
      router.push(`/dashboard/planner/${id}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this business plan? This can't be undone.")) return;
    await deleteBusinessPlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const allFilled = Object.values(inputs).every((v) => v.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-sm text-navy-400">
          Answer a few questions about your business and get a full plan — executive summary, SWOT,
          canvas, financial projection, and checklists.
        </p>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close" : "New plan"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
                  <label className="mb-1.5 block text-sm font-medium text-navy">{f.label}</label>
                  {f.multiline ? (
                    <Textarea
                      required
                      value={inputs[f.key]}
                      onChange={(e) => setInputs((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <Input
                      required
                      value={inputs[f.key]}
                      onChange={(e) => setInputs((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2">
                <Button type="submit" loading={generating} disabled={!allFilled} className="w-full md:w-auto">
                  Generate business plan <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Brain className="h-8 w-8 text-navy-200" />
            <p className="text-sm text-navy-400">No business plans yet. Generate your first one above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="font-display font-semibold text-navy">{p.inputs.businessName}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-navy-400">{p.executiveSummary}</p>
                <p className="mt-3 text-xs text-navy-300">Updated {timeAgo(p.updatedAt)}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/planner/${p.id}`)}
                  >
                    Open
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
