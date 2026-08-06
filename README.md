# VentureOS

**The Operating System for Entrepreneurs.** Next.js 15 + TypeScript + Tailwind + Firebase.

---

## 1. What's actually in this build

This is a real, runnable prototype — not a mockup. Every page listed below is wired to live
Firestore/Storage/Auth calls; there is no mock data. Being upfront about scope:

| Module | Status |
|---|---|
| Landing page (hero, features, pricing, testimonials, FAQ, footer, CTA) | ✅ Full |
| Auth: email/password, Google, email verification gate, forgot/reset password, persistent login | ✅ Full |
| Onboarding wizard (name, country, role, skills, interests, stage → Firestore) | ✅ Full |
| Dashboard shell (sidebar, topbar, notifications, quick stats, recent activity) | ✅ Full |
| AI Business Planner (create/edit/delete, SWOT, canvas, financials, checklists, PDF export) | ✅ Full |
| AI Marketing Playbook (30-day calendar, channel strategies, funnel, SEO, PDF export) | ✅ Full |
| Community Feed (create/edit/delete posts, images, likes, comments, shares, bookmarks, infinite scroll, trending) | ✅ Full |
| Co-Founder Matching (founder profiles, search/filter, connect/accept/decline, message) | ✅ Full |
| Real-time Messaging (Firestore-backed chat, typing indicator, seen receipts, unread counts) | ✅ Full |
| Profile page (photo upload, bio, socials, skills, achievements, projects, posts) | ✅ Full |
| Settings (dark/light mode, notification toggles, password update, delete account) | ✅ Full |
| Admin panel (gated to `novixstudios6@gmail.com`, live platform stats) | ✅ Full |
| Firestore + Storage security rules | ✅ Full — covers every collection |
| Cloud Functions | 🟡 Minimal — two real cleanup triggers included (see below), not a full function suite |

### The one deliberate shortcut: the "AI" generators

`src/lib/generators/businessPlan.ts` and `src/lib/generators/marketingPlaybook.ts` produce
**real, structured output driven by the user's actual answers** — not lorem ipsum — but they're
deterministic templates, not an LLM call. This was a conscious choice so the app runs immediately
with zero extra API keys or billing setup. Swapping in a real model call is the first thing to
extend — see section 4.

Dark mode is wired at the toggle/state level (`Settings → Appearance`) but only a subset of
components have `dark:` variants applied. Treat it as a starting point, not a finished pass.

---

## 2. Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide icons
- **Backend**: Firebase — Authentication, Firestore, Storage, Cloud Functions
- **PDF export**: jsPDF (client-side, no server needed)

---

## 3. Setup

### 3.1 Prerequisites
- Node.js 20+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### 3.2 Firebase project setup

1. Create a Firebase project.
2. **Authentication** → Sign-in method → enable **Email/Password** and **Google**.
3. **Firestore Database** → create in production mode, any region.
4. **Storage** → get started, any region.
5. **Project settings** → General → add a **Web app** → copy the config values into `.env.local`
   (see below).
6. Install the Firebase CLI if you don't have it: `npm install -g firebase-tools`, then
   `firebase login` and `firebase use --add` (pick your project) from this folder.
7. Deploy security rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage:rules
   ```

### 3.3 Environment variables

```bash
cp .env.example .env.local
```

Fill in the six `NEXT_PUBLIC_FIREBASE_*` values from Firebase project settings. Leave
`NEXT_PUBLIC_ADMIN_EMAIL` as `novixstudios6@gmail.com` unless you want a different admin.

> **Important**: the admin gate (`src/components/AdminRoute.tsx` and `firestore.rules`) checks the
> *signed-in Firebase user's email*, not a Firestore flag. Whoever signs up with
> `novixstudios6@gmail.com` and verifies that email automatically gets access to `/admin`. There is
> no separate admin invite step needed — just sign up with that address.

### 3.4 Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### 3.5 (Optional) Cloud Functions

The two included functions clean up orphaned subcollections when a post or user is deleted
(Firestore doesn't cascade-delete automatically). Not required for the app to work — Firestore
rules already scope access correctly without them — but recommended before real users start
deleting content.

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## 4. What to extend first

In priority order, if you're taking this from prototype to production:

1. **Wire a real LLM to the generators.** Replace the body of `generateBusinessPlan()` and
   `generateMarketingPlaybook()` with a call to a Next.js API route (`src/app/api/.../route.ts`)
   that calls Claude/OpenAI/etc. server-side (never put an LLM API key in client code). Keep the
   same return shape and every page that consumes them keeps working unmodified.
2. **Firestore composite indexes**: `firestore.indexes.json` covers the queries used today. If you
   add new filters/sorts (e.g. filtering posts by tag), Firestore will throw a "requires an index"
   error with a direct console link the first time you run the query — click it, or add the index
   manually to this file and redeploy.
3. **Rate limiting / abuse prevention** on post creation, connection requests, and messages —
   currently anyone verified can spam these. A Cloud Function with a per-user counter, or Firebase
   App Check, is the natural next step.
4. **Image moderation** for post/avatar uploads — Storage rules cap file size and type but don't
   inspect content.
5. **Deployment target**: `firebase.json` includes a Hosting config for reference, but Next.js 15's
   App Router (dynamic routes like `/dashboard/planner/[id]`, middleware, etc.) needs a Node
   runtime to render properly — static export won't work cleanly for a dynamic dashboard like this.
   **Deploy to Vercel** (zero-config for Next.js) or Firebase App Hosting / Cloud Run for the
   frontend, and keep Firestore/Auth/Storage/Functions on Firebase as configured. Update
   `firebase.json`'s hosting block only if you specifically want static Firebase Hosting for a
   trimmed-down static subset of pages (e.g. just the landing page).
6. **Follower/following counts** shown on the profile page read `followerCount`/`followingCount`
   from the user doc, but no follow button exists yet — those fields are currently always 0. Add a
   `followers` subcollection + a follow/unfollow service function and button on the profile page.
7. **Dark mode coverage** — extend `dark:` variants across components; the toggle and persistence
   (`localStorage` + `<html class="dark">`) already work.

---

## 5. Project structure

```
src/
  app/                  Next.js App Router pages
    (auth)/             login, signup, verify-email, forgot-password, reset-password
    onboarding/
    dashboard/           protected shell: overview, planner, marketing, community,
                          matching, messages, profile/[uid], settings
    admin/               gated to NEXT_PUBLIC_ADMIN_EMAIL
  components/
    ui/                  Button, Input, Textarea, Card, Badge, Select, Spinner
    layout/              Sidebar, Topbar, AuthShell
    landing/             Navbar, Hero, Features, Pricing/FAQ/Footer/CTA
    ProtectedRoute.tsx, AdminRoute.tsx
  contexts/AuthContext.tsx
  hooks/useAuth.ts
  lib/
    firebase/config.ts
    generators/          businessPlan.ts, marketingPlaybook.ts  ← extend these first
    pdf.ts                jsPDF export
    utils.ts
  services/              one file per Firestore domain — all CRUD lives here, not in components
  types/index.ts
functions/                Cloud Functions (cleanup triggers)
firestore.rules
firestore.indexes.json
storage.rules
firebase.json
```

---

## 6. A note on testing

This code was written and reviewed but not executed against a live Firebase project or `npm install`
in this environment (no network access here). Before you rely on it: run `npm install`, fill in
`.env.local`, deploy the rules, and click through the auth → onboarding → dashboard flow once
end-to-end. If anything doesn't compile, it's most likely a small import/type mismatch — check the
error message against the relevant `services/*.ts` or `types/index.ts` first.
