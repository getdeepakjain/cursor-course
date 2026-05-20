# Jain Coaching

NCERT Class 9–12, JEE Main, and JEE Advanced test platform with enrollment approval, focus-mode delivery, proctoring lite, and notifications.

## Catalog

| Track | Scope | Difficulty | Tests per bucket |
|--------|--------|------------|------------------|
| **Class 9–10** | Mathematics, Science | Low / Medium / High | 10 |
| **Class 11–12** | Mathematics, Physics, Chemistry | Low / Medium / High | 10 |
| **JEE Main** | Full mock (75 Q, 180 min) | Low / Medium / High | 10 |
| **JEE Advanced** | Dual paper (54 Q each) | Low / Medium / High | 10 exams × 2 papers |

Class tests use **MCQ single-answer** only. JEE papers follow **official exam patterns** (MCQ, numerical, multi-correct, match).

## Student flow

1. Register → email (+ WhatsApp if consented)
2. Complete profile (class required for NCERT track)
3. **Enroll** for track + subject (class) + difficulty → pending
4. Admin **approves** → student can start matching tests from catalog
5. Take exam in focus mode (proctored)

## Setup

1. Copy `.env.example` → `.env.local` and set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
2. Apply migrations in order:
   - `supabase/migrations/20260519180000_jain_coaching_schema.sql`
   - `supabase/migrations/20260520120000_enrollments_difficulty.sql`
3. Install and seed:

```bash
cd jain-coaching
yarn install
yarn db:seed          # skip if catalog exists
yarn db:seed:force    # wipe catalog & re-seed
yarn dev
```

App runs at http://127.0.0.1:3333

4. Promote an admin user (SQL):

```sql
update users set role = 'admin' where email = 'you@example.com';
```

## Notifications

Configure SMTP and/or Twilio in `.env.local`. Without credentials, messages are **logged** to `notification_logs` and printed to the server console.

Events: registration, enrollment submitted, enrollment approved/rejected.

## Google OAuth

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add redirect URI:

`http://127.0.0.1:3333/api/auth/callback/google`
