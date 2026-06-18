# Backend - Stock Broker Dashboard

## Run the backend

```bash
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

## Environment Variables

Use `.env.example` as reference:

- `PORT` - Server port (Render sets this automatically in production)
- `CORS_ORIGIN` - Allowed frontend origins (comma-separated for multiple)

Example:

```bash
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## Socket events

- `user:login`
- `stock:subscribe`
- `stock:unsubscribe`
- `user:logout`
- `stock:update` (server -> clients every second)
