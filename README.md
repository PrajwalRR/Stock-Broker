# Stock Broker Dashboard

Stock Broker Dashboard is a simple full-stack trading demo that shows live stock prices, user login, and per-user stock subscriptions in real time.

## Project Description

This project is built for presentation and demo purposes. It lets a user log in with an email address, subscribe to supported stocks, and watch price updates stream live through Socket.IO. The interface is designed to look like a modern trading dashboard while keeping the logic easy to follow.

## Key Features

- Email-based demo login
- Real-time stock price updates
- Subscribe and unsubscribe to stocks
- Live connection status indicator
- Clean dashboard UI for presentation

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Socket.IO Client
- Backend: Node.js, Express, Socket.IO
- Storage: In-memory only, no database

## Supported Stocks

- GOOG - Alphabet Inc.
- TSLA - Tesla Inc.
- AMZN - Amazon.com Inc.
- META - Meta Platforms Inc.
- NVDA - NVIDIA Corporation

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

Create `.env` from `backend/.env.example` for local setup:

```bash
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Create `.env` from `frontend/.env.example` for local setup:

```bash
VITE_SOCKET_URL=http://localhost:5000
```

## Deploy Backend On Render

1. Push this repository to GitHub.
2. In Render, click **New +** -> **Web Service**.
3. Connect your repository.
4. Use these settings:
	- Root Directory: `backend`
	- Runtime: `Node`
	- Build Command: `npm install`
	- Start Command: `npm start`
5. Add environment variables in Render:
	- `PORT=10000` (optional, Render also provides `PORT` automatically)
	- `CORS_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app`
6. Deploy and copy your backend URL, for example:
	- `https://stock-broker-dashboard-backend.onrender.com`
7. Verify health endpoint:
	- `https://YOUR-RENDER-URL/health`

## Deploy Frontend On Vercel

1. In Vercel, click **Add New...** -> **Project**.
2. Import the same GitHub repository.
3. Set project configuration:
	- Framework Preset: `Vite`
	- Root Directory: `frontend`
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Add environment variable in Vercel:
	- `VITE_SOCKET_URL=https://YOUR-RENDER-URL.onrender.com`
5. Deploy.

## Final Production Wiring

1. Copy your Vercel production URL.
2. Update Render `CORS_ORIGIN` to that URL.
3. If you use Vercel preview deployments, add both preview and production URLs to Render:

```bash
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-main-your-team.vercel.app
```

4. Redeploy Render after updating env vars.

## Demo Flow

1. Open the app in the browser.
2. Log in with any valid email address.
3. Subscribe to one or more supported stocks.
4. Watch the prices update live every second.
5. Open a second browser window and use a different email to show separate sessions.
