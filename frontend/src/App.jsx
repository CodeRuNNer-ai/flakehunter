import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchFlakyTests, syncRepo } from './api'
import SummaryCards from './components/SummaryCards'
import Toolbar from './components/Toolbar'
import TestTable from './components/TestTable'

const DEFAULT_REPO = 'CodeRuNNer-ai/flaky-demo'
const VERDICT_RANK = { FLAKY: 0, BROKEN: 1, INCONCLUSIVE: 2, STABLE: 3 }

function loadSavedRepo() {
  try {
    return localStorage.getItem('flakehunter.repo') || DEFAULT_REPO
  } catch {
    return DEFAULT_REPO
  }
}

export default function App() {
  const [repoInput, setRepoInput] = useState(loadSavedRepo)
  const [repo, setRepo] = useState(loadSavedRepo)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'verdict', dir: 'asc' })

  const load = useCallback(async (target) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFlakyTests(target)
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setRows([])
      setError(e.message || 'Unable to load test results.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(repo)
  }, [repo, load])

  function submitRepo(e) {
    e.preventDefault()
    const next = repoInput.trim()
    if (!next) return
    try {
      localStorage.setItem('flakehunter.repo', next)
    } catch {
      // Storage may be unavailable in private browsing.
    }
    setNotice(null)
    if (next === repo) load(next)
    else setRepo(next)
  }

  async function handleSync() {
    setSyncing(true)
    setNotice(null)
    setError(null)
    try {
      const result = await syncRepo(repo)
      setNotice(`Sync completed. ${result.imported ?? 0} new test results imported.`)
      await load(repo)
    } catch (e) {
      setError(`Sync failed: ${e.message}`)
    } finally {
      setSyncing(false)
    }
  }

  function toggleSort(key) {
    setSort((current) => (
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'testName' ? 'asc' : 'desc' }
    ))
  }

  const counts = useMemo(() => {
    const result = { ALL: rows.length, FLAKY: 0, BROKEN: 0, STABLE: 0, INCONCLUSIVE: 0 }
    rows.forEach((row) => {
      result[row.verdict] = (result[row.verdict] || 0) + 1
    })
    return result
  }, [rows])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      const matchesVerdict = filter === 'ALL' || row.verdict === filter
      const matchesSearch = !query || row.testName?.toLowerCase().includes(query)
      return matchesVerdict && matchesSearch
    })
    const sign = sort.dir === 'asc' ? 1 : -1

    return [...filtered].sort((a, b) => {
      let difference = 0
      if (sort.key === 'verdict') {
        difference = (VERDICT_RANK[a.verdict] ?? 99) - (VERDICT_RANK[b.verdict] ?? 99)
        if (difference === 0) difference = (b.failureRatePercent ?? 0) - (a.failureRatePercent ?? 0)
      } else if (sort.key === 'testName') {
        difference = (a.testName || '').localeCompare(b.testName || '')
      } else {
        difference = (Number(a[sort.key]) || 0) - (Number(b[sort.key]) || 0)
      }
      return difference * sign
    })
  }, [rows, filter, search, sort])

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="FlakeHunter home">
          <span className="brand-mark">F</span>
          <span>FlakeHunter</span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" />
          Test reliability
        </div>
      </header>

      <div className="content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Test reliability</h1>
            <p className="page-description">Find unstable tests before they slow down your team.</p>
          </div>
        </section>

        <Toolbar
          repoInput={repoInput}
          onRepoInput={setRepoInput}
          onSubmit={submitRepo}
          onSync={handleSync}
          syncing={syncing}
          filter={filter}
          onFilter={setFilter}
          counts={counts}
          search={search}
          onSearch={setSearch}
          repo={repo}
        />

        {notice && <div className="banner banner-ok" role="status">{notice}</div>}
        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Overview</h2>
              <p>Current verdicts across the selected repository</p>
            </div>
            <span className="section-meta">{counts.ALL} tracked tests</span>
          </div>
          <SummaryCards counts={counts} />
        </section>

        <section className="section-block tests-section">
          <div className="section-heading">
            <div>
              <h2>Tests</h2>
              <p>Review verdicts, execution counts and failure rates</p>
            </div>
            <span className="section-meta">{loading ? 'Updating…' : `${visible.length} shown`}</span>
          </div>

          {loading ? (
            <div className="loading-panel" aria-label="Loading test results">
              <span className="loading-line loading-wide" />
              <span className="loading-line" />
              <span className="loading-line loading-medium" />
            </div>
          ) : (
            <TestTable
              rows={visible}
              sort={sort}
              onSort={toggleSort}
              totalRows={rows.length}
              search={search}
            />
          )}
        </section>

        <footer className="page-footer">
          <span>FlakeHunter</span>
          <span>Repository: <strong>{repo}</strong></span>
        </footer>
      </div>
    </main>
  )
}
