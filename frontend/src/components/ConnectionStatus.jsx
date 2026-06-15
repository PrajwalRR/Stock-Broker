function ConnectionStatus({ connected, isDark }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm ${isDark ? "dark:border-slate-700 dark:bg-slate-800" : ""}`}>
      <span
        className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`}
      />
      <span className={`font-semibold text-slate-700 ${isDark ? "dark:text-slate-300" : ""}`}>
        {connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

export default ConnectionStatus;
