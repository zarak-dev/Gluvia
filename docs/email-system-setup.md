# Gluvia Production Email System Setup Guide
**Supabase Auth + Resend + Supabase Edge Functions + Supabase Cron**

---

## 1. Core Architecture & Policy

> [!IMPORTANT]
> **EMAIL VERIFICATION IS DISABLED BY DESIGN.**
> In Gluvia, new patients sign up with an Email & Password and **immediately access the dashboard**. There is **no** verification email, **no** verification gate, and **no** "check your inbox" screen.
>
> Resend is used strictly for only two systems:
> 1. **Password Reset** (delivered via Supabase Auth Email Hook)
> 2. **Weekly Health Report** (delivered via Supabase Cron & Edge Function)

---

## 2. Resend Account & Domain Verification

1. **Create an Account**: Go to [resend.com](https://resend.com) and create an account.
2. **Add Your Sending Domain**:
   - In Resend, navigate to **Domains** -> **Add Domain**.
   - Enter your production domain (e.g. `gluvia.app` or `mail.gluvia.app`).
   - Add the generated DNS records (DKIM, SPF, and DMARC) in your domain provider (e.g., Cloudflare, Namecheap, Vercel).
   - Verify domain status shows **Verified**.
3. **Generate an API Key**:
   - Go to **API Keys** -> **Create API Key**.
   - Permission: Full Access or Sending Access.
   - Name: `gluvia-production-resend`.
   - Copy the key (format: `re_xxxxxxxxxxxxxxxxxxxx`).

---

## 3. Supabase Auth Configuration (Disable Email Confirmation)

To ensure users can sign up and immediately use Gluvia:
1. Open your **Supabase Dashboard** -> Project -> **Authentication** -> **Providers** -> **Email**.
2. **Turn OFF** **"Confirm email"** (Toggle to disabled).
3. Under **URL Configuration**:
   - **Site URL**: `https://your-production-domain.com` (or `http://localhost:3000` in dev).
   - **Redirect URLs**: Add:
     - `https://your-production-domain.com/auth/callback`
     - `https://your-production-domain.com/update-password`
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/update-password`
4. Click **Save**.

---

## 4. Deploying Supabase Edge Functions & Secrets

The repository includes two Edge Functions under `supabase/functions/`:
- `auth-email-hook`: Handles Password Reset emails via Resend.
- `weekly-health-report`: Generates and delivers 7-day clinical summaries.

### 4.1 Set Secrets in Supabase
Run using the Supabase CLI (or configure under **Project Settings** -> **Edge Functions** -> **Secrets**):

```bash
supabase secrets set RESEND_API_KEY="re_xxxxxxxxxxxx"
supabase secrets set RESEND_FROM_EMAIL="Gluvia <no-reply@your-verified-domain.com>"
supabase secrets set RESEND_FROM_NAME="Gluvia"
supabase secrets set APP_URL="https://your-production-domain.com"
supabase secrets set SEND_EMAIL_HOOK_SECRET="generate-a-secure-random-token"
supabase secrets set CRON_SECRET="generate-another-secure-random-token"
```

*(Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase to Edge Functions).*

### 4.2 Deploy the Functions
```bash
supabase functions deploy auth-email-hook
supabase functions deploy weekly-health-report
```

---

## 5. Configuring Supabase Auth Custom Email Hook

To route password-reset emails through Resend:
1. In Supabase Dashboard, navigate to **Authentication** -> **Hooks** (or **Email Templates** -> **Custom Email Provider**).
2. Enable the **Send Email Hook** (URI: `https://<PROJECT_REF>.supabase.co/functions/v1/auth-email-hook`).
3. If using an authorization secret, set the `SEND_EMAIL_HOOK_SECRET` token in the Hook headers:
   `Bearer <YOUR_SEND_EMAIL_HOOK_SECRET>`.
4. Save the hook configuration.

---

## 6. Applying Database Migrations

Run the SQL migration located at `supabase/migrations/20260922_email_system.sql` in the **Supabase SQL Editor**:
- Adds `weekly_report_enabled` (default `true`) and `last_weekly_report_sent_at` to `public.profiles`.
- Creates `public.weekly_report_logs` with unique constraint `(user_id, period_start, period_end)` for bulletproof idempotency.
- Configures Row Level Security.

---

## 7. Scheduling Weekly Health Reports via Supabase Cron

Enable `pg_cron` and `pg_net` extensions in your Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule job to execute every Monday at 08:00 UTC
SELECT cron.schedule(
  'weekly-health-report-job',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/weekly-health-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

To view scheduled jobs:
```sql
SELECT * FROM cron.job;
```

To view cron execution history:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 8. Testing & Verification

### 8.1 Test Password Reset Flow
1. Navigate to `/forgot-password`.
2. Enter your account email and click **Send reset link**.
3. Verify receipt of the branded Gluvia email from your configured Resend sender.
4. Click **Reset Password** in the email -> redirects to `/update-password`.
5. Enter a new password (min 8 chars) -> verify success and sign in with the new password.

### 8.2 Test Weekly Health Report Manually
Trigger the Edge Function directly via cURL:

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/weekly-health-report" \
  -H "Authorization: Bearer <CRON_SECRET>" \
  -H "Content-Type: application/json"
```

Verify:
- Response returns `{ "success": true, "sent": X, "skipped": Y, "failed": Z }`.
- Delivery log is recorded in `public.weekly_report_logs` with Resend provider message ID.
- Running the cURL command a second time confirms `skipped: X` and zero duplicate emails sent.

### 8.3 User Notification Preferences
Users can manage their weekly report subscription at any time:
1. Navigate to `/profile`.
2. Locate the **Weekly Health Report** card.
3. Toggle the switch to pause or resume weekly email summaries.

---

## 9. Resend Quota & Limit Awareness

- Resend Free Tier includes **3,000 emails/month** (100 emails/day).
- Both **Password Reset** and **Weekly Reports** share this pool.
- The `weekly-health-report` Edge Function logs each send, handles rate limits gracefully, and prevents duplicate sends per period.
- For high patient volume, upgrade your Resend subscription accordingly at [resend.com/pricing](https://resend.com/pricing).
