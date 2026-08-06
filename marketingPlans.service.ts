import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MarketingPlanDoc, MarketingPlanInputs } from "@/types";
import { generateMarketingPlaybook } from "@/lib/generators/marketingPlaybook";

type DocumentDataLike = Record<string, unknown>;

function toPlan(id: string, data: DocumentDataLike): MarketingPlanDoc {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as MarketingPlanDoc;
}

export async function createMarketingPlan(userId: string, inputs: MarketingPlanInputs) {
  const generated = generateMarketingPlaybook(inputs);
  const docRef = await addDoc(collection(db, "marketingPlans"), {
    userId,
    inputs,
    ...generated,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getMarketingPlan(planId: string): Promise<MarketingPlanDoc | null> {
  const snap = await getDoc(doc(db, "marketingPlans", planId));
  if (!snap.exists()) return null;
  return toPlan(snap.id, snap.data());
}

export async function listMarketingPlans(userId: string): Promise<MarketingPlanDoc[]> {
  const q = query(
    collection(db, "marketingPlans"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPlan(d.id, d.data()));
}

export async function deleteMarketingPlan(planId: string) {
  await deleteDoc(doc(db, "marketingPlans", planId));
}
