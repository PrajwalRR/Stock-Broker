# Backend - Stock Broker Dashboard

## Run the backend

```bash
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

## Socket events

- `user:login`
- `stock:subscribe`
- `stock:unsubscribe`
- `user:logout`
- `stock:update` (server -> clients every second)
