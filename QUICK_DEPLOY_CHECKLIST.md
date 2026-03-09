# Quick Deploy Checklist ✅

## Your Supabase Database is Already Set Up!

Your database at `frlmnzyxeyshqnfnrdyh.supabase.co` has all tables configured:
- ✅ users
- ✅ user_sessions
- ✅ exams
- ✅ lessons
- ✅ progress
- ✅ exam_history
- ✅ payment_transactions
- ✅ admin_config

## To Deploy to Vercel - Follow These 3 Steps:

### Step 1: Get Your Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project `frlmnzyxeyshqnfnrdyh`
3. Settings → API
4. Find "service_role" key and click "Reveal"
5. Copy it (starts with `eyJhbGc...`)

### Step 2: Add Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these 3 variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://frlmnzyxeyshqnfnrdyh.supabase.co` | ✓ All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybG1uenl4ZXlzaHFuZm5yZHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTA3ODUsImV4cCI6MjA4ODYyNjc4NX0.C6kVS6mmmab9sao8n-J1s9yM0ACvWMZ5VaLfPI3v3bQ` | ✓ All |
| `SUPABASE_SERVICE_ROLE_KEY` | `<paste the key from Step 1>` | ✓ All |

Make sure to check all 3 environments: Production, Preview, Development

### Step 3: Redeploy

1. Go to Deployments tab in Vercel
2. Click the three dots (...) on latest deployment
3. Click "Redeploy"
4. Confirm

---

## That's It! 🎉

Your app should now deploy successfully. The database is ready, and once you add the environment variables, everything will work.

## Optional: Enable AI Features

If you want AI-generated questions and lessons:

Add this variable in Vercel:
- **Variable:** `EMERGENT_LLM_KEY`
- **Value:** Your Emergent LLM API key
- **Environments:** All

Without this key, the app still works but won't generate AI content.

## Optional: Enable Payments

If you want premium subscriptions via Stripe:

Add this variable in Vercel:
- **Variable:** `STRIPE_API_KEY`
- **Value:** Your Stripe secret key (from stripe.com/dashboard)
- **Environments:** All

Without this key, payment features won't work, but the free tier works fine.

---

## Need Help?

**Build failing?**
- Verify all 3 Supabase variables are added
- Make sure you clicked "Redeploy" after adding them

**Database errors?**
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Verify your Supabase project is active (not paused)

**App loads but can't sign up?**
- Double-check all environment variables
- Test the Supabase connection in Supabase dashboard
