# 🏁 OWASP-Gate: JIS University CTF 2026

Welcome to the official **OWASP JIS University Student Chapter** CTF platform. This is a secure, gamified web experience designed to teach foundational cybersecurity concepts via the OWASP Top 10.

---

## 🛠️ Deployment Instructions (For Sagnik)

Hey Sagnik! Here is everything you need to get this platform live for the event.

### 1. Database Setup (Supabase)
This project uses **Supabase (PostgreSQL)** for the live leaderboard and user management.
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the file `supabase_schema.sql` from this repository.
4. Copy the entire content and **Run** it in the SQL Editor. 
   - *This creates the `participants` table and enables Realtime updates.*

### 2. Environment Variables
You **must** set these variables in your hosting provider (Vercel/Netlify/etc.) or in a local `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 3. Local Installation
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 🎮 Game Flow
1. **Splash**: Matrix animation initializing systems.
2. **Authentication**: Separate Login and Registration pages (Solo/Group modes supported).
3. **Admin Dashboard**: Accessible via a hidden link (🔐) in the bottom-right corner of the login page.
   - **Admin Passkey:** `OWASP-ADMIN-JIS-2026`
   - Features: Live leaderboard, stage completion tracking (dots), and participant management.

---

## 🏴 Challenge Overview (Admin Spoilers)
| Stage | Vulnerability | Method |
|---|---|---|
| **1** | A01: Broken Access Control | Inspect DOM for hidden `#admin-portal`. |
| **2** | A03: Injection | Call `triggerPayloadBreach("OWASP_JIS_2026")` in Console. |
| **3** | A05: Misconfiguration | Find fragments in HTML comments, CSS variables, and Console periodic logs. |
| **4** | A02: Crypto Failure | Base64 decode the intercepted signal using `atob()`. |

---

## 🛡️ Key Features
- **Real-time Leaderboard**: Participant scores update instantly across all screens.
- **AI-Resistant**: Hints and challenge structure requires manual investigative thought.
- **Premium UI**: Cyberpunk/Terminal aesthetic with glassmorphism and scanline effects.

---

Built with ❤️ for **OWASP JIS University**.
