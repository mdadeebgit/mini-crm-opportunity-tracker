# Mini CRM — Opportunity Tracker

A secure full-stack **MERN** application for managing a shared CRM-style sales
opportunity pipeline. Teams can track leads, follow-ups, and deal stages, with
JWT authentication and strict **ownership-based authorization** enforced on the
backend.

## 🚀 Live Demo

| Resource | Link |
| -------- | ---- |
| **Live App** | https://mini-crm-opportunity-tracker-delta.vercel.app |
| **Backend API** | https://mini-crm-backend-f5n9.onrender.com |
| **API Health** | https://mini-crm-backend-f5n9.onrender.com/api/health |
| **Source** | https://github.com/mdadeebgit/mini-crm-opportunity-tracker |

> Registration is open — create an account to try it. A sample login is also
> available: **`prodtest1@crm.com`** / **`test123`**.
>
> ⏳ The backend runs on Render's free tier and sleeps after ~15 minutes of
> inactivity, so the **first request after idle may take 30–60 seconds** to
> wake up. Subsequent requests are fast.

---

## 1. Project Overview

- Users register and log in. Passwords are hashed with **bcrypt**.
- Authentication uses **JWT** (Bearer token, ~2 hour expiry).
- All logged-in users see a **shared pipeline** of every opportunity.
- Each user may **create** opportunities; only the **owner** may **edit** or
  **delete** their own. Ownership is derived from the JWT on the server and is
  **never** trusted from the request body.
- Bonus features included: search, stage/priority filters, sorting, and a
  dashboard summary (pipeline value, won value, high-priority count).

## 2. Tech Stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Frontend  | React 18 (Vite), React Router, Axios, Tailwind CSS            |
| Backend   | Node.js, Express                                              |
| Database  | MongoDB with Mongoose                                          |
| Auth      | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`                  |
| Validation| `express-validator`                                           |

## 3. Project Structure

```
CRM/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/      authController.js, opportunityController.js
│   │   ├── middleware/        authMiddleware.js, errorMiddleware.js, validate.js
│   │   ├── models/            User.js, Opportunity.js
│   │   ├── routes/            authRoutes.js, opportunityRoutes.js
│   │   ├── utils/             generateToken.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        Navbar, OpportunityCard, OpportunityForm
    │   ├── context/           AuthContext.jsx
    │   ├── pages/             Login, Register, Dashboard
    │   ├── services/          api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

## 4. Backend Setup

```bash
cd backend
cp .env.example .env        # then edit values
npm install
npm run dev                 # starts on http://localhost:5000
```

You need a MongoDB instance. Use a local `mongod` or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster, and put the connection
string in `MONGO_URI`.

### Backend environment variables

| Variable         | Description                                        | Example                                 |
| ---------------- | -------------------------------------------------- | --------------------------------------- |
| `PORT`           | Port the API listens on                            | `5000`                                  |
| `NODE_ENV`       | `development` or `production`                       | `development`                           |
| `MONGO_URI`      | MongoDB connection string                          | `mongodb://127.0.0.1:27017/mini_crm`    |
| `JWT_SECRET`     | Secret used to sign JWTs (use a long random value) | `a-long-random-string`                  |
| `JWT_EXPIRES_IN` | Token lifetime                                      | `2h`                                    |
| `CLIENT_URL`     | Allowed CORS origin(s), comma-separated            | `http://localhost:5173`                 |

## 5. Frontend Setup

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL to your backend URL
npm install
npm run dev                 # starts on http://localhost:5173
```

### Frontend environment variables

| Variable       | Description              | Example                       |
| -------------- | ------------------------ | ----------------------------- |
| `VITE_API_URL` | Base URL of the backend  | `http://localhost:5000/api`   |

## 6. API Reference

Base URL: `<backend>/api`. All `/opportunities` routes require an
`Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint         | Body                        | Description                  |
| ------ | ---------------- | --------------------------- | ---------------------------- |
| POST   | `/auth/register` | `{ name, email, password }` | Register, returns user+token |
| POST   | `/auth/login`    | `{ email, password }`       | Login, returns user+token    |
| GET    | `/auth/me`       | —                           | Current user profile         |

### Opportunities

| Method | Endpoint             | Access rule                              |
| ------ | -------------------- | ---------------------------------------- |
| GET    | `/opportunities`     | Any logged-in user (shared pipeline)     |
| POST   | `/opportunities`     | Any logged-in user (owner set from JWT)  |
| GET    | `/opportunities/:id` | Any logged-in user                       |
| PUT    | `/opportunities/:id` | **Owner only**                           |
| DELETE | `/opportunities/:id` | **Owner only**                           |

`GET /opportunities` supports query params: `stage`, `priority`, `search`,
and `sort` (`newest` | `oldest` | `value` | `followup`).

**Opportunity fields:** `customerName` (required), `contactName`,
`contactEmail`, `contactPhone`, `requirement` (required), `estimatedValue`
(≥ 0), `stage` (`New | Contacted | Qualified | Proposal Sent | Won | Lost`),
`priority` (`Low | Medium | High`), `nextFollowUpDate`, `notes`. The `owner`
field is set server-side from the JWT and ignored if sent by the client.

## 7. Security Notes

- Passwords are bcrypt-hashed and never returned in API responses.
- JWT is required on all opportunity endpoints via auth middleware.
- `owner` / `user_id` is **never** accepted from the request body — it is
  derived from the verified token.
- Ownership is checked in the backend before any update or delete; hiding
  buttons in the UI is only a convenience, not the security boundary.
- Secrets live in environment variables; `.env` is git-ignored and an
  `.env.example` is provided.

## 8. Deployment

> See **[DEPLOYMENT.md](DEPLOYMENT.md)** for a full step-by-step guide with exact
> env-var values, the `render.yaml` blueprint, and Vercel config.

Recommended free-tier hosting:

- **Database:** MongoDB Atlas — create a cluster, allow network access, copy the
  connection string into the backend `MONGO_URI`.
- **Backend:** Render / Railway — deploy the `backend/` folder, set start command
  `npm start`, and add all backend env vars. Set `CLIENT_URL` to the deployed
  frontend URL.
- **Frontend:** Vercel / Netlify — deploy the `frontend/` folder, build command
  `npm run build`, output dir `dist`, and set `VITE_API_URL` to the deployed
  backend `/api` URL.

## 9. Known Limitations / Future Improvements

- No refresh-token flow; the user is logged out when the 2h JWT expires.
- Pagination is not yet implemented for very large pipelines.
- Activity/follow-up history per opportunity is not tracked.
- No automated test suite yet (manual testing only).
```
