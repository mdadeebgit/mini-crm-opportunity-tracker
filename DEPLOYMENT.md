# Deployment Guide

Live deployment of the Mini CRM Opportunity Tracker:

- **Database** → MongoDB Atlas (already set up)
- **Backend** → Render (Node web service)
- **Frontend** → Vercel (Vite static site)

The repo includes `render.yaml` (backend blueprint), `frontend/vercel.json`
(Vercel config), and `frontend/public/_redirects` (Netlify fallback). Deploy the
**backend first** so you have its URL for the frontend.

---

## 0. Before you start (security)

The database password was shared in chat during setup, so rotate it:

1. Atlas → **Database Access** → edit `ermdadeeb_db_user` → **Edit Password** →
   set a new strong value (letters + numbers only) → **Update User**.
2. Use this new password in `MONGO_URI` everywhere below.
3. Confirm Atlas → **Network Access** allows `0.0.0.0/0` (Render/Vercel use
   dynamic IPs).

Also generate a strong production `JWT_SECRET` (do **not** reuse the dev one):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 1. Backend on Render

### Option A — Blueprint (uses `render.yaml`)

1. Go to https://dashboard.render.com → **New +** → **Blueprint**.
2. Connect your GitHub and select **`mini-crm-opportunity-tracker`**.
3. Render detects `render.yaml`. It will prompt for the `sync: false` vars —
   fill them (see table below) → **Apply**.

### Option B — Manual web service

1. **New +** → **Web Service** → connect the repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
   - **Plan:** Free

### Backend environment variables (Render → Environment)

| Key              | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| `NODE_ENV`       | `production`                                                          |
| `JWT_EXPIRES_IN` | `2h`                                                                  |
| `MONGO_URI`      | `mongodb+srv://ermdadeeb_db_user:<NEW_PASSWORD>@cluster0.cisph2l.mongodb.net/mini_crm?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET`     | the long random string you generated above                           |
| `CLIENT_URL`     | your Vercel URL (fill **after** step 2, then redeploy)               |

> `PORT` is provided by Render automatically — do not set it. The app already
> reads `process.env.PORT`.

After deploy, confirm: open `https://<your-render-app>.onrender.com/api/health`
→ should return `{"status":"ok",...}`.

> Note: Render free services sleep after inactivity; the first request after
> idle can take ~30–60s to wake.

---

## 2. Frontend on Vercel

1. Go to https://vercel.com → **Add New** → **Project** → import the repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected; `vercel.json` also sets it)
   - Build Command / Output dir are handled by `vercel.json`
     (`npm run build` → `dist`).
3. **Environment Variables:**

| Key            | Value                                              |
| -------------- | -------------------------------------------------- |
| `VITE_API_URL` | `https://<your-render-app>.onrender.com/api`       |

4. **Deploy.** Copy the resulting URL, e.g. `https://mini-crm-xyz.vercel.app`.

> Vite inlines env vars at **build time**. If you change `VITE_API_URL` later,
> trigger a **redeploy**.

---

## 3. Connect the two (CORS)

1. Back in **Render** → backend service → **Environment** → set `CLIENT_URL` to
   your exact Vercel URL (no trailing slash), e.g.
   `https://mini-crm-xyz.vercel.app`.
2. Save → Render redeploys. This whitelists the frontend origin for CORS.

---

## 4. Verify the live app

1. Open your Vercel URL.
2. **Register** a new account → you should land on the dashboard.
3. Create an opportunity → it appears with the **"You"** badge.
4. Open browser dev tools → Network → confirm requests go to your Render
   `/api/...` URL and return 200/201.
5. (Optional) Register a second account in a private window → you see the shared
   pipeline but cannot edit/delete others' records.

---

## Submission checklist

- [ ] Live frontend URL (Vercel)
- [ ] Live backend URL (Render) — `/api/health` returns ok
- [ ] GitHub repo: https://github.com/mdadeebgit/mini-crm-opportunity-tracker
- [ ] DB password rotated; strong `JWT_SECRET` in production
- [ ] README + this DEPLOYMENT.md included

## Troubleshooting

| Symptom                                   | Fix                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| CORS error in browser console             | `CLIENT_URL` on Render must equal the Vercel origin exactly (no slash) |
| Frontend calls `localhost:5000`           | `VITE_API_URL` not set on Vercel, or needs a redeploy                  |
| Login/refresh shows 404 on Vercel/Netlify | SPA rewrite missing — `vercel.json` / `_redirects` handle this         |
| Backend 500 / cannot connect to DB        | Check `MONGO_URI`, Atlas Network Access `0.0.0.0/0`, password correct  |
| First request very slow                   | Render free tier cold start — expected                                 |
