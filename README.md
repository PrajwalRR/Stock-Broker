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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo Flow

1. Open the app in the browser.
2. Log in with any valid email address.
3. Subscribe to one or more supported stocks.
4. Watch the prices update live every second.
5. Open a second browser window and use a different email to show separate sessions.
