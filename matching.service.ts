import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProfileDoc, ConnectionDoc } from "@/types";
import { createNotification } from "@/services/notifications.service";

type DocLike = Record<string, unknown>;

function toProfile(id: string, data: DocLike): ProfileDoc {
  return {
    uid: id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as ProfileDoc;
}

function toConnection(id: string, data: DocLike): ConnectionDoc {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as ConnectionDoc;
}

export async function upsertProfile(uid: string, profile: Partial<ProfileDoc>) {
  const ref = doc(db, "profiles", uid);
  const snap = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...profile,
      uid,
      createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getProfile(uid: string): Promise<ProfileDoc | null> {
  const snap = await getDoc(doc(db, "profiles", uid));
  if (!snap.exists()) return null;
  return toProfile(snap.id, snap.data());
}

export async function listProfiles(excludeUid?: string): Promise<ProfileDoc[]> {
  const snap = await getDocs(query(collection(db, "profiles"), orderBy("updatedAt", "desc")));
  return snap.docs.map((d) => toProfile(d.id, d.data())).filter((p) => p.uid !== excludeUid);
}

export async function sendConnectionRequest(params: {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  message: string;
}) {
  await addDoc(collection(db, "connections"), {
    ...params,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await createNotification({
    userId: params.toId,
    type: "connection",
    message: `${params.fromName} wants to connect with you`,
    link: "/dashboard/matching",
  });
}

export async function respondToConnection(connectionId: string, status: "accepted" | "declined") {
  await updateDoc(doc(db, "connections", connectionId), { status });
}

export async function listConnectionsForUser(uid: string): Promise<ConnectionDoc[]> {
  const [fromSnap, toSnap] = await Promise.all([
    getDocs(query(collection(db, "connections"), where("fromId", "==", uid))),
    getDocs(query(collection(db, "connections"), where("toId", "==", uid))),
  ]);
  const all = [...fromSnap.docs, ...toSnap.docs].map((d) => toConnection(d.id, d.data()));
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteConnection(connectionId: string) {
  await deleteDoc(doc(db, "connections", connectionId));
}
