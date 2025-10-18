# ReferHub — Candidate Referral Management System

A full‑stack app that consists: refer candidates, track statuses, upload resumes to cloud storage, and view simple metrics.

**Live demo**  
Frontend: https://candidate-referal.netlify.app/  
Backend: https://candidate-referal-systemq.onrender.com

---

## ✨ Features

### Frontend (React)
- **Authentication** (JWT): Login & Signup.
- **Dashboard**
  - List of referred candidates (fetched from backend).
  - Each card shows **Name, Email, Phone, Job Title, Status**.
  - **Search** by name/job title.
  - **Filter** by status (All, Pending, Reviewed, Hired).
- **Referral Form**
  - Fields: Candidate Name, Email, Phone, Job Title, Resume (optional, **PDF only**).
  - Submits to backend via `multipart/form-data`.
- **Update Status**
  - Change status from **Pending → Reviewed → Hired** via dropdown.
- **Metrics**
  - Total referred, and counts per status.

### Backend (Node.js + Express + MongoDB)
- **Endpoints**
  - `POST /api/candidates` – Create candidate (with optional PDF upload).
  - `GET /api/candidates` – List candidates (supports `?search` and `?status_filter`).
  - `PUT /api/candidates/:id/status` – Update a candidate’s status.
  - `DELETE /api/candidates/:id` – Delete candidate (optional requirement).
  - `GET /api/candidates/stats` – Basic metrics.
  - `POST /api/auth/signup` – Register.
  - `POST /api/auth/login` – Login.
- **Storage**
  - **MongoDB Atlas** for candidate & user records.
  - **Cloudinary** for resume files (PDF). Stored as **resource_type** = `raw` (recommended for PDF).

---

## 🧱 Tech Stack

- **Frontend**: React (CRA + CRACO), Axios, Lucide Icons, Sonner
- **Styling**: Plain CSS (converted from Tailwind look), Responsive
- **Backend**: Node.js, Express, Mongoose
- **DB**: MongoDB Atlas
- **Cloud Storage**: Cloudinary
- **Auth**: JWT (Bearer token in `Authorization` header)
- **Deploy**: Netlify (frontend), Render (backend)

---

## 🗂 Project Structure (high‑level)

```
/frontend
  /public
    _redirects        # Netlify SPA refresh fix
  /src
    App.js
    pages/
      Auth.jsx        # Login/Signup
      Dashboard.jsx   # Main dashboard
    index.js
    index.css         # CSS styles
  craco.config.js
  package.json

/backend
  server.js
  /config
    database.js
    cloudinary.js
  /models
    Candidate.js
    User.js
  /routes
    authRoutes.js
    candidateRoutes.js
  /controllers
    authController.js
    candidateController.js
  .env (not committed)
```

---

## ⚙️ Environment Variables

### Frontend (`/frontend/.env`)
```
REACT_APP_BACKEND_URL=https://candidate-referal-systemq.onrender.com
DISABLE_ESLINT_PLUGIN=true
```

> For local dev, you can set:
> `REACT_APP_BACKEND_URL=http://localhost:5000`

### Backend (`/backend/.env`)
```
PORT=5000
MONGO_URL=<your-mongodb-connection-string>
DB_NAME=candidate-referal
CORS_ORIGINS=*
JWT_SECRET=<your-strong-secret>
JWT_ALGORITHM=HS256

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

---

## 🚀 Running Locally

### 1) Backend
```bash
cd backend
npm install
npm start
# server at http://localhost:5000
```

### 2) Frontend
```bash
cd frontend
npm install

