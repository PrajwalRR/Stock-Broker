import { SUPPORTED_STOCKS, SUPPORTED_TICKERS } from "../utils/constants";

function StockSubscriptionPanel({ subscriptions, onSubscribe, isDark }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${isDark ? "dark:border-slate-700 dark:bg-slate-800" : ""}`}>
      <h2 className={`text-lg font-bold text-slate-900 ${isDark ? "dark:text-white" : ""}`}>Subscribe to Stocks</h2>
      <p className={`mt-1 text-sm text-slate-600 ${isDark ? "dark:text-slate-400" : ""}`}>Supported tickers: GOOG, TSLA, AMZN, META, NVDA</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SUPPORTED_TICKERS.map((ticker) => {
          const subscribed = subscriptions.includes(ticker);

          return (
            <div key={ticker} className={`rounded-xl border border-slate-200 p-3 ${isDark ? "dark:border-slate-700 dark:bg-slate-700/50" : ""}`}>
              <p className={`text-base font-bold text-slate-900 ${isDark ? "dark:text-white" : ""}`}>{ticker}</p>
              <p className={`text-xs text-slate-500 ${isDark ? "dark:text-slate-400" : ""}`}>{SUPPORTED_STOCKS[ticker]}</p>
              <button
                type="button"
                disabled={subscribed}
                onClick={() => onSubscribe(ticker)}
                className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  subscribed
                    ? `cursor-not-allowed bg-slate-200 text-slate-500 ${isDark ? "dark:bg-slate-700 dark:text-slate-400" : ""}`
                    : `bg-brand-500 text-white hover:bg-brand-600 ${isDark ? "dark:bg-brand-600 dark:hover:bg-brand-700" : ""}`
                }`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default StockSubscriptionPanel;
