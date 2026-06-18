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

## Live Deployment

The application is currently deployed and live:

- **Frontend (Vercel)**: https://stock-broker-mocha.vercel.app/
- **Backend (Render)**: https://stock-broker-ghhe.onrender.com
- **Health Check**: https://stock-broker-ghhe.onrender.com/health

### Quick Start

1. Open https://stock-broker-mocha.vercel.app/ in your browser
2. Enter any valid email address (e.g., demo@example.com)
3. Click Subscribe on any stock to track prices
4. Watch real-time updates stream in every second
5. Open another tab with a different email to see multi-session capability

### Note

If accessing from a corporate network with Zscaler proxy, the backend may be blocked. Try accessing from:
- Personal WiFi
- Mobile hotspot
- VPN outside corporate network

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

**Status**: ✅ Already deployed at https://stock-broker-ghhe.onrender.com

To deploy your own instance:

1. Push this repository to GitHub.
2. In Render, click **New +** -> **Web Service**.
3. Connect your repository.
4. Use these settings:
	- Root Directory: `backend`
	- Runtime: `Node`
	- Build Command: `npm install`
	- Start Command: `npm start`
5. Add environment variables in Render:
	- `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
6. Deploy and copy your backend URL
7. Verify health endpoint works:
	- `https://your-render-url.onrender.com/health`

## Deploy Frontend On Vercel

**Status**: ✅ Already deployed at https://stock-broker-mocha.vercel.app/

To deploy your own instance:

1. In Vercel, click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Set project configuration:
	- Framework Preset: `Vite`
	- Root Directory: `frontend`
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Add environment variable in Vercel:
	- `VITE_SOCKET_URL=https://your-render-url.onrender.com`
5. Deploy and copy your Vercel production URL

## Current Production Configuration

- **Frontend URL**: https://stock-broker-mocha.vercel.app/
- **Backend URL**: https://stock-broker-ghhe.onrender.com
- **Render CORS_ORIGIN**: `https://stock-broker-mocha.vercel.app`
- **Vercel VITE_SOCKET_URL**: `https://stock-broker-ghhe.onrender.com`

Both services are connected and communicating. Socket.IO polling transport is used for compatibility.

### For Your Own Deployment

1. After deploying backend on Render, copy the backend URL
2. After deploying frontend on Vercel, copy the frontend URL
3. Update Render environment:
	- Set `CORS_ORIGIN=https://your-vercel-url`
	- Redeploy
4. Update Vercel environment:
	- Set `VITE_SOCKET_URL=https://your-render-url`
	- Redeploy
5. If using Vercel preview deployments, add both URLs:

```bash
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-main-your-team.vercel.app
```

## Demo Flow

1. Open the app in the browser.
2. Log in with any valid email address.
3. Subscribe to one or more supported stocks.
4. Watch the prices update live every second.
5. Open a second browser window and use a different email to show separate sessions.
