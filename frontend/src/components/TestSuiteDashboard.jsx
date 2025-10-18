import React, { useMemo, useState, useEffect } from "react";

/**
 * TestSuiteDashboard.jsx — no sidebar, no Platform column
 * ---------------------------------------
 * Frontend-only, data-driven Test Suite page.
 *
 * ✅ No hardcoded rows – fetches from `/api/tests`.
 * ✅ Search, Status/Platform filters (platform column removed but filter kept), sort, pagination.
 * ✅ Larger fonts for Test Name, Execution Target, Status, and Last Run cells.
 * ✅ Dev-only mock response if `/api/tests` is not available yet.
 */

// -----------------------
// Small utilities
// -----------------------
const classNames = (...xs) => xs.filter(Boolean).join(" ");

const formatLastRun = (value) => {
  if (!value) return "N/A";
  const maybeDate = new Date(value);
  if (!isNaN(maybeDate.getTime())) {
    return maybeDate.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return String(value);
};

const statusChip = (status) => {
  const base = "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm md:text-base font-semibold border";
  if (status === "Passing") return (
    <span className={classNames(base, "bg-green-50 text-green-700 border-green-200")}> <Dot color="#16a34a"/> Passing </span>
  );
  if (status === "Failing") return (
    <span className={classNames(base, "bg-red-50 text-red-700 border-red-200")}> <Dot color="#dc2626"/> Failing </span>
  );
  return (
    <span className={classNames(base, "bg-gray-50 text-gray-700 border-gray-200")}> <Dot color="#6b7280"/> Not Run </span>
  );
};

const deriveCounts = (items = []) => {
  const c = { passing: 0, failing: 0, notRun: 0 };
  for (const it of items) {
    if (it.status === "Passing") c.passing++;
    else if (it.status === "Failing") c.failing++;
    else c.notRun++;
  }
  return c;
};

// -----------------------
// Data fetching (with graceful mock fallback for dev)
// -----------------------
const fetchJSON = async (url, { signal } = {}) => {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("non-200");
    return await res.json();
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      return mockResponse(url);
    }
    throw e;
  }
};

function buildQuery({ page, perPage, search, platform, status, sort }) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (perPage) params.set("perPage", String(perPage));
  if (search) params.set("search", search);
  if (platform && platform !== "All") params.set("platform", platform);
  if (status && status !== "All") params.set("status", status);
  if (sort) params.set("sort", sort); // e.g., "name.asc" or "lastRun.desc"
  return `/api/tests?${params.toString()}`;
}

function useTestsQuery(q) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchJSON(buildQuery(q), { signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => setState({ data: null, error, loading: false }));
    return () => controller.abort();
  }, [q.page, q.perPage, q.search, q.platform, q.status, q.sort]);
  return state;
}

