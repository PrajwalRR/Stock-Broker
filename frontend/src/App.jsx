import { useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import socket from "./socket";
import { SUPPORTED_TICKERS, USER_STORAGE_KEY } from "./utils/constants";

function App() {
  const [userEmail, setUserEmail] = useState(() => sessionStorage.getItem(USER_STORAGE_KEY) || "");
  const [connected, setConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stocks, setStocks] = useState({});
  const [toast, setToast] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("stock-dashboard-theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onUpdate = (update) => {
      setStocks((prev) => {
        const prevHistory = prev[update.ticker]?.history || [];
        const nextHistory = [...prevHistory, update.price].slice(-180);

        return {
          ...prev,
          [update.ticker]: {
            ...update,
            history: nextHistory,
          },
        };
      });
    };

    const onForcedLogout = (payload) => {
      setToast(payload?.reason || "Logged out.");
      sessionStorage.removeItem(USER_STORAGE_KEY);
      setUserEmail("");
      setSubscriptions([]);
      setStocks({});
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("stock:update", onUpdate);
    socket.on("user:logout", onForcedLogout);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("stock:update", onUpdate);
      socket.off("user:logout", onForcedLogout);
    };
  }, []);

  useEffect(() => {
    if (!userEmail || !connected) {
      return;
    }

    socket.emit("user:login", { email: userEmail }, (response) => {
      if (!response?.success) {
        setLoginError(response?.error || "Login failed.");
        sessionStorage.removeItem(USER_STORAGE_KEY);
        setUserEmail("");
        return;
      }

      setLoginError("");
      setSubscriptions(response.subscriptions || []);
    });
  }, [userEmail, connected]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const canShowDashboard = useMemo(() => Boolean(userEmail), [userEmail]);

  const handleLogin = (email) => {
    if (!SUPPORTED_TICKERS.length) {
      return;
    }

    sessionStorage.setItem(USER_STORAGE_KEY, email);
    setUserEmail(email);
  };

  const handleSubscribe = (ticker) => {
    if (!SUPPORTED_TICKERS.includes(ticker)) {
      setToast(`Unsupported ticker: ${ticker}`);
      return;
    }

    socket.emit("stock:subscribe", { email: userEmail, ticker }, (response) => {
      if (!response?.success) {
        setToast(response?.error || "Could not subscribe.");
        return;
      }

      setSubscriptions(response.subscriptions || []);
      setToast(`Subscribed to ${ticker}`);
    });
  };

  const handleUnsubscribe = (ticker) => {
    socket.emit("stock:unsubscribe", { email: userEmail, ticker }, (response) => {
      if (!response?.success) {
        setToast(response?.error || "Could not unsubscribe.");
        return;
      }

      setSubscriptions(response.subscriptions || []);
      setStocks((prev) => {
        const next = { ...prev };
        delete next[ticker];
        return next;
      });
      setToast(`Unsubscribed from ${ticker}`);
    });
  };

  const handleLogout = () => {
    socket.emit("user:logout", { email: userEmail }, () => {
      sessionStorage.removeItem(USER_STORAGE_KEY);
      setUserEmail("");
      setSubscriptions([]);
      setStocks({});
      setToast("Logged out successfully.");
    });
  };

  const handleThemeToggle = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("stock-dashboard-theme", newTheme ? "dark" : "light");
  };

  return (
    <div className={isDark ? "dark" : ""}>
      {!canShowDashboard ? (
        <div className="min-h-[100dvh] bg-white dark:bg-slate-950">
          <Login onLogin={handleLogin} isDark={isDark} loginError={loginError} />
        </div>
      ) : (
        <div className="min-h-screen bg-white dark:bg-slate-950">
          <div className="absolute inset-0 -z-0 bg-gradient-to-b from-blue-50/20 via-transparent to-transparent dark:from-blue-950/20" />
          <div className="relative z-10 min-h-screen py-8">
            <Dashboard
              email={userEmail}
              connected={connected}
              subscriptions={subscriptions}
              stocks={stocks}
              toast={toast}
              onSubscribe={handleSubscribe}
              onUnsubscribe={handleUnsubscribe}
              onLogout={handleLogout}
              isDark={isDark}
              onThemeToggle={handleThemeToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
