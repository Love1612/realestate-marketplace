# GitHub / Vercel handoff

## Upload to GitHub

### Option A — GitHub website
1. Open your RentHub repository.
2. Choose **Add file → Upload files**.
3. Upload the contents of this folder, not the outer ZIP folder.
4. Commit to your main branch.

### Option B — Git command line

```bash
git add .
git commit -m "RentHub v12 launch build"
git push origin main
```

## After pushing
1. In Vercel, redeploy the latest commit.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Add/update environment variables from `.env.example` in Vercel.
4. Configure Stripe webhook: `/api/stripe-webhook`.
5. Confirm the Vercel cron jobs are active.
6. Test Basic, Featured, Premium and one portfolio subscription in Stripe test mode.

## Important
The source package is ready for handoff, but the local environment here could not complete `npm install` within the available runtime, so a full dependency-backed `next build` was not verified in this session. Run `npm install`, `npm run typecheck`, and `npm run build` in GitHub Actions or Vercel before public launch.
