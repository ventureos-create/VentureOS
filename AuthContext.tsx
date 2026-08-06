"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset as fbConfirmPasswordReset,
  signOut as fbSignOut,
  updateProfile,
  updatePassword,
  reload,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, ADMIN_EMAIL } from "@/lib/firebase/config";
import { UserDoc } from "@/types";

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const newUser: Omit<UserDoc, "createdAt" | "updatedAt"> & {
      createdAt: unknown;
      updatedAt: unknown;
    } = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? user.email?.split("@")[0] ?? "Founder",
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      onboardingComplete: false,
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, newUser);
  } else if (snap.data().emailVerified !== user.emailVerified) {
    await setDoc(ref, { emailVerified: user.emailVerified }, { merge: true });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await ensureUserDoc(fbUser);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Live-subscribe to the user's Firestore doc so onboarding/profile edits reflect instantly.
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserDoc(snap.data() as UserDoc);
    });
    return unsub;
  }, [user]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await ensureUserDoc(cred.user);
    await sendEmailVerification(cred.user);
  };

  const logIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await ensureUserDoc(cred.user);
  };

  const logOut = async () => {
    await fbSignOut(auth);
  };

  const resendVerification = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setUser(auth.currentUser);
      await ensureUserDoc(auth.currentUser);
    }
  };

  const requestPasswordReset = async (email: string) => {
    // Point the reset link at our own /reset-password page instead of Firebase's default hosted page.
    const actionCodeSettings =
      typeof window !== "undefined"
        ? { url: `${window.location.origin}/reset-password` }
        : undefined;
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const confirmPasswordReset = async (code: string, newPassword: string) => {
    await fbConfirmPasswordReset(auth, code, newPassword);
  };

  const changePassword = async (newPassword: string) => {
    if (auth.currentUser) await updatePassword(auth.currentUser, newPassword);
  };

  const isAdmin = !!user?.email && user.email === ADMIN_EMAIL && !!user.emailVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,
        isAdmin,
        signUp,
        logIn,
        logInWithGoogle,
        logOut,
        resendVerification,
        refreshUser,
        requestPasswordReset,
        confirmPasswordReset,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
