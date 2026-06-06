# GitHub → Vercel deploy checklist

Follow these steps **once**, then every GitHub push auto-deploys.

## 1. Push code to GitHub

Upload or push the full project folder. These files **must** be included:

- `scripts/vercel-build.mjs`
- `prisma/seed.mjs`
- `prisma/schema.prisma`
- `package.json` + `package-lock.json`
- `vercel.json`
- `src/` folder

Do **not** upload `.env` (secrets stay on Vercel only).

## 2. Connect Vercel to GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Build Command: `npm run vercel-build` (already set in `vercel.json`)

## 3. Add environment variables (required)

In **Vercel → Project → Settings → Environment Variables**, add for **Production**:

| Name | Where to get it |
|------|-----------------|
| `DATABASE_URL` | Neon dashboard → pooled connection string |
| `DIRECT_URL` | Neon dashboard → direct connection string |
| `JWT_SECRET` | Any long random string (32+ characters) |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

## 4. Deploy

Click **Deploy**. The build will:

1. Install packages
2. Generate Prisma client
3. Sync database schema
4. Seed admin user
5. Build Next.js

## 5. Login after deploy

- URL: `https://YOUR-APP.vercel.app/login/admin`
- Username: `Smartstep05618`
- Password: `SmartTed*#1`

## If build fails

| Error | Fix |
|-------|-----|
| Missing `DATABASE_URL` | Add Neon URLs in Vercel env vars |
| `Cannot find module scripts/vercel-build.mjs` | Push `scripts/vercel-build.mjs` to GitHub |
| Prisma db push failed | Check `DIRECT_URL` is the **direct** Neon URL (not pooled) |
| Build succeeds but login fails | Set `JWT_SECRET` and redeploy |