# If ESLint blocks production builds, this flag skips linting during build:
# (already included in package.json build script or .env)
npm run dev      # start dev server
npm run build    # create production build
```

**Netlify SPA fix** (must have): `/frontend/public/_redirects`
```
/*    /index.html   200
```

---

## 🔐 Auth Flow

- **Signup** `POST /api/auth/signup` → creates user in DB, returns `{"access_token": "...", "user": {...}}`.
- **Login** `POST /api/auth/login` → verifies, returns `{"access_token": "...", "user": {...}}`.
- Frontend stores token in `localStorage` and sends it as `Authorization: Bearer <token>` with all protected requests.

---

## ☁️ Cloudinary Notes (PDF viewing)

- Backend uploads PDF either as `resource_type: "raw"` (recommended) or `"image"` (if you need inline preview).
- On the frontend, to make Cloudinary serve web‑viewable content types, we transform the URL:
  - `resume_url.replace("/upload/", "/upload/f_auto/")` → This lets Cloudinary choose the best format when possible.
- For **forced download** links:
  - `resume_url.replace("/upload/", "/upload/fl_attachment/")`

> If you upload as `raw`, the URL looks like:  
> `https://res.cloudinary.com/<cloud>/raw/upload/v.../resumes/<file>.pdf`  
> These URLs are directly openable by the browser (subject to CORS and resource availability).

---

## 🧪 API Documentation (Quick Reference)

### Auth
**Signup**
```
POST /api/auth/signup
Content-Type: application/json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Login**
```
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Candidates
**Create**
```
POST /api/candidates
Authorization: Bearer <token>
Content-Type: multipart/form-data
Form fields: name, email, phone, job_title, resume (optional .pdf)
```
**List**
```
GET /api/candidates?search=dev&status_filter=Pending
Authorization: Bearer <token>
```
**Update Status**
```
PUT /api/candidates/:id/status
Authorization: Bearer <token>
Content-Type: application/json
{ "status": "Reviewed" }  # one of: Pending | Reviewed | Hired
```
**Delete**
```
DELETE /api/candidates/:id
Authorization: Bearer <token>
```
**Stats**
```
GET /api/candidates/stats
Authorization: Bearer <token>
```

---

## 🧰 Validation

- Email format validated (basic RFC pattern).
- Phone: 10–15 digits.
- Resume: **PDF only** when uploading via form (`accept=".pdf"`).

---

## 🧯 Error Handling

- All endpoints return appropriate status codes (400/401/404/500).
- Backend uses centralized error middleware.
- Frontend shows toast notifications on failure.

---

## 📦 Deployment

### Backend (Render)
- Root command: `npm install && npm start` (or `cd backend && npm i && npm start` if your repo contains both apps).
- Set all **backend env vars** in Render dashboard.
- Expose `PORT` and allow CORS: `CORS_ORIGINS=*` for testing.

### Frontend (Netlify)
- Build command: `npm run build`
- Publish directory: `build`
- Environment:
  - `REACT_APP_BACKEND_URL=https://candidate-referal-systemq.onrender.com`
  - `DISABLE_ESLINT_PLUGIN=true` (only if CRACO+ESLint conflicts)
- SPA redirects: `/public/_redirects` with:
  ```
  /*    /index.html   200
  ```

---

## ✅ Deliverables Checklist

- [x] **Source code** (Frontend + Backend)
- [x] **Deployed Frontend**: https://candidate-referal.netlify.app/
- [x] **Deployed Backend**: https://candidate-referal-systemq.onrender.com
- [x] **CRUD/Status APIs**
- [x] **Resume upload to Cloudinary**
- [x] **Metrics dashboard**
- [x] **README** (this file)
- [x] Postman: (optional) Use cURL snippets above or import routes manually

---

## 📝 Assumptions & Limitations

- Demo authentication (JWT) is basic; no refresh tokens.
- CORS is open (`*`) for ease of testing; should be restricted in production.
- Cloudinary files are public; for private assets you’d use signed URLs.
- Validation is minimal by design; can be extended with `zod`/`yup` both client and server side.

---

## 🧭 How to Switch Between Local and Deployed Backends

- Change `REACT_APP_BACKEND_URL` in Frontend `.env`:
  - Local: `http://localhost:5000`
  - Render: `https://candidate-referal-systemq.onrender.com`
- Rebuild frontend for Netlify after changing `.env`.

---

## 🙌 Credits

Built by **Shivam** as part of the Candidate Referral System assignment.  
Cloud storage via **Cloudinary**. DB via **MongoDB Atlas**. Deploys on **Netlify** & **Render**.
