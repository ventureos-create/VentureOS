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
import { BusinessPlanDoc, BusinessPlanInputs } from "@/types";
import { generateBusinessPlan } from "@/lib/generators/businessPlan";

function toPlan(id: string, data: DocumentDataLike): BusinessPlanDoc {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as BusinessPlanDoc;
}

// Minimal local alias to avoid importing firestore's DocumentData type everywhere.
type DocumentDataLike = Record<string, unknown>;

export async function createBusinessPlan(userId: string, inputs: BusinessPlanInputs) {
  const generated = generateBusinessPlan(inputs);
  const docRef = await addDoc(collection(db, "businessPlans"), {
    userId,
    inputs,
    ...generated,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function regenerateBusinessPlan(planId: string, inputs: BusinessPlanInputs) {
  const generated = generateBusinessPlan(inputs);
  await updateDoc(doc(db, "businessPlans", planId), {
    inputs,
    ...generated,
    updatedAt: serverTimestamp(),
  });
}

export async function getBusinessPlan(planId: string): Promise<BusinessPlanDoc | null> {
  const snap = await getDoc(doc(db, "businessPlans", planId));
  if (!snap.exists()) return null;
  return toPlan(snap.id, snap.data());
}

export async function listBusinessPlans(userId: string): Promise<BusinessPlanDoc[]> {
  const q = query(
    collection(db, "businessPlans"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPlan(d.id, d.data()));
}

export async function deleteBusinessPlan(planId: string) {
  await deleteDoc(doc(db, "businessPlans", planId));
}
