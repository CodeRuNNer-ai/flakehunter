import { useEffect, useMemo, useState } from 'react';
import { fetchFlakyTests, syncRepo } from './api';
import Toolbar from './components/Toolbar';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import TestTable from './components/TestTable';

const DEFAULT_REPO = 'CodeRuNNer-ai/flaky-demo';
const VERDICT_RANK = { FLAKY: 0, BROKEN: 1, INCONCLUSIVE: 2, STABLE: 3 };

export default function App() {
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [rerunInput, setRerunInput] = useState('10');
  const [query, setQuery] = useState({ repo: DEFAULT_REPO, rerun: 10 });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState({ key: 'verdict', dir: 'asc' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchFlakyTests(query.repo, query.rerun)
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((e) => { if (!cancelled) setError(e.message || 'Could not load data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);

  function handleLoad(e) {
    if (e) e.preventDefault();
    setNotice('');
    setQuery({ repo: repoInput.trim(), rerun: Number(rerunInput) || 0 });
  }

  async function handleSync() {
    setSyncing(true);
    setError('');
    setNotice('');
    try {
      const result = await syncRepo(repoInput.trim());
      const n = result && result.imported !== undefined ? result.imported : 0;
      setNotice(`Synced from GitHub: ${n} new test results imported.`);
      setQuery({ repo: repoInput.trim(), rerun: Number(rerunInput) || 0 });
    } catch (e) {
      setError(e.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  function handleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  const counts = useMemo(() => {
    const c = { ALL: rows.length, FLAKY: 0, BROKEN: 0, STABLE: 0, INCONCLUSIVE: 0 };
    rows.forEach((r) => { c[r.verdict] = (c[r.verdict] || 0) + 1; });
    return c;
  }, [rows]);

  const wastedMinutes = useMemo(
    () => rows.reduce((sum, r) => sum + (r.estimatedWastedMinutes || 0), 0),
    [rows]
  );

  const visibleRows = useMemo(() => {
    const filtered = filter === 'ALL' ? rows : rows.filter((r) => r.verdict === filter);
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === 'verdict') return dir * ((VERDICT_RANK[a.verdict] ?? 9) - (VERDICT_RANK[b.verdict] ?? 9));
      if (sort.key === 'testName') return dir * a.testName.localeCompare(b.testName);
      return dir * ((a[sort.key] || 0) - (b[sort.key] || 0));
    });
  }, [rows, filter, sort]);

  return (
    <div className="page">
      <header className="header">
        <h1>FlakeHunter</h1>
        <p className="subtitle">Find the tests you cannot trust.</p>
      </header>

      <Toolbar
        repoInput={repoInput}
        setRepoInput={setRepoInput}
        rerunInput={rerunInput}
        setRerunInput={setRerunInput}
        onLoad={handleLoad}
        onSync={handleSync}
        loading={loading}
        syncing={syncing}
        filter={filter}
        setFilter={setFilter}
        counts={counts}
      />

      {error && <div className="banner banner-error">{error}</div>}
      {notice && <div className="banner banner-ok">{notice}</div>}

      {loading && rows.length === 0 ? (
        <p className="state">Loading…</p>
      ) : rows.length === 0 && !error ? (
        <p className="state">No test results yet. Click "Sync from GitHub".</p>
      ) : (
        <>
          <SummaryCards counts={counts} wastedMinutes={wastedMinutes} />
          <Charts rows={rows} />
          <TestTable rows={visibleRows} sort={sort} onSort={handleSort} />
        </>
      )}
    </div>
  );
}