"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, MapPin, Briefcase, Clock, UserPlus, Check, X as XIcon, MessageSquare, Settings2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { initials, cn } from "@/lib/utils";
import { ProfileDoc, ConnectionDoc, UserRole } from "@/types";
import {
  listProfiles, getProfile, upsertProfile, sendConnectionRequest,
  respondToConnection, listConnectionsForUser,
} from "@/services/matching.service";
import { getOrCreateChat } from "@/services/messages.service";

const roles: UserRole[] = ["Founder", "Developer", "Designer", "Investor"];
const availabilities = ["Full-time", "Part-time", "Weekends", "Not available"] as const;

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <MatchingPageInner />
    </Suspense>
  );
}

function MatchingPageInner() {
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<ProfileDoc[]>([]);
  const [myProfile, setMyProfile] = useState<ProfileDoc | null>(null);
  const [connections, setConnections] = useState<ConnectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [tab, setTab] = useState<"discover" | "requests">("discover");

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [roleFilter, setRoleFilter] = useState("");
  const [availFilter, setAvailFilter] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [all, mine, conns] = await Promise.all([
      listProfiles(user.uid),
      getProfile(user.uid),
      listConnectionsForUser(user.uid),
    ]);
    setProfiles(all);
    setMyProfile(mine);
    setConnections(conns);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const connectionWith = (uid: string) =>
    connections.find((c) => c.fromId === uid || c.toId === uid);

  const handleConnect = async (target: ProfileDoc) => {
    if (!user || !userDoc) return;
    await sendConnectionRequest({
      fromId: user.uid,
      fromName: userDoc.displayName,
      toId: target.uid,
      toName: target.displayName,
      message: `${userDoc.displayName} would like to connect with you on VentureOS.`,
    });
    load();
  };

  const handleMessage = async (target: ProfileDoc) => {
    if (!user || !userDoc) return;
    const chatId = await getOrCreateChat(
      user.uid, userDoc.displayName, userDoc.photoURL,
      target.uid, target.displayName, target.photoURL
    );
    router.push(`/dashboard/messages?chat=${chatId}`);
  };

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      !search ||
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      p.industry.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || p.role === roleFilter;
    const matchesAvail = !availFilter || p.availability === availFilter;
    return matchesSearch && matchesRole && matchesAvail;
  });

  const incomingRequests = connections.filter((c) => c.toId === user?.uid && c.status === "pending");
  const sentRequests = connections.filter((c) => c.fromId === user?.uid);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("discover")}
            className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium", tab === "discover" ? "bg-royal text-white" : "bg-white text-navy-400 border border-navy-100")}
          >
            Discover
          </button>
          <button
            onClick={() => setTab("requests")}
            className={cn("relative rounded-full px-3.5 py-1.5 text-sm font-medium", tab === "requests" ? "bg-royal text-white" : "bg-white text-navy-400 border border-navy-100")}
          >
            Requests
            {incomingRequests.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowEditor((s) => !s)}>
          <Settings2 className="h-4 w-4" /> {myProfile ? "Edit my founder profile" : "Create founder profile"}
        </Button>
      </div>

      {showEditor && (
        <ProfileEditor
          initial={myProfile}
          onSaved={async () => { setShowEditor(false); await load(); }}
        />
      )}

      {tab === "discover" ? (
        <>
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                <Input className="pl-9" placeholder="Search by name, skill, or industry" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-44">
                <option value="">All roles</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
              <Select value={availFilter} onChange={(e) => setAvailFilter(e.target.value)} className="sm:w-44">
                <option value="">Any availability</option>
                {availabilities.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-sm text-navy-400">No founders match your filters yet.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const conn = connectionWith(p.uid);
                return (
                  <Card key={p.uid}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-royal-50 font-semibold text-royal-700">
                          {p.photoURL ? <Image src={p.photoURL} alt="" width={48} height={48} className="h-full w-full object-cover" /> : initials(p.displayName)}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{p.displayName}</p>
                          <p className="text-xs text-navy-300">{p.role}</p>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-navy-400">{p.bio || "No bio yet."}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.skills.slice(0, 4).map((s) => <Badge key={s}>{s}</Badge>)}
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-navy-300">
                        {p.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.location}</p>}
                        {p.industry && <p className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {p.industry}</p>}
                        {p.availability && <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {p.availability}</p>}
                      </div>
                      <div className="mt-4 flex gap-2">
                        {conn ? (
                          conn.status === "accepted" ? (
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleMessage(p)}>
                              <MessageSquare className="h-3.5 w-3.5" /> Message
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="flex-1" disabled>
                              {conn.fromId === user?.uid ? "Request sent" : "Pending your response"}
                            </Button>
                          )
                        ) : (
                          <Button size="sm" className="flex-1" onClick={() => handleConnect(p)}>
                            <UserPlus className="h-3.5 w-3.5" /> Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-navy">Incoming requests</h3>
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-navy-400">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-navy">{c.fromName}</p>
                        <p className="text-xs text-navy-400">{c.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={async () => { await respondToConnection(c.id, "accepted"); load(); }}>
                          <Check className="h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button size="sm" variant="ghost" onClick={async () => { await respondToConnection(c.id, "declined"); load(); }}>
                          <XIcon className="h-3.5 w-3.5" /> Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-3 font-display text-base font-semibold text-navy">Sent requests</h3>
            {sentRequests.length === 0 ? (
              <p className="text-sm text-navy-400">You haven&apos;t sent any requests yet.</p>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <p className="text-sm font-medium text-navy">{c.toName}</p>
                      <Badge variant={c.status === "accepted" ? "default" : c.status === "declined" ? "outline" : "gold"}>
                        {c.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileEditor({ initial, onSaved }: { initial: ProfileDoc | null; onSaved: () => void }) {
  const { user, userDoc } = useAuth();
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [skillsInput, setSkillsInput] = useState(initial?.skills.join(", ") ?? "");
  const [role, setRole] = useState<UserRole | "">(initial?.role ?? (userDoc?.role ?? ""));
  const [experienceYears, setExperienceYears] = useState(initial?.experienceYears ?? 0);
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [availability, setAvailability] = useState<typeof availabilities[number]>(initial?.availability ?? "Full-time");
  const [lookingFor, setLookingFor] = useState(initial?.lookingFor ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !userDoc) return;
    setSaving(true);
    try {
      await upsertProfile(user.uid, {
        displayName: userDoc.displayName,
        photoURL: userDoc.photoURL,
        bio,
        socialLinks: initial?.socialLinks ?? {},
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        role,
        experienceYears: Number(experienceYears),
        industry,
        location,
        availability,
        lookingFor,
        achievements: initial?.achievements ?? [],
        startupProjects: initial?.startupProjects ?? [],
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-navy">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What are you building, and what are you looking for?" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Role</label>
          <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="">Select role</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Years of experience</label>
          <Input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Industry</label>
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, or a city" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Availability</label>
          <Select value={availability} onChange={(e) => setAvailability(e.target.value as typeof availabilities[number])}>
            {availabilities.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Skills (comma separated)</label>
          <Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="Product, Engineering, Growth" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-navy">Looking for</label>
          <Textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="e.g. A technical co-founder with backend experience" />
        </div>
        <div className="md:col-span-2">
          <Button onClick={handleSave} loading={saving}>Save profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
