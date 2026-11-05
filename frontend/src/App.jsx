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
  const [sort, setSort] = useState({ key: 'verdict', dir: 'asc' })

  const load = useCallback(async (target) => {
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchFlakyTests(target))
    } catch (e) {
      setRows([])
      setError(e.message)
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
      /* storage unavailable, ignore */
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
      setNotice(`Sync finished: ${result.imported} new test results imported.`)
      await load(repo)
    } catch (e) {
      setError(`Sync failed: ${e.message}`)
    } finally {
      setSyncing(false)
    }
  }

  function toggleSort(key) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
  }

  const counts = useMemo(() => {
    const c = { ALL: rows.length, FLAKY: 0, BROKEN: 0, STABLE: 0, INCONCLUSIVE: 0 }
    rows.forEach((r) => {
      c[r.verdict] = (c[r.verdict] || 0) + 1
    })
    return c
  }, [rows])

  const visible = useMemo(() => {
    const list = filter === 'ALL' ? rows : rows.filter((r) => r.verdict === filter)
    const sign = sort.dir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      let diff
      if (sort.key === 'verdict') {
        diff = VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict]
        if (diff === 0) diff = b.failureRatePercent - a.failureRatePercent
      } else if (sort.key === 'testName') {
        diff = a.testName.localeCompare(b.testName)
      } else {
        diff = a[sort.key] - b[sort.key]
      }
      return diff * sign
    })
  }, [rows, filter, sort])

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>FlakeHunter</h1>
          <p className="subtitle">Find the tests you cannot trust.</p>
        </div>
      </header>

      <Toolbar
        repoInput={repoInput}
        onRepoInput={setRepoInput}
        onSubmit={submitRepo}
        onSync={handleSync}
        syncing={syncing}
        filter={filter}
        onFilter={setFilter}
        counts={counts}
      />

      {notice && <div className="banner banner-ok">{notice}</div>}
      {error && <div className="banner banner-error">{error}</div>}

      <SummaryCards counts={counts} />

      {loading ? (
        <p className="state">Loading test results...</p>
      ) : (
        <TestTable rows={visible} sort={sort} onSort={toggleSort} totalRows={rows.length} />
      )}
    </div>
  )
}