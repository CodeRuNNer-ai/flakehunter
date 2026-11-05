const CARDS = [
  { key: 'ALL', label: 'Tests tracked', cls: 'card-all' },
  { key: 'FLAKY', label: 'Flaky', cls: 'card-flaky' },
  { key: 'BROKEN', label: 'Broken', cls: 'card-broken' },
  { key: 'STABLE', label: 'Stable', cls: 'card-stable' },
]

export default function SummaryCards({ counts }) {
  return (
    <section className="cards">
      {CARDS.map((c) => (
        <div key={c.key} className={`card ${c.cls}`}>
          <div className="card-number">{counts[c.key] ?? 0}</div>
          <div className="card-label">{c.label}</div>
        </div>
      ))}
    </section>
  )
}