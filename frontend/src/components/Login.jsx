import { useState } from "react";

const HERO_STOCKS = [
  { symbol: "GOOG", name: "Alphabet", price: 178.42, change: +1.23, pts: [30,38,28,42,36,50,44,58,52,62,56] },
  { symbol: "TSLA", name: "Tesla",    price: 248.67, change: -3.45, pts: [60,52,58,44,50,38,44,32,40,28,35] },
  { symbol: "AMZN", name: "Amazon",   price: 189.23, change: +2.11, pts: [28,34,30,40,36,44,40,50,48,56,60] },
  { symbol: "META", name: "Meta",     price: 512.89, change: +5.67, pts: [20,30,26,38,34,46,42,54,50,60,65] },
  { symbol: "NVDA", name: "NVIDIA",   price: 118.45, change: -1.23, pts: [55,48,52,42,46,36,40,30,34,26,28] },
];

function Sparkline({ pts, color }) {
  const W = 80; const H = 32;
  const mn = Math.min(...pts); const mx = Math.max(...pts);
  const range = mx - mn || 1;
  const d = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p - mn) / range) * (H - 4) - 2;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const area = d + ` L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={d} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Login({ onLogin, isDark, loginError }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(trimmed); }, 500);
  };

  const displayError = error || loginError;

  return (
    <div className="flex min-h-[100dvh] w-full overflow-x-hidden">

      {/* ── LEFT HERO PANEL ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:flex lg:w-[58%]">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white">StockBroker</p>
              <p className="text-[11px] text-slate-500">Professional Trading Platform</p>
            </div>
          </div>
          {/* Live badge — top-right of brand row */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live market data
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white">
            Trade Smarter.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#60a5fa,#22d3ee)" }}
            >
              React Faster.
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Subscribe to GOOG, TSLA, AMZN, META & NVDA. Prices update
            every second with real-time WebSocket push.
          </p>

          {/* Stock cards grid */}
          <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-3">
            {HERO_STOCKS.map((s) => {
              const up = s.change >= 0;
              const color = up ? "#4ade80" : "#f87171";
              const bgColor = up ? "rgba(74,222,128,0.09)" : "rgba(248,113,113,0.09)";
              const borderColor = up ? "rgba(74,222,128,0.18)" : "rgba(248,113,113,0.15)";
              return (
                <div
                  key={s.symbol}
                  className="group rounded-2xl p-3.5 backdrop-blur-sm transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.14)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-extrabold tracking-widest text-slate-200">{s.symbol}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.name}</p>
                    </div>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ color, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
                    >
                      {up ? "+" : ""}{s.change.toFixed(2)}%
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-black text-white">${s.price.toFixed(2)}</p>
                  <div className="mt-2.5">
                    <Sparkline pts={s.pts} color={color} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {[
            { icon: "⚡", label: "1-second updates" },
            { icon: "📊", label: "OHLC candlesticks" },
            { icon: "🔒", label: "Session isolation" },
            { icon: "🌓", label: "Dark / light mode" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-400"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <span className="text-[13px]">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div
        className="flex flex-1 flex-col items-stretch justify-start overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:justify-center lg:px-8 lg:py-12"
        style={{
          background: isDark
            ? "#0d1117"
            : "#ffffff",
        }}
      >
        {/* Mobile brand */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            </svg>
          </div>
          <span className={`text-lg font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>StockBroker</span>
        </div>

        <div className="w-full animate-fadeInUp lg:max-w-sm">
          {/* Heading */}
          <div className="mb-6 rounded-3xl border border-white/5 bg-white/[0.02] p-4 shadow-2xl shadow-black/20 sm:mb-8 sm:p-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl sm:mb-5"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)", boxShadow: "0 6px 20px rgba(29,78,216,0.4)" }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h2 className={`text-[1.75rem] font-black tracking-tight leading-tight sm:text-[2rem] ${isDark ? "text-white" : "text-gray-900"}`}>
              Welcome back
            </h2>
            <p className={`mt-2 text-[13px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Sign in to your trading dashboard
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label
                htmlFor="email"
                className={`mb-2 block text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Email address
              </label>
              <div
                className="relative rounded-xl transition-all duration-200"
                style={{
                  border: `1.5px solid ${
                    focused ? "#3b82f6" : isDark ? "#1f2937" : "#d1d5db"
                  }`,
                  boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
                  background: isDark ? "#111827" : "#f9fafb",
                }}
              >
                <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={focused ? "#3b82f6" : "#94a3b8"} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="alice@example.com"
                  className={`w-full bg-transparent py-3.5 pl-10 pr-4 text-[14px] outline-none ${
                    isDark ? "text-white placeholder-slate-600" : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {displayError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-1 w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-xl active:scale-[0.99] disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#0ea5e9 100%)",
                boxShadow: "0 4px 18px rgba(29,78,216,0.45)",
              }}
            >
              <span className={`flex items-center justify-center gap-2 transition-all duration-200 ${loading ? "opacity-0 translate-y-6" : ""}`}>
                Access Dashboard
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Feature tiles */}
          <div className="mt-6 grid grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-3">
            {[
              { icon: "⚡", label: "Live prices", sub: "1-sec push" },
              { icon: "📈", label: "OHLC charts", sub: "4 timeframes" },
              { icon: "🌐", label: "Multi-user", sub: "WebSocket" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl p-3 text-center transition-colors"
                style={{
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
                  background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb",
                }}
              >
                <p className="text-lg">{f.icon}</p>
                <p className={`mt-1 text-[11px] font-semibold ${isDark ? "text-slate-300" : "text-gray-700"}`}>{f.label}</p>
                <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-gray-400"}`}>{f.sub}</p>
              </div>
            ))}
          </div>

          {/* Demo tip */}
          <div
            className="mt-3 rounded-xl px-4 py-3 text-[12px] leading-relaxed sm:mt-4"
            style={{
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
              background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb",
              color: isDark ? "#6b7280" : "#9ca3af",
            }}
          >
            <span style={{ color: isDark ? "#94a3b8" : "#6b7280", fontWeight: 600 }}>Demo tip: </span>
            Try{" "}
            <span
              className="cursor-pointer font-semibold hover:underline"
              style={{ color: "#3b82f6" }}
              onClick={() => setEmail("alice@example.com")}
            >
              alice@example.com
            </span>
            {" "}or{" "}
            <span
              className="cursor-pointer font-semibold hover:underline"
              style={{ color: "#3b82f6" }}
              onClick={() => setEmail("bob@example.com")}
            >
              bob@example.com
            </span>
            {" "}for multi-user demo.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
