const CARDS = [
  { key: 'ALL', label: 'Tests tracked', tone: 'neutral' },
  { key: 'FLAKY', label: 'Flaky', tone: 'flaky' },
  { key: 'BROKEN', label: 'Broken', tone: 'broken' },
  { key: 'STABLE', label: 'Stable', tone: 'stable' },
]

export default function SummaryCards({ counts }) {
  return (
    <div className="summary-grid">
      {CARDS.map((card) => (
        <article key={card.key} className={`summary-card summary-${card.tone}`}>
          <div className="summary-card-top">
            <span className="summary-label">{card.label}</span>
            <span className={`summary-indicator indicator-${card.tone}`} />
          </div>
          <div className="summary-value">{counts[card.key] ?? 0}</div>
        </article>
      ))}
    </div>
  )
}
