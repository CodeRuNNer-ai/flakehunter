const CHIPS = [
  ['ALL', 'All'],
  ['FLAKY', 'Flaky'],
  ['BROKEN', 'Broken'],
  ['STABLE', 'Stable'],
  ['INCONCLUSIVE', 'Inconclusive'],
];

export default function Toolbar({
  repoInput, setRepoInput, rerunInput, setRerunInput,
  onLoad, onSync, loading, syncing, filter, setFilter, counts,
}) {
  return (
    <div className="toolbar">
      <form className="repo-form" onSubmit={onLoad}>
        <label htmlFor="repo">Repository</label>
        <input
          id="repo"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          placeholder="owner/repo"
        />
        <label htmlFor="rerun">Rerun cost (min)</label>
        <input
          id="rerun"
          className="rerun-input"
          type="number"
          min="0"
          max="1000"
          value={rerunInput}
          onChange={(e) => setRerunInput(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
        <button type="button" className="secondary" onClick={onSync} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync from GitHub'}
        </button>
      </form>

      <div className="filters">
        {CHIPS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`chip ${filter === key ? 'chip-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label} ({counts[key] || 0})
          </button>
        ))}
      </div>
    </div>
  );
}