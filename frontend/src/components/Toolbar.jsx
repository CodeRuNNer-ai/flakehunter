const FILTERS = ['ALL', 'FLAKY', 'BROKEN', 'STABLE', 'INCONCLUSIVE']

export default function Toolbar({
  repoInput, onRepoInput, onSubmit, onSync, syncing, filter, onFilter, counts,
  search, onSearch, repo,
}) {
  return (
    <section className="toolbar-panel" aria-label="Repository controls">
      <form className="repo-form" onSubmit={onSubmit}>
        <label htmlFor="repo">Repository</label>
        <div className="repo-input-wrap">
          <span className="repo-prefix" aria-hidden="true">⌘</span>
          <input
            id="repo"
            value={repoInput}
            onChange={(e) => onRepoInput(e.target.value)}
            placeholder="owner/repository"
            spellCheck={false}
            aria-label="GitHub repository"
          />
        </div>
        <button type="submit" className="button button-primary">Load repository</button>
        <button type="button" className="button button-secondary" onClick={onSync} disabled={syncing || !repo}>
          <span className={syncing ? 'sync-icon is-spinning' : 'sync-icon'} aria-hidden="true">↻</span>
          {syncing ? 'Syncing' : 'Sync from GitHub'}
        </button>
      </form>

      <div className="toolbar-bottom">
        <div className="filters" role="group" aria-label="Filter by verdict">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className={`filter-tab ${filter === value ? 'filter-tab-active' : ''}`}
              onClick={() => onFilter(value)}
              aria-pressed={filter === value}
            >
              {value === 'ALL' ? 'All tests' : value[0] + value.slice(1).toLowerCase()}
              <span className="filter-count">{counts[value] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Find a test…"
            aria-label="Search tests"
          />
          {search && (
            <button type="button" className="clear-search" onClick={() => onSearch('')} aria-label="Clear search">×</button>
          )}
        </label>
      </div>
    </section>
  )
}
