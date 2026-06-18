const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

function normalizeOrigin(origin) {
  return origin.replace(/\/+$/, "");
}

function getAllowedOrigins() {
  const configured = process.env.CORS_ORIGIN || process.env.CLIENT_URL;
  if (!configured) {
    return ["http://localhost:5173"];
  }

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(normalizeOrigin(origin));
}

const supportedStocks = {
  GOOG: {
    companyName: "Alphabet Inc.",
    basePrice: 180,
    history: [], // Array of { timestamp, open, high, low, close }
  },
  TSLA: {
    companyName: "Tesla Inc.",
    basePrice: 250,
    history: [],
  },
  AMZN: {
    companyName: "Amazon.com Inc.",
    basePrice: 190,
    history: [],
  },
  META: {
    companyName: "Meta Platforms Inc.",
    basePrice: 510,
    history: [],
  },
  NVDA: {
    companyName: "NVIDIA Corporation",
    basePrice: 120,
    history: [],
  },
};

function initializeStockHistory() {
  Object.keys(supportedStocks).forEach((ticker) => {
    const stock = supportedStocks[ticker];
    let price = stock.basePrice;

    // Generate 365 days of historical data
    for (let i = 365; i > 0; i--) {
      const daysAgo = i;
      const timestamp = new Date(Date.now() - daysAgo * 86400000).toISOString();

      let dayOpen = price;
      const dailyChange = (Math.random() - 0.5) * 15; // -7.5 to +7.5 per day
      price = Math.max(10, price + dailyChange);

      const high = price + Math.random() * 3;
      const low = Math.min(price, dayOpen) - Math.random() * 1;

      stock.history.push({
        timestamp,
        open: Number(dayOpen.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(price.toFixed(2)),
      });
    }
  });
}

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
  })
);
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST"],
  },
});

// email -> { socketId, subscriptions: Set<string> }
const connectedUsers = new Map();
// socketId -> email
const socketToEmail = new Map();

function isValidEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getUserRecord(email) {
  return connectedUsers.get(normalizeEmail(email));
}

function serializeSubscriptions(userRecord) {
  return Array.from(userRecord.subscriptions.values());
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "stock-broker-dashboard-backend" });
});

app.get("/stocks", (_req, res) => {
  res.json({
    stocks: Object.entries(supportedStocks).map(([ticker, details]) => ({
      ticker,
      companyName: details.companyName,
    })),
  });
});

function getHistoryByTimeframe(ticker, timeframe) {
  const stock = supportedStocks[ticker];
  if (!stock || !stock.history) {
    return [];
  }

  const now = new Date();
  let days = 1;

  if (timeframe === "1W") {
    days = 7;
  } else if (timeframe === "1M") {
    days = 30;
  } else if (timeframe === "1Y") {
    days = 365;
  }

  const cutoffTime = new Date(now.getTime() - days * 86400000);
  return stock.history.filter((candle) => new Date(candle.timestamp) >= cutoffTime);
}