// -----------------------
// Page component
// -----------------------
export default function TestSuiteDashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState("lastRun.desc");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, error, loading } = useTestsQuery({
    page,
    perPage,
    search: debouncedSearch,
    platform,
    status,
    sort,
  });

  const totals = useMemo(() => {
    const total = data?.total ?? 0;
    const counts = data?.counts ?? deriveCounts(data?.items);
    return { total, ...counts };
  }, [data]);

  const rows = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / perPage));

  const clearFilters = () => {
    setSearch("");
    setPlatform("All");
    setStatus("All");
    setSort("lastRun.desc");
    setPage(1);
  };

  const onSort = (col) => {
    const [curCol, curDir = "asc"] = String(sort || "").split(".");
    const nextDir = curCol === col && curDir === "asc" ? "desc" : "asc";
    setSort(`${col}.${nextDir}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-10 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <span className="text-white text-xl">🧪</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Test Suite</h1>
              <p className="text-gray-600">Manage and monitor your test cases</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="hidden md:block px-3 py-2 rounded-lg border border-gray-300 text-sm"
              title="Rows per page"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
            <button
              type="button"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 md:px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 shadow"
              onClick={() => alert("Hook this to your create-test flow (modal or route).")}
            >
              <span className="hidden sm:inline">Create New Test</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="bg-white border-b border-gray-200 px-6 md:px-10 py-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="h-5 w-5"/>
            </span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tests…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg border border-gray-300"
          >
            {['All','Web','iOS','Android'].map((p) => <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>)}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg border border-gray-300"
          >
            {['All','Passing','Failing','Not Run'].map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>

          <button
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={clearFilters}
            title="Clear filters"
          >
            Clear
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-10 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Tests" value={totals.total} tone="blue" icon={<Pencil/>}/>
          <StatCard label="Passing" value={totals.passing} tone="green" icon={<Check/>}/>
          <StatCard label="Failing" value={totals.failing} tone="red" icon={<X/>}/>
          <StatCard label="Not Run" value={totals.notRun} tone="gray" icon={<Clock/>}/>
        </div>
      </section>

      {/* Table */}
      <section className="px-6 md:px-10 pb-10">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-gray-600">
                  <Th onClick={() => onSort('name')} active={sort.startsWith('name')}>Test Name</Th>
                  {/* Platform column removed */}
                  <Th onClick={() => onSort('executionTarget')} active={sort.startsWith('executionTarget')}>Execution Target</Th>
                  <Th onClick={() => onSort('status')} active={sort.startsWith('status')}>Status</Th>
                  <Th onClick={() => onSort('lastRun')} active={sort.startsWith('lastRun')}>Last Run</Th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && <RowsSkeleton/>}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No tests found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}

                {!loading && rows.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900 text-lg md:text-xl max-w-[480px] truncate" title={t.name}>{t.name}</td>
                    {/* Platform cell removed */}
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-base md:text-lg max-w-[560px] truncate" title={t.executionTarget || t.testUrl}>
                      {t.executionTarget || t.testUrl || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusChip(t.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-base md:text-lg">{formatLastRun(t.lastRun)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <IconButton title="Edit" onClick={() => alert(`Edit ${t.name}`)}><Wrench/></IconButton>
                        <IconButton title="Run" onClick={() => alert(`Run ${t.name}`)}><Play/></IconButton>
                        <IconButton title="Settings" onClick={() => alert(`Settings for ${t.name}`)}><Gear/></IconButton>
                        <IconButton title="More" onClick={() => alert(`More for ${t.name}`)}><Dots/></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <div>
              {data ? (
                <span>{Math.min((page-1)*perPage + 1, data.total)}–{Math.min(page*perPage, data.total)} of {data.total} matches</span>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p-1))}
                disabled={page <= 1}
              >Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p+1))}
                disabled={page >= totalPages}
              >Next</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// -----------------------
// Presentational subcomponents
// -----------------------
function StatCard({ label, value, tone = "gray", icon }) {
  const tones = {
    blue: { bg: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-700" },
    green: { bg: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-700" },
    red: { bg: "from-red-50 to-red-100", border: "border-red-200", text: "text-red-700" },
    gray: { bg: "from-gray-50 to-gray-100", border: "border-gray-200", text: "text-gray-700" },
  }[tone];
  return (
    <div className={classNames("rounded-xl p-5 border bg-gradient-to-br", tones.bg, tones.border)}>
      <div className="flex items-center justify-between">
        <div>
          <div className={classNames("text-3xl font-bold", tones.text)}>{value ?? "—"}</div>
          <div className={classNames("mt-0.5 font-medium", tones.text)}>{label}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
          <span className="text-gray-700">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function Th({ children, onClick, active }) {
  return (
    <th
      role="button"
      onClick={onClick}
      className={classNames(
        "px-4 py-3 font-semibold select-none",
        active ? "text-gray-900" : "text-gray-600",
        "hover:text-gray-900 cursor-pointer"
      )}
    >
      <div className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        <ArrowUpDown className="h-3.5 w-3.5"/>
      </div>
    </th>
  );
}

function IconButton({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 hover:text-gray-700"
    >
      <span className="inline-block align-middle">{children}</span>
    </button>
  );
}

function RowsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3.5 bg-gray-200 rounded"/>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// -----------------------
// Tiny inline icons (no external deps)
// -----------------------
function Dot({ color = "#6b7280" }) {
  return <span style={{ backgroundColor: color }} className="inline-block h-2.5 w-2.5 rounded-full"/>;
}
const Search = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const Pencil = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);
const Check = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M20 6 9 17l-5-5"/></svg>
);
const X = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>
);
const Clock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);
const ArrowUpDown = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="m3 9 4-4 4 4"/><path d="M7 5v14"/><path d="m21 15-4 4-4-4"/><path d="M17 19V5"/></svg>
);
const Wrench = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M10.4 10.4a5 5 0 1 1 3.2 3.2L6 21H3v-3l7.4-7.6Z"/></svg>
);
const Play = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8 5v14l11-7z"/></svg>
);
const Gear = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V22a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 20l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 6.2 4l.1.1a1.7 1.7 0 0 0 1.9.3H8a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 6l-.1.1a1.7 1.7 0 0 0-.3 1.9V8c0 .7.4 1.3 1.1 1.5.3.1.6.2.9.2a2 2 0 1 1 0 4 2 2 0 0 1-.9-.2c-.7-.2-1.1.5-1.1 1.2Z"/></svg>
);
const Dots = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
);

// -----------------------
// Development mock (used *only* when fetch to /api/tests fails in non-prod)
// -----------------------
function mockResponse(url) {
  const u = new URL(url, "http://localhost");
  const page = Number(u.searchParams.get("page") || 1);
  const perPage = Number(u.searchParams.get("perPage") || 10);
  const search = (u.searchParams.get("search") || "").toLowerCase();
  const platform = u.searchParams.get("platform") || "All";
  const status = u.searchParams.get("status") || "All";
  const sort = u.searchParams.get("sort") || "lastRun.desc";

  const seed = [
    { id: 1, name: "Sauce Web - Benchmark", platform: "Web", executionTarget: "https://www.saucedemo.com/", status: "Not Run", lastRun: null },
    { id: 2, name: "Zillow iOS - Benchmark (HARD)", platform: "iOS", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 3, name: "Chris' Test Conditionals", platform: "iOS", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 4, name: "Chris' Test Case (No Error Cod…)", platform: "Web", executionTarget: "https://anamhira.ca/", status: "Failing", lastRun: new Date(Date.now() - 1000*60*60*24).toISOString() },
    { id: 5, name: "AndroidWorld Test", platform: "Android", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 6, name: "GOAT Regression", platform: "iOS", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 7, name: "Test 2 - Sign In - fub", platform: "Android", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 8, name: "Test 2 - Sign In + lead details", platform: "Android", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 9, name: "Note Taking App Record (cachi…)", platform: "Android", executionTarget: "Auto-detected", status: "Not Run", lastRun: null },
    { id: 10, name: "Sauce Web Sanity", platform: "Web", executionTarget: "https://example.com", status: "Passing", lastRun: new Date().toISOString() },
    { id: 11, name: "Payments Flow", platform: "Web", executionTarget: "https://pay.example.com", status: "Failing", lastRun: new Date(Date.now() - 1000*60*90).toISOString() },
  ];

  let items = seed.filter((r) =>
    (!search || r.name.toLowerCase().includes(search)) &&
    (platform === "All" || r.platform === platform) &&
    (status === "All" || r.status === status)
  );

  const [col, dir] = sort.split(".");
  items.sort((a,b) => {
    const va = (a[col] ?? "");
    const vb = (b[col] ?? "");
    if (va === vb) return 0;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return dir === "asc" ? -1 : 1;
  });

  const total = items.length;
  const start = (page - 1) * perPage;
  const paged = items.slice(start, start + perPage);

  const counts = deriveCounts(seed);

  return { items: paged, page, perPage, total, counts };
}
