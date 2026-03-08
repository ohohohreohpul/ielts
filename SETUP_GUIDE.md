# Setup Guide: Independent Authentication & Payments

This guide will help you set up your own Google OAuth credentials and Stripe API keys to become independent from Emergent Auth services.

## Current Status

Your application now supports **dual authentication modes**:
- **Emergent Auth** (current default) - Works out of the box, no setup needed
- **Custom Google OAuth** - Uses your own Google Cloud credentials (requires setup)

The system automatically detects which mode to use based on whether you've configured custom credentials in the Admin panel.

## Google OAuth Setup

To use your own Google OAuth credentials instead of Emergent Auth:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project

### Step 2: Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the following:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)

### Step 3: Copy Credentials

After creating the OAuth client, you'll receive:
- **Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-...`)

### Step 4: Configure in Admin Panel

1. Go to your application's Admin panel at `/admin`
2. Find the **Google OAuth Configuration** section
3. Paste your **Client ID** and **Client Secret**
4. Click **Save Configuration**

### Step 5: Test

Once saved, the system will automatically use your custom OAuth credentials for all new login/signup attempts.

## Stripe Setup

To use your own Stripe account for payments:

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Complete the registration process

### Step 2: Get API Keys

1. Navigate to **Developers** > **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
3. Copy the **Secret key** (use test mode keys for testing)

### Step 3: Configure in Admin Panel

1. Go to your application's Admin panel at `/admin`
2. Find the **Payment (Stripe)** section
3. Paste your **Stripe Secret Key**
4. Click **Save Configuration**

## Gemini AI Setup (Optional)

If you want to use your own Gemini API key instead of the Emergent LLM proxy:

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key

### Step 2: Configure in Admin Panel

1. Go to `/admin`
2. Find the **AI Configuration** section
3. Paste your **Gemini API Key**
4. Click **Save Configuration**

The system will automatically prioritize your custom key over the Emergent proxy.

## Database Configuration

All configuration settings are securely stored in your Supabase database in the `admin_config` table. The system uses Row Level Security (RLS) to ensure only authorized backend operations can access these credentials.

## Migration Strategy

You can migrate services one at a time:

1. **Start with Google OAuth**: Set up custom Google credentials first
2. **Then Stripe**: Add your own Stripe keys when ready
3. **Finally Gemini AI**: Optionally add your own AI key

During migration, any service without custom credentials will automatically fall back to Emergent services, ensuring zero downtime.

## Security Notes

- All API keys are stored encrypted in the database
- Keys are never exposed to the frontend
- The Admin panel shows `***configured***` for existing keys to prevent accidental exposure
- Only backend API routes can access the actual key values

## Verification

To verify your setup:

1. **Google OAuth**: The Admin panel status indicator will show green when custom OAuth is configured
2. **Stripe**: Payment flow will work with your Stripe dashboard
3. **Gemini**: AI-generated questions will use your quota

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your redirect URIs match exactly (including http/https)
3. Ensure API keys are copied correctly without extra spaces
4. For Google OAuth, make sure the Google+ API is enabled in your project

## Rollback

If you need to revert to Emergent Auth:
1. Go to `/admin`
2. Clear the Google OAuth credentials
3. Click **Save Configuration**

The system will automatically fall back to Emergent Auth.