io.on("connection", (socket) => {
  socket.on("user:login", (payload, callback) => {
    const email = payload?.email;

    if (!isValidEmail(email)) {
      callback?.({ success: false, error: "Please provide a valid email." });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = connectedUsers.get(normalizedEmail);

    if (existing?.socketId && existing.socketId !== socket.id) {
      const previousSocket = io.sockets.sockets.get(existing.socketId);
      if (previousSocket) {
        previousSocket.emit("user:logout", {
          reason: "You were logged out because this account was used elsewhere.",
        });
        previousSocket.disconnect(true);
      }
    }

    connectedUsers.set(normalizedEmail, {
      socketId: socket.id,
      subscriptions: new Set(existing ? Array.from(existing.subscriptions) : []),
    });
    socketToEmail.set(socket.id, normalizedEmail);

    const userRecord = connectedUsers.get(normalizedEmail);
    serializeSubscriptions(userRecord).forEach((ticker) => {
      socket.join(ticker);
    });

    callback?.({
      success: true,
      email: normalizedEmail,
      subscriptions: serializeSubscriptions(userRecord),
      supportedStocks: Object.keys(supportedStocks),
    });
  });

  socket.on("stock:subscribe", (payload, callback) => {
    const email = payload?.email;
    const ticker = payload?.ticker;

    if (!isValidEmail(email)) {
      callback?.({ success: false, error: "Invalid email." });
      return;
    }

    if (!supportedStocks[ticker]) {
      callback?.({
        success: false,
        error: `Unsupported ticker: ${ticker}.`,
      });
      return;
    }

    const userRecord = getUserRecord(email);
    if (!userRecord || userRecord.socketId !== socket.id) {
      callback?.({ success: false, error: "User is not logged in on this socket." });
      return;
    }

    if (userRecord.subscriptions.has(ticker)) {
      callback?.({
        success: false,
        error: `${ticker} is already subscribed.`,
        subscriptions: serializeSubscriptions(userRecord),
      });
      return;
    }

    userRecord.subscriptions.add(ticker);
    socket.join(ticker);

    callback?.({
      success: true,
      subscriptions: serializeSubscriptions(userRecord),
      ticker,
    });
  });

  socket.on("stock:unsubscribe", (payload, callback) => {
    const email = payload?.email;
    const ticker = payload?.ticker;

    if (!isValidEmail(email)) {
      callback?.({ success: false, error: "Invalid email." });
      return;
    }

    if (!supportedStocks[ticker]) {
      callback?.({
        success: false,
        error: `Unsupported ticker: ${ticker}.`,
      });
      return;
    }

    const userRecord = getUserRecord(email);
    if (!userRecord || userRecord.socketId !== socket.id) {
      callback?.({ success: false, error: "User is not logged in on this socket." });
      return;
    }

    userRecord.subscriptions.delete(ticker);
    socket.leave(ticker);

    callback?.({
      success: true,
      subscriptions: serializeSubscriptions(userRecord),
      ticker,
    });
  });

  socket.on("user:logout", (payload, callback) => {
    const email = payload?.email;
    if (!isValidEmail(email)) {
      callback?.({ success: false, error: "Invalid email." });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const userRecord = connectedUsers.get(normalizedEmail);

    if (userRecord && userRecord.socketId === socket.id) {
      serializeSubscriptions(userRecord).forEach((ticker) => {
        socket.leave(ticker);
      });
      connectedUsers.delete(normalizedEmail);
      socketToEmail.delete(socket.id);
      callback?.({ success: true });
      return;
    }

    callback?.({ success: false, error: "User is not logged in on this socket." });
  });

  socket.on("disconnect", () => {
    const email = socketToEmail.get(socket.id);
    if (!email) {
      return;
    }

    const userRecord = connectedUsers.get(email);
    if (userRecord && userRecord.socketId === socket.id) {
      connectedUsers.delete(email);
    }

    socketToEmail.delete(socket.id);
  });

  socket.on("chart:history", (payload, callback) => {
    const ticker = payload?.ticker;
    const timeframe = payload?.timeframe || "1D";

    if (!supportedStocks[ticker]) {
      callback?.({ success: false, error: "Invalid ticker." });
      return;
    }

    const history = getHistoryByTimeframe(ticker, timeframe);
    callback?.({
      success: true,
      ticker,
      timeframe,
      history: history.map((candle) => ({
        ...candle,
        date: new Date(candle.timestamp).toLocaleDateString(),
      })),
    });
  });
});

setInterval(() => {
  Object.keys(supportedStocks).forEach((ticker) => {
    const stock = supportedStocks[ticker];

    const movement = (Math.random() - 0.5) * 5;
    stock.basePrice = Math.max(1, stock.basePrice + movement);

    const change = movement;
    const changePercent = (change / stock.basePrice) * 100;

    const update = {
      ticker,
      companyName: stock.companyName,
      price: Number(stock.basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      lastUpdated: new Date().toISOString(),
    };

    io.to(ticker).emit("stock:update", update);
  });
}, 1000);

initializeStockHistory();

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
