"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowRight, Megaphone, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  createMarketingPlan,
  deleteMarketingPlan,
  listMarketingPlans,
} from "@/services/marketingPlans.service";
import { MarketingPlanDoc, MarketingPlanInputs } from "@/types";
import { timeAgo } from "@/lib/utils";

const emptyInputs: MarketingPlanInputs = {
  businessName: "",
  product: "",
  audience: "",
  budget: "",
  goals: "",
};

export default function MarketingListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<MarketingPlanDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inputs, setInputs] = useState<MarketingPlanInputs>(emptyInputs);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setPlans(await listMarketingPlans(user.uid));
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
      const id = await createMarketingPlan(user.uid, inputs);
      router.push(`/dashboard/marketing/${id}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this playbook? This can't be undone.")) return;
    await deleteMarketingPlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const allFilled = Object.values(inputs).every((v) => v.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-sm text-navy-400">
          Generate a 30-day content calendar, channel strategies, email campaign, launch plan, sales
          funnel, and SEO plan for your product.
        </p>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close" : "New playbook"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Business name</label>
                <Input required value={inputs.businessName} onChange={(e) => setInputs({ ...inputs, businessName: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Budget</label>
                <Input required placeholder="e.g. $500/month" value={inputs.budget} onChange={(e) => setInputs({ ...inputs, budget: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">Product</label>
                <Textarea required value={inputs.product} onChange={(e) => setInputs({ ...inputs, product: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">Target audience</label>
                <Textarea required value={inputs.audience} onChange={(e) => setInputs({ ...inputs, audience: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-navy">Marketing goals</label>
                <Textarea required value={inputs.goals} onChange={(e) => setInputs({ ...inputs, goals: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" loading={generating} disabled={!allFilled} className="w-full md:w-auto">
                  Generate playbook <ArrowRight className="h-4 w-4" />
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
            <Megaphone className="h-8 w-8 text-navy-200" />
            <p className="text-sm text-navy-400">No playbooks yet. Generate your first one above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="font-display font-semibold text-navy">{p.inputs.businessName}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-navy-400">{p.instagramStrategy}</p>
                <p className="mt-3 text-xs text-navy-300">Updated {timeAgo(p.updatedAt)}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/marketing/${p.id}`)}>
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
