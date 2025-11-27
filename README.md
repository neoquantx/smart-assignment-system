
# Smart Assignment System

> A comprehensive web-based platform for managing academic assignments, submissions, grading, and analytics.

**Created by:** Himanshu Nikam

Smart Assignment System is a full-stack web application designed to streamline the complete lifecycle of academic assignments — from creation and distribution to submission handling, grading, feedback delivery, and performance analytics — for both instructors and students.


## Table of Contents
- Project overview
- Features
- Tech stack
- Prerequisites
- Environment variables
- Installation (development)
- Run (development)
- Build & Run (production-like)
- Project structure
- Troubleshooting
- Contributing
- License

## Project overview

This repository contains a Vite + React frontend and an Express + Node backend (MongoDB). The frontend communicates with the backend via a REST API. The backend also serves static frontend builds when deployed as a single service.

## Features

- Role-based dashboards (students / teachers)
- Assignment creation and distribution
- File submissions with upload handling
- Grading and feedback (rubric comments, scores)
- Messaging between users
- Analytics for class performance

## Tech stack

- Frontend: Vite, React, Tailwind CSS
- Backend: Node.js, Express, Mongoose (MongoDB)
- Auth: JWT
- File uploads: multer (local in dev) — recommended S3/Cloudinary in production

## Prerequisites

- Node.js (>= 18 recommended)
- npm
- MongoDB (local) or MongoDB Atlas connection URI for production

## Environment variables

Create `.env` files in the `backend/` and `frontend/` directories (or configure environment variables in your host).

Backend (`backend/.env`) — required:

```
MONGO_URI=mongodb://127.0.0.1:27017/ams    # or your MongoDB Atlas URI
JWT_SECRET=your-secure-jwt-secret
PORT=8000                                  # optional
```

Frontend (`frontend/.env`) — optional for local dev (used by `src/services/api.js`):

```
VITE_API_BASE=http://localhost:8000/api
```

Notes:
- In production, set `MONGO_URI` and `JWT_SECRET` via your host (Render/Vercel) environment settings. Do not commit secrets to the repo.
- If you use a hosted backend URL, set `VITE_API_BASE` to `https://your-backend.example.com/api` or omit and use relative `/api` when co-hosted.

## Installation (development)

Clone the repo and install dependencies for frontend and backend:

```bash
git clone https://github.com/neoquantx/smart-assignment-system.git
cd smart-assignment-system

# Backend
cd backend
npm install

# In a separate terminal: Frontend
cd ../frontend
npm install
```

## Run (development)

Run backend in dev mode (nodemon) and frontend with Vite dev server:

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

Open the frontend dev server URL (typically `http://localhost:5173`) and the frontend will call the API at `VITE_API_BASE`.

## Build & Run (production-like)

This project includes a root-level build script that will build the frontend and install backend dependencies. To produce a production-like build and serve it from the backend:

```bash
# From repo root (this script builds frontend and installs backend deps)
npm run build

# After build, run backend which will serve files from `dist`
cd backend
npm start

# Visit: http://localhost:8000
```

Alternatively, perform the steps manually:

```bash
cd frontend
npm run build
cd ..
rm -rf dist
cp -R frontend/dist dist

cd backend
npm install
npm start
```

## Project structure

```
smart-assignment-system/
├─ backend/                 # Express API, models, routes
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ uploads/              # development uploads
│  └─ server.js
├─ frontend/                # Vite + React app
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  └─ services/api.js    # API client (uses VITE_API_BASE)
│  └─ package.json
├─ package.json              # Root scripts (build/start)
```



## Contributing

Feel free to open issues or PRs. For local contributions:

1. Fork the repo
2. Create a feature branch
3. Run tests / lint (if added)
4. Open a PR with a clear description

## License

This project is currently unlicensed. Please contact the author for usage permissions.

## Author

**Himanshu Nikam**

For questions, feedback, or collaboration opportunities, feel free to reach out.

---


