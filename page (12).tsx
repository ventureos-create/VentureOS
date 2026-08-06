"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, Globe, Linkedin, Twitter, MapPin, Briefcase } from "lucide-react";
import { db, storage } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { UserDoc, ProfileDoc, PostDoc } from "@/types";
import { getProfile, upsertProfile } from "@/services/matching.service";
import { initials, timeAgo } from "@/lib/utils";

export default function ProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { user, userDoc: myUserDoc } = useAuth();
  const [targetUser, setTargetUser] = useState<UserDoc | null>(null);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isOwner = user?.uid === uid;

  const load = async () => {
    setLoading(true);
    const [userSnap, prof, postsSnap] = await Promise.all([
      getDoc(doc(db, "users", uid)),
      getProfile(uid),
      getDocs(query(collection(db, "posts"), where("authorId", "==", uid), orderBy("createdAt", "desc"))),
    ]);
    setTargetUser(userSnap.exists() ? (userSnap.data() as UserDoc) : null);
    setProfile(prof);
    setPosts(
      postsSnap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toMillis?.() ?? Date.now() } as PostDoc;
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `avatars/${user.uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
      await upsertProfile(user.uid, { photoURL: url });
      await load();
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!targetUser) return <p className="py-16 text-center text-sm text-navy-400">User not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-royal-50 text-2xl font-semibold text-royal-700">
                {targetUser.photoURL ? (
                  <Image src={targetUser.photoURL} alt="" width={96} height={96} className="h-full w-full object-cover" />
                ) : (
                  initials(targetUser.displayName)
                )}
              </div>
              {isOwner && (
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-royal text-white shadow-premium">
                  {uploading ? <Spinner className="h-4 w-4 text-white" /> : <Camera className="h-4 w-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-navy">{targetUser.displayName}</h2>
                  <p className="text-sm text-navy-300">{targetUser.role ?? "Founder"} · {targetUser.country}</p>
                </div>
                {isOwner && (
                  <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
                    {editing ? "Cancel" : "Edit profile"}
                  </Button>
                )}
              </div>

              <div className="mt-4 flex gap-6 text-sm">
                <span><strong className="text-navy">{targetUser.followerCount}</strong> <span className="text-navy-300">Followers</span></span>
                <span><strong className="text-navy">{targetUser.followingCount}</strong> <span className="text-navy-300">Following</span></span>
                <span><strong className="text-navy">{posts.length}</strong> <span className="text-navy-300">Posts</span></span>
              </div>
            </div>
          </div>

          {editing ? (
            <ProfileForm
              profile={profile}
              onSaved={async () => { setEditing(false); await load(); }}
            />
          ) : (
            <>
              {profile?.bio && <p className="mt-5 text-sm leading-relaxed text-navy-400">{profile.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-navy-300">
                {profile?.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>}
                {profile?.industry && <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {profile.industry}</span>}
              </div>

              {profile?.socialLinks && (profile.socialLinks.website || profile.socialLinks.twitter || profile.socialLinks.linkedin) && (
                <div className="mt-4 flex gap-3">
                  {profile.socialLinks.website && (
                    <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="text-navy-300 hover:text-royal"><Globe className="h-4 w-4" /></a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-navy-300 hover:text-royal"><Twitter className="h-4 w-4" /></a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-navy-300 hover:text-royal"><Linkedin className="h-4 w-4" /></a>
                  )}
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
              )}

              {targetUser.skills && targetUser.skills.length > 0 && !profile?.skills.length && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {targetUser.skills.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-navy">Posts</h3>
        {posts.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-navy-400">No posts yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <p className="text-sm text-navy-500">{p.content}</p>
                  <p className="mt-2 text-xs text-navy-300">{timeAgo(p.createdAt)} · {p.likeCount} likes · {p.commentCount} comments</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileForm({ profile, onSaved }: { profile: ProfileDoc | null; onSaved: () => void }) {
  const { user, userDoc } = useAuth();
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [website, setWebsite] = useState(profile?.socialLinks.website ?? "");
  const [twitter, setTwitter] = useState(profile?.socialLinks.twitter ?? "");
  const [linkedin, setLinkedin] = useState(profile?.socialLinks.linkedin ?? "");
  const [skillsInput, setSkillsInput] = useState(profile?.skills.join(", ") ?? "");
  const [achievementsInput, setAchievementsInput] = useState(profile?.achievements.join("\n") ?? "");
  const [projectsInput, setProjectsInput] = useState(profile?.startupProjects.join("\n") ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !userDoc) return;
    setSaving(true);
    try {
      await upsertProfile(user.uid, {
        displayName: userDoc.displayName,
        photoURL: userDoc.photoURL,
        bio,
        socialLinks: { website, twitter, linkedin },
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        role: profile?.role ?? (userDoc.role as ProfileDoc["role"]) ?? "",
        experienceYears: profile?.experienceYears ?? 0,
        industry: profile?.industry ?? "",
        location: profile?.location ?? "",
        availability: profile?.availability ?? "Full-time",
        lookingFor: profile?.lookingFor ?? "",
        achievements: achievementsInput.split("\n").map((s) => s.trim()).filter(Boolean),
        startupProjects: projectsInput.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 space-y-4 border-t border-navy-100 pt-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Website</label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Twitter / X</label>
          <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/you" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">LinkedIn</label>
          <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/you" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Skills (comma separated)</label>
        <Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Achievements (one per line)</label>
        <Textarea value={achievementsInput} onChange={(e) => setAchievementsInput(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Startup projects (one per line)</label>
        <Textarea value={projectsInput} onChange={(e) => setProjectsInput(e.target.value)} />
      </div>
      <Button onClick={handleSave} loading={saving}>Save profile</Button>
    </div>
  );
}
