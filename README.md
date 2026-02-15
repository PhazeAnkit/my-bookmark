# my-bookmark
A bookmark web-app to manage bookmarks with supabase to handle backend storage, authentication and realtime updates.

---

# Features

## Authentication

- Google OAuth login
- Secure session handling
- Single-click sign-in experience
- Managed via Supabase Auth

## Bookmark Management

- Add bookmarks
- Edit bookmarks
- Delete bookmarks
- Tag bookmarks
- Notes support
- URL preview metadata

## Realtime Updates

- Bookmark changes sync instantly
- Multi-device consistency
- Live UI refresh without reload

---

# Product Design Goals

- Fast task completion
- Minimal cognitive load
- Calm visual design
- High scanability
- Strong accessibility support
- Keyboard-friendly interactions
- Consistent visual system

---

# Supabase Backend

## Authentication (Supabase Auth)

Supabase handles user identity and login.

**Auth features used:**

- Google OAuth provider
- Secure JWT sessions
- User profile identity
- Session persistence
- Token refresh handling

**Auth Flow:**

1. User clicks “Continue with Google”
2. OAuth handled by Supabase
3. Session returned to app
4. User record ensured in database
5. UI loads user workspace

---

## Database (Supabase Postgres)

Bookmarks and related data are stored in Supabase Postgres.

### Core Tables

### users (managed by Supabase Auth)

Stores authenticated users.

- id (uuid)
- email
- created_at

---

### bookmarks

- id (uuid)
- user_id (uuid, foreign key)
- url (text)
- title (text)
- domain (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)

---

## Row Level Security (RLS)

All tables enforce row-level security.

**Rules:**

- Users can only read their own bookmarks
- Users can only modify their own data
- Tag access restricted per user
- Join tables protected by ownership checks

---

## Realtime Updates (Supabase Realtime)

Realtime subscriptions keep the UI synchronized automatically.

**Used for:**

- Bookmark create/update/delete
- Multi-device sync

**Behavior:**

- User adds bookmark → appears instantly
- User edits bookmark → updates live
- User deletes bookmark → removed live

No manual refresh required.

---

# Data Flow Summary

```
User Action
↓
UI Component
↓
Supabase Auth / DB
↓
Row Level Security Check
↓
Database Write
↓
Realtime Event
↓
Live UI Update
```

---

# Challenges & Resolution

## Problem 1 — OAuth Redirect Mismatch Errors

**Symptom:**  
After Google login, authentication failed with redirect or callback errors.

**Cause:**  
The authorized redirect URLs configured in Google Cloud Console did not exactly match the Supabase callback URL and local development URL.

OAuth providers require exact matches — even small differences break the flow.

**Fix:**

Aligned all redirect URLs across:

- Supabase Auth provider settings
- Google Cloud OAuth client settings
- Local dev URL
- Production URL

Verified:

- protocol (http vs https)
- trailing slashes
- port numbers
- exact path match

---

## Problem 2 — Domain Not Authorized

**Symptom:**  
Google displayed:  
“App is not authorized” or domain-related error.

**Cause:**  
App domain was not added to:

- Authorized domains
- OAuth consent screen configuration

**Fix:**

Added domains to Google Cloud Console:

- Authorized domains
- Test users (during development)
- OAuth consent screen setup completed

---

## Problem 3 — Session Not Persisting After Login

**Symptom:**  
Login succeeded but user appeared logged out after redirect.

**Cause:**  
Session handling was not initialized early enough in the app lifecycle.

**Fix:**

Ensured:

- Auth session check runs on app startup
- Auth state listener updates UI
- Session persistence enabled in Supabase client config

---

## Problem 4 — Realtime + Auth Timing Race

**Symptom:**  
Realtime subscriptions failed on first load after login.

**Cause:**  
Realtime listeners were attaching before auth session was ready.

**Fix:**

Adjusted UI flow:

Auth ready → then attach realtime subscriptions

This removed unauthorized subscription attempts.

---


# Running the Project on a Local Machine

This section explains how to run the Bookmark Manager locally for development and testing.  
Steps are kept framework-agnostic — adapt commands to your chosen frontend stack.

The backend services (Auth, Database, Realtime) are powered by **Supabase**.

---

# Prerequisites

Make sure you have:

- A Supabase account
- A Google Cloud account (for OAuth)

---

# 1. Clone the Repository

```bash
git clone https://github.com/PhazeAnkit/my-bookmark.git
cd bookmark-manager
```

---

# 2. Install Dependencies

Use your package manager:

```bash
npm install
```

or

```bash
yarn install
```

or

```bash
pnpm install
```

---

# 3. Create Supabase Project

1. Go to Supabase dashboard
2. Create a new project
3. Wait for database provisioning
4. Copy:
   - Project URL
   - Anon public key

You will use these in your local environment config.

---

# 4. Set Up Database Schema

Create the required tables in Supabase:

- bookmarks

Enable:

- Row Level Security (RLS)
- User ownership policies

Use the schema SQL from the `/docs/schema.sql` file if included in this repo.

---

# 5. Configure Supabase Auth

In Supabase dashboard:

Auth → Providers → Google → Enable

Add:

- Google Client ID
- Google Client Secret

(You will obtain these in the next step.)

---

# 6. Configure Google OAuth

Go to Google Cloud Console.

Create OAuth credentials:

1. Create project (or reuse)
2. Configure OAuth Consent Screen
3. Create OAuth Client ID (Web)

Add **Authorized Redirect URLs:**

```
http://localhost:3000/auth/callback
https://<your-supabase-project>.supabase.co/auth/v1/callback
```

 Exact match required — including protocol and path.

Add **Authorized Origins:**

```
http://localhost:3000
```

Copy:

- Client ID
- Client Secret

Paste them into:

Supabase → Auth → Providers → Google

---

# 7. Create Local Environment File

Create a `.env.local` file in the project root.

Example:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

If your stack uses different variable prefixes, adjust accordingly.

 Never commit this file.

---

#  8. Run Development Server

Start the local dev server:

```bash
npm run dev
```

Or your framework’s dev command.

Typical local URL:

```
http://localhost:3000
```

---

# 9. Verify Local Setup

Test the following:

## Login

- Click “Continue with Google”
- Complete OAuth
- Redirect back to local app

## Database

- Add bookmark
- Confirm row appears in Supabase table

## Realtime

- Add / edit / delete bookmark
- Confirm UI updates instantly

---