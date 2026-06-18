# Frontend - Stock Broker Dashboard

## Run the frontend

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Environment Variables

Use `.env.example` as reference:

- `VITE_SOCKET_URL` - Backend Socket.IO URL

Example:

```bash
VITE_SOCKET_URL=http://localhost:5000
```

## Features

- Email login (demo auth)
- Subscribe/unsubscribe to supported stocks
- Real-time stock updates via Socket.IO
- Connection status indicator
- Mini chart with the last 20 price points
