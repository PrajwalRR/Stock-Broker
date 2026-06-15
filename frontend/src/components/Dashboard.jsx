import ConnectionStatus from "./ConnectionStatus";
import StockSubscriptionPanel from "./StockSubscriptionPanel";
import StockCard from "./StockCard";

function Dashboard({
  email,
  connected,
  subscriptions,
  stocks,
  toast,
  onSubscribe,
  onUnsubscribe,
  onLogout,
  isDark,
  onThemeToggle,
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 pb-10 pt-4 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Stock Broker Dashboard</p>
          <h1 className="text-lg font-black text-slate-900 sm:text-xl dark:text-white">Welcome, {email}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Live market simulation for presentation demos</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ConnectionStatus connected={connected} isDark={isDark} />
          <button
            type="button"
            onClick={onThemeToggle}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm leading-relaxed text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
        <p className="font-semibold">Demo helper</p>
        <p>
          Open this app in two browser windows. Example: Alice subscribes to GOOG/TSLA and Bob subscribes to
          NVDA/META. Each dashboard updates independently every second.
        </p>
      </div>

      {toast ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {toast}
        </div>
      ) : null}

      <StockSubscriptionPanel subscriptions={subscriptions} onSubscribe={onSubscribe} isDark={isDark} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Subscriptions</h2>

        {subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            No stocks subscribed yet. Choose one or more tickers to start receiving updates.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {subscriptions
              .filter((ticker) => stocks[ticker])
              .map((ticker) => (
                <StockCard key={ticker} data={stocks[ticker]} onUnsubscribe={onUnsubscribe} isDark={isDark} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
