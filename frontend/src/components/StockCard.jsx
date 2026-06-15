import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Customized,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import socket from "../socket";

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function formatVolume(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return String(value);
}

// CandleLayer renders all candles using the real yAxis pixel scale from Recharts internals
function CandleLayer({ data, xAxisMap, yAxisMap }) {
  if (!data || !xAxisMap || !yAxisMap) return null;
  const xAxis = Object.values(xAxisMap)[0];
  const yAxis = Object.values(yAxisMap)[0];
  if (!xAxis || !yAxis) return null;
  const { scale: yScale } = yAxis;
  const { scale: xScaleFn, width: xAxisWidth } = xAxis;
  if (!yScale || !xScaleFn) return null;
  const bandwidth = xScaleFn.bandwidth ? xScaleFn.bandwidth() : (xAxisWidth / Math.max(data.length, 1));

  return (
    <g>
      {data.map((candle, i) => {
        const { open, high, low, close, date } = candle;
        if (open == null || high == null || low == null || close == null) return null;
        const cx = (xScaleFn(date) ?? 0) + bandwidth / 2;
        const isUp = close >= open;
        const color = isUp ? "#16a34a" : "#dc2626";
        const borderColor = isUp ? "#15803d" : "#b91c1c";
        const yHigh = yScale(high);
        const yLow = yScale(low);
        const yOpen = yScale(open);
        const yClose = yScale(close);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(Math.abs(yOpen - yClose), 1);
        const candleW = Math.max(bandwidth * 0.65, 2);
        return (
          <g key={date ?? i}>
            <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={color} strokeWidth={1} />
            <rect
              x={cx - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={color}
              stroke={borderColor}
              strokeWidth={0.5}
              rx={1}
            />
          </g>
        );
      })}
    </g>
  );
}

function StockCard({ data, onUnsubscribe, isDark }) {
  const [timeframe, setTimeframe] = useState("1D");
  const [chartMode, setChartMode] = useState("area");
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [liveHistory, setLiveHistory] = useState([]);

  // Fetch historical candles for 1W/1M/1Y
  useEffect(() => {
    if (!data?.ticker) return;
    if (timeframe === "1D") {
      setHistoryLoaded(true);
      return;
    }
    setHistoryLoaded(false);
    socket.emit("chart:history", { ticker: data.ticker, timeframe }, (response) => {
      if (response?.success) {
        const raw = response.history || [];
        const labeled = raw.map((c) => ({
          ...c,
          date: new Date(c.timestamp).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
        }));
        setHistory(labeled);
        setHistoryLoaded(true);
      }
    });
  }, [timeframe, data?.ticker]);

  // Accumulate live ticks into liveHistory for 1D area chart
  useEffect(() => {
    if (!data?.ticker || !data?.price || !data?.lastUpdated) return;
    if (isPaused) return;
    const point = {
      close: data.price,
      open: data.price,
      high: data.price,
      low: data.price,
      date: new Date(data.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setLiveHistory((prev) => {
      const next = [...prev, point];
      return next.length > 180 ? next.slice(next.length - 180) : next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.lastUpdated, data?.ticker]);

  const effectiveHistory = useMemo(() => {
    if (timeframe === "1D") return liveHistory;
    if (isPaused) return history;
    return history;
  }, [timeframe, liveHistory, history, isPaused]);

  // For 1D chart, force area mode since it displays live data better
  const autoChartMode = timeframe === "1D" ? "area" : chartMode;

  const open = effectiveHistory.length > 0 ? effectiveHistory[0].open : data.price;
  const high = effectiveHistory.length > 0 ? Math.max(...effectiveHistory.map((c) => c.high)) : data.price;
  const low = effectiveHistory.length > 0 ? Math.min(...effectiveHistory.map((c) => c.low)) : data.price;
  const syntheticVolume = Math.round(Math.abs(data.changePercent) * 180000 + 90000);
  const chartMin = Math.min(low, data.price);
  const chartMax = Math.max(high, data.price);
  const chartPadding = Math.max((chartMax - chartMin) * 0.2, 0.8);
  const positive = data.change >= 0;
  const pulseClass = positive ? "animate-pulseUp" : "animate-pulseDown";
  const areaColor = positive ? "#16a34a" : "#dc2626";
  const actionButtonClass = positive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200";

  const gridColor = isDark ? "#334155" : "#dbe2ea";
  const labelColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${pulseClass} ${isDark ? "dark:border-slate-700 dark:bg-slate-800" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-lg font-extrabold text-slate-900 ${isDark ? "dark:text-white" : ""}`}>{data.ticker}</h3>
          <p className={`text-sm text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>{data.companyName}</p>
        </div>
        <button
          type="button"
          onClick={() => onUnsubscribe(data.ticker)}
          className={`rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 ${isDark ? "dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" : ""}`}
        >
          Unsubscribe
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className={`text-3xl font-black tracking-tight text-slate-900 ${isDark ? "dark:text-white" : ""}`}>
            {formatMoney(data.price)}
          </p>
          <p className={`text-sm font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {positive ? "+" : ""}
            {data.change.toFixed(2)} ({positive ? "+" : ""}
            {data.changePercent.toFixed(2)}%)
          </p>
        </div>
        <p className={`text-xs text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>
          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      </div>

      <div
        className={`mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs sm:grid-cols-4 ${isDark ? "dark:border-slate-700 dark:bg-slate-700/30" : ""}`}
      >
        <div>
          <p className={`text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>Open</p>
          <p className={`font-semibold text-slate-800 ${isDark ? "dark:text-slate-200" : ""}`}>{formatMoney(open)}</p>
        </div>
        <div>
          <p className={`text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>High</p>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">{formatMoney(high)}</p>
        </div>
        <div>
          <p className={`text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>Low</p>
          <p className="font-semibold text-red-700 dark:text-red-400">{formatMoney(low)}</p>
        </div>
        <div>
          <p className={`text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>Volume</p>
          <p className={`font-semibold text-slate-800 ${isDark ? "dark:text-slate-200" : ""}`}>{formatVolume(syntheticVolume)}</p>
        </div>
      </div>

      <div
        className={`mt-3 h-56 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 sm:h-48 ${isDark ? "dark:border-slate-700 dark:bg-slate-700/50" : ""}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className={`inline-flex rounded-md border border-slate-300 bg-white p-0.5 ${isDark ? "dark:border-slate-600 dark:bg-slate-800" : ""}`}>
            {["1D", "1W", "1M", "1Y"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded px-2 py-1 font-semibold transition ${
                  timeframe === tf
                    ? `bg-slate-900 text-white ${isDark ? "dark:bg-blue-600" : ""}`
                    : `text-slate-600 hover:bg-slate-100 ${isDark ? "dark:text-slate-400 dark:hover:bg-slate-700" : ""}`
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {timeframe !== "1D" && (
            <div className={`inline-flex rounded-md border border-slate-300 bg-white p-0.5 ${isDark ? "dark:border-slate-600 dark:bg-slate-800" : ""}`}>
              {[
                { key: "area", label: "Area" },
                { key: "candle", label: "Candle" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setChartMode(mode.key)}
                  className={`rounded px-2 py-1 font-semibold transition ${
                    chartMode === mode.key
                      ? `bg-slate-900 text-white ${isDark ? "dark:bg-blue-600" : ""}`
                      : `text-slate-600 hover:bg-slate-100 ${isDark ? "dark:text-slate-400 dark:hover:bg-slate-700" : ""}`
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className={`rounded-md border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 ${isDark ? "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" : ""}`}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>

        {!historyLoaded ? (
          <div className={`flex h-full items-center justify-center text-sm text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>
            Loading chart data...
          </div>
        ) : effectiveHistory.length === 0 ? (
          <div className={`flex h-full items-center justify-center text-sm text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>
            No data for this timeframe
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {autoChartMode === "candle" ? (
              <ComposedChart data={effectiveHistory} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: labelColor }}
                  interval={Math.max(0, Math.floor(effectiveHistory.length / 6) - 1)}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  domain={[chartMin - chartPadding, chartMax + chartPadding]}
                  width={52}
                  tick={{ fontSize: 10, fill: labelColor }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    if (!d) return null;
                    return (
                      <div style={{
                        borderRadius: 8,
                        border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        color: isDark ? "#e2e8f0" : "#0f172a",
                        padding: "6px 10px",
                        fontSize: 11,
                        lineHeight: 1.7,
                        minWidth: 100,
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
                        <div>O: {formatMoney(d.open)}</div>
                        <div style={{ color: "#16a34a" }}>H: {formatMoney(d.high)}</div>
                        <div style={{ color: "#dc2626" }}>L: {formatMoney(d.low)}</div>
                        <div>C: {formatMoney(d.close)}</div>
                      </div>
                    );
                  }}
                />
                {/* Transparent bar to give xScale a proper bandwidth */}
                <Bar dataKey="close" fill="transparent" isAnimationActive={false} />
                <Customized component={(props) => <CandleLayer data={effectiveHistory} {...props} />} />
              </ComposedChart>
            ) : (
              <AreaChart data={effectiveHistory} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id={`stockGradient-${data.ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={areaColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={areaColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: labelColor }}
                  interval={Math.max(0, Math.floor(effectiveHistory.length / 5) - 1)}
                />
                <YAxis hide domain={[chartMin - chartPadding, chartMax + chartPadding]} />
                <Tooltip
                  formatter={(val) => formatMoney(val)}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    color: isDark ? "#e2e8f0" : "#000000",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={areaColor}
                  strokeWidth={2}
                  fill={`url(#stockGradient-${data.ticker})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-xs">
        <button type="button" className={`rounded-md border px-3 py-1.5 font-semibold transition ${actionButtonClass}`}>
          Buy
        </button>
        <button
          type="button"
          className={`rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 ${isDark ? "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" : ""}`}
        >
          Sell
        </button>
      </div>
    </article>
  );
}

export default StockCard;
