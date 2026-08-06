import {
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChatDoc, MessageDoc } from "@/types";

type DocLike = Record<string, unknown>;

function toChat(id: string, data: DocLike): ChatDoc {
  return {
    id,
    ...data,
    lastMessageAt: (data.lastMessageAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as ChatDoc;
}

function toMessage(id: string, data: DocLike): MessageDoc {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as MessageDoc;
}

/** Finds or creates a 1:1 chat between two users, using a deterministic doc id. */
export async function getOrCreateChat(
  uidA: string,
  nameA: string,
  photoA: string | null,
  uidB: string,
  nameB: string,
  photoB: string | null
): Promise<string> {
  const chatId = [uidA, uidB].sort().join("_");
  const ref = doc(db, "chats", chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uidA, uidB],
      participantNames: { [uidA]: nameA, [uidB]: nameB },
      participantPhotos: { [uidA]: photoA, [uidB]: photoB },
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      lastSenderId: "",
      unreadCount: { [uidA]: 0, [uidB]: 0 },
      typing: { [uidA]: false, [uidB]: false },
    });
  }
  return chatId;
}

export function subscribeToChats(uid: string, cb: (chats: ChatDoc[]) => void) {
  const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => toChat(d.id, d.data()));
    chats.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    cb(chats);
  });
}

export function subscribeToMessages(chatId: string, cb: (messages: MessageDoc[]) => void) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => toMessage(d.id, d.data())));
  });
}

export async function sendMessage(chatId: string, senderId: string, otherUid: string, content: string) {
  await addDoc(collection(db, "chats", chatId, "messages"), {
    chatId,
    senderId,
    content,
    createdAt: serverTimestamp(),
    seenBy: [senderId],
  });
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
    lastSenderId: senderId,
    [`unreadCount.${otherUid}`]: increment(1),
    [`typing.${senderId}`]: false,
  });
}

export async function markChatRead(chatId: string, uid: string) {
  await updateDoc(doc(db, "chats", chatId), { [`unreadCount.${uid}`]: 0 });
}

export async function setTyping(chatId: string, uid: string, typing: boolean) {
  await updateDoc(doc(db, "chats", chatId), { [`typing.${uid}`]: typing });
}

export async function markMessageSeen(chatId: string, messageId: string, uid: string) {
  await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
    seenBy: arrayUnion(uid),
  });
}
