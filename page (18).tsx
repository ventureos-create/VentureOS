"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Send, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { cn, timeAgo, initials } from "@/lib/utils";
import { ChatDoc, MessageDoc } from "@/types";
import {
  subscribeToChats, subscribeToMessages, sendMessage, markChatRead, setTyping, markMessageSeen,
} from "@/services/messages.service";

function MessagesInner() {
  const { user } = useAuth();
  const params = useSearchParams();
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(params.get("chat"));
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [text, setText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToChats(user.uid, (c) => {
      setChats(c);
      setLoadingChats(false);
      if (!activeChatId && c.length > 0) setActiveChatId(c[0].id);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!activeChatId || !user) return;
    const unsub = subscribeToMessages(activeChatId, (msgs) => {
      setMessages(msgs);
      // Mark unseen messages from the other person as seen.
      msgs.forEach((m) => {
        if (m.senderId !== user.uid && !m.seenBy.includes(user.uid)) {
          markMessageSeen(activeChatId, m.id, user.uid);
        }
      });
    });
    markChatRead(activeChatId, user.uid);
    return unsub;
  }, [activeChatId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const otherUid = activeChat?.participants.find((p) => p !== user?.uid) ?? "";

  const handleSend = async () => {
    if (!user || !activeChatId || !text.trim() || !otherUid) return;
    await sendMessage(activeChatId, user.uid, otherUid, text.trim());
    setText("");
    await setTyping(activeChatId, user.uid, false);
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (!user || !activeChatId) return;
    setTyping(activeChatId, user.uid, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(activeChatId, user.uid, false), 2000);
  };

  if (loadingChats) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-premium">
      <div className="w-full max-w-xs shrink-0 overflow-y-auto border-r border-navy-100">
        {chats.length === 0 ? (
          <p className="p-6 text-center text-sm text-navy-400">
            No conversations yet. Connect with a founder from Co-Founder Matching to start chatting.
          </p>
        ) : (
          chats.map((chat) => {
            const otherId = chat.participants.find((p) => p !== user?.uid) ?? "";
            const name = chat.participantNames?.[otherId] ?? "Founder";
            const photo = chat.participantPhotos?.[otherId] ?? null;
            const unread = chat.unreadCount?.[user?.uid ?? ""] ?? 0;
            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-navy-50 px-4 py-3 text-left hover:bg-navy-50",
                  activeChatId === chat.id && "bg-royal-50"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-royal-50 text-xs font-semibold text-royal-700">
                  {photo ? <Image src={photo} alt="" width={40} height={40} className="h-full w-full object-cover" /> : initials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-navy">{name}</p>
                    {chat.lastMessageAt > 0 && <span className="shrink-0 text-xs text-navy-300">{timeAgo(chat.lastMessageAt)}</span>}
                  </div>
                  <p className="truncate text-xs text-navy-400">{chat.lastMessage || "Say hello 👋"}</p>
                </div>
                {unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-royal text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-1 flex-col">
        {!activeChat ? (
          <div className="flex flex-1 items-center justify-center text-sm text-navy-300">
            Select a conversation to start messaging.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-navy-100 px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-royal-50 text-xs font-semibold text-royal-700">
                {activeChat.participantPhotos?.[otherUid] ? (
                  <Image src={activeChat.participantPhotos[otherUid] as string} alt="" width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  initials(activeChat.participantNames?.[otherUid] ?? "F")
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">{activeChat.participantNames?.[otherUid]}</p>
                {activeChat.typing?.[otherUid] && <p className="text-xs text-royal">typing...</p>}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m) => {
                const mine = m.senderId === user?.uid;
                const seen = m.seenBy.includes(otherUid);
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-xs rounded-2xl px-4 py-2.5 text-sm", mine ? "bg-royal text-white" : "bg-navy-50 text-navy-500")}>
                      {m.content}
                      <div className={cn("mt-1 flex items-center gap-1 text-[10px]", mine ? "justify-end text-white/60" : "text-navy-300")}>
                        {timeAgo(m.createdAt)}
                        {mine && (seen ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-navy-100 p-4">
              <input
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-navy-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-royal-400"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner /></div>}>
      <MessagesInner />
    </Suspense>
  );
}
