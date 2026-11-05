const FILTERS = ['ALL', 'FLAKY', 'BROKEN', 'STABLE', 'INCONCLUSIVE']

export default function Toolbar({
  repoInput, onRepoInput, onSubmit, onSync, syncing, filter, onFilter, counts,
}) {
  return (
    <section className="toolbar">
      <form className="repo-form" onSubmit={onSubmit}>
        <label htmlFor="repo">Repository</label>
        <input
          id="repo"
          value={repoInput}
          onChange={(e) => onRepoInput(e.target.value)}
          placeholder="owner/repo"
          spellCheck={false}
        />
        <button type="submit">Load</button>
        <button type="button" className="secondary" onClick={onSync} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Sync from GitHub'}
        </button>
      </form>

      <div className="filters" role="group" aria-label="Filter by verdict">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip ${filter === f ? 'chip-active' : ''}`}
            onClick={() => onFilter(f)}
          >
            {f === 'ALL' ? 'All' : f[0] + f.slice(1).toLowerCase()} ({counts[f] ?? 0})
          </button>
        ))}
      </div>
    </section>
  )
}