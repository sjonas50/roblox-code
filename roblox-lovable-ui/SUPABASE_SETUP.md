# Supabase Authentication Setup Guide

## Quick Start

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Project Credentials**
   - In your Supabase dashboard, go to Settings → API
   - Copy your `Project URL` and `anon public` key

3. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Database Setup**
   - In Supabase dashboard, go to SQL Editor
   - Run the contents of `supabase/schema.sql`
   - Then run the contents of `supabase/rls-policies.sql`

5. **Configure Authentication Providers**
   - Go to Authentication → Providers
   - Enable Email/Password
   - Optional: Configure OAuth providers (Google, GitHub, Discord)

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URL: `https://yourproject.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://yourproject.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 → General
4. Add redirect: `https://yourproject.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to Supabase

## Email Templates (Optional)

Customize email templates in Authentication → Email Templates:
- Confirmation email
- Password recovery
- Magic link

## Production Checklist

- [ ] Enable Row Level Security on all tables
- [ ] Configure custom SMTP for production emails
- [ ] Set up proper redirect URLs for production domain
- [ ] Enable 2FA for team members
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check that you copied the `anon` key, not the `service_role` key
   - Ensure no extra spaces in the environment variables

2. **"User not found after signup"**
   - Check email confirmation settings
   - Verify the trigger for creating profile is active

3. **OAuth redirect errors**
   - Ensure redirect URLs match exactly
   - Check that OAuth provider is enabled in Supabase

For more help, visit the [Supabase docs](https://supabase.com/docs) or our FAQ.