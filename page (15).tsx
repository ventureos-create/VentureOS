"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { Moon, Sun, Bell, Shield, Trash2 } from "lucide-react";
import { db, auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-royal" : "bg-navy-100")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, changePassword, logOut } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyConnections, setNotifyConnections] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ventureos-theme");
    const isDark = stored === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleThemeToggle = (dark: boolean) => {
    setDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ventureos-theme", dark ? "dark" : "light");
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      setPwMessage("Password must be at least 6 characters.");
      return;
    }
    setPwSaving(true);
    setPwMessage("");
    try {
      await changePassword(newPassword);
      setPwMessage("Password updated successfully.");
      setNewPassword("");
    } catch {
      setPwMessage("Couldn't update your password. Try logging out and back in, then retry.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid));
      if (auth.currentUser) await deleteUser(auth.currentUser);
      router.push("/");
    } catch {
      alert("For security, please log out and log back in, then try deleting your account again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="p-6 pb-0"><CardTitle>Appearance</CardTitle></div>
        <CardContent className="p-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-navy-400" /> : <Sun className="h-5 w-5 text-navy-400" />}
              <div>
                <p className="text-sm font-medium text-navy">Dark mode</p>
                <p className="text-xs text-navy-300">Switch between light and dark appearance.</p>
              </div>
            </div>
            <Toggle checked={darkMode} onChange={handleThemeToggle} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="p-6 pb-0"><CardTitle><Bell className="mr-1.5 inline h-4 w-4" /> Notifications</CardTitle></div>
        <CardContent className="space-y-4 p-6 pt-4">
          {[
            { label: "Likes on your posts", state: notifyLikes, set: setNotifyLikes },
            { label: "Comments on your posts", state: notifyComments, set: setNotifyComments },
            { label: "Connection requests", state: notifyConnections, set: setNotifyConnections },
            { label: "New messages", state: notifyMessages, set: setNotifyMessages },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <p className="text-sm text-navy-400">{row.label}</p>
              <Toggle checked={row.state} onChange={row.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <div className="p-6 pb-0"><CardTitle><Shield className="mr-1.5 inline h-4 w-4" /> Security</CardTitle></div>
        <CardContent className="space-y-3 p-6 pt-4">
          <label className="block text-sm font-medium text-navy">Update password</label>
          <div className="flex gap-2">
            <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button onClick={handlePasswordUpdate} loading={pwSaving}>Update</Button>
          </div>
          {pwMessage && <p className="text-sm text-navy-400">{pwMessage}</p>}
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <div className="p-6 pb-0"><CardTitle className="text-red-600"><Trash2 className="mr-1.5 inline h-4 w-4" /> Delete account</CardTitle></div>
        <CardContent className="space-y-3 p-6 pt-4">
          <p className="text-sm text-navy-400">
            This permanently deletes your account. Your posts and other data may remain associated with your user ID. This cannot be undone.
          </p>
          <p className="text-sm text-navy-400">Type <span className="font-mono font-semibold">DELETE</span> to confirm.</p>
          <div className="flex gap-2">
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
            <Button variant="destructive" disabled={deleteConfirm !== "DELETE"} loading={deleting} onClick={handleDeleteAccount}>
              Delete my account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
