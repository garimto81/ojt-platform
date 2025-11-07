# 🚀 GG Production Platform - Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Supabase account and project
- ✅ OpenAI API key (for AI quiz generation)
- ✅ Vercel account (for hosting)
- ✅ Git repository initialized

---

## 🔧 Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project credentials:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **Anon Key**: Public API key
   - **Service Role Key**: Admin API key (keep secret!)

### 1.2 Run Database Migrations

```bash
cd ggp-platform
cd supabase

# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref [YOUR-PROJECT-REF]

# Run migrations
supabase db push
```

### 1.3 Verify Database

Check these tables exist:
- `profiles`
- `curriculum_days`
- `lessons`
- `user_progress`
- `quizzes`
- `quiz_attempts`
- `leaderboard_snapshots`
- `achievements`

---

## 🔑 Step 2: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **API Keys**
3. Create new secret key
4. Save it securely (starts with `sk-`)

---

## 📦 Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `ggp-platform`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.3 Set Environment Variables

In Vercel project settings → Environment Variables, add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 3.4 Deploy

Click **"Deploy"** and wait for build to complete (~2-3 minutes)

---

## ✅ Step 4: Post-Deployment

### 4.1 Create Admin User

1. Sign up through the app
2. In Supabase Dashboard:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

### 4.2 Add Content

1. Login as admin
2. Go to **Admin → Lesson Content**
3. Add lesson content for each day
4. Go to **Admin → AI Quiz Generator**
5. Generate quizzes for each lesson

### 4.3 Test

- ✅ User registration
- ✅ Login/logout
- ✅ View lessons
- ✅ Complete lessons (points awarded)
- ✅ Take quizzes
- ✅ View leaderboard
- ✅ Admin: Edit lessons
- ✅ Admin: Generate quizzes

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is only in Vercel environment variables
- [ ] Supabase RLS policies are enabled
- [ ] Admin role is properly protected in database
- [ ] OpenAI API key is secret

---

## 🌍 Custom Domain (Optional)

### In Vercel:
1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed

### Update Environment:
```env
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

---

## 📊 Monitoring

### Vercel Analytics
- Automatically enabled
- View at: Project → Analytics

### Supabase Logs
- View at: Supabase Dashboard → Database → Logs
- Check API usage, errors

### OpenAI Usage
- View at: platform.openai.com → Usage
- Monitor costs

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild locally
rm -rf .next
npm run build
```

### Database Connection Error
- Check `DATABASE_URL` format
- Verify Supabase project is active
- Test connection in Supabase dashboard

### OpenAI Error
- Verify API key is correct
- Check usage limits at platform.openai.com
- Ensure billing is set up

### Quiz Generation Not Working
- Check OpenAI API key in Vercel environment
- Check lesson has content
- Review function logs in Vercel

---

## 🔄 Updates

### Deploy New Changes
```bash
git add .
git commit -m "Update: description"
git push origin main
```

Vercel will automatically redeploy.

---

## 💰 Cost Estimation

### Free Tier:
- **Vercel**: Free for hobby projects
- **Supabase**: 500MB database, 2GB bandwidth
- **OpenAI**: Pay-as-you-go (~$0.03 per quiz generation)

### Expected Monthly (100 users):
- Vercel: $0 (within free tier)
- Supabase: $0-25 (depends on usage)
- OpenAI: $5-20 (depends on quiz generation frequency)

**Total: ~$5-45/month**

---

## 📞 Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **OpenAI**: [help.openai.com](https://help.openai.com)

---

**Ready to launch! 🚀**
