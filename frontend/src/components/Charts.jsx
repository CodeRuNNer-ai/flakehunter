import { formatMinutes } from '../format';

const ORDER = ['FLAKY', 'BROKEN', 'STABLE', 'INCONCLUSIVE'];

function methodName(testName) {
  const i = testName.indexOf('#');
  return i === -1 ? testName : testName.slice(i + 1);
}

export default function Charts({ rows }) {
  if (!rows.length) return null;

  const counts = ORDER
    .map((v) => ({ verdict: v, n: rows.filter((r) => r.verdict === v).length }))
    .filter((c) => c.n > 0);

  const top = [...rows]
    .sort((a, b) => b.failureRatePercent - a.failureRatePercent)
    .slice(0, 8);

  return (
    <div className="charts">
      <section className="chart-card">
        <h2>Verdict split</h2>
        <div className="stack">
          {counts.map((c) => (
            <div
              key={c.verdict}
              className={`seg bar-${c.verdict.toLowerCase()}`}
              style={{ flex: c.n }}
              title={`${c.verdict}: ${c.n}`}
            />
          ))}
        </div>
        <ul className="legend">
          {counts.map((c) => (
            <li key={c.verdict}>
              <span className={`dot bar-${c.verdict.toLowerCase()}`} />
              {c.verdict.charAt(0) + c.verdict.slice(1).toLowerCase()} ({c.n})
            </li>
          ))}
        </ul>
      </section>

      <section className="chart-card">
        <h2>Failure rate by test</h2>
        {top.map((r) => (
          <div className="hbar-row" key={r.testName}>
            <span className="hbar-label" title={r.testName}>{methodName(r.testName)}</span>
            <div className="hbar-track">
              <div
                className={`hbar-fill bar-${r.verdict.toLowerCase()}`}
                style={{ width: `${Math.max(r.failureRatePercent, 1)}%` }}
              />
            </div>
            <span className="hbar-value">
              {Math.round(r.failureRatePercent)}%
              {r.estimatedWastedMinutes > 0 && ` · ${formatMinutes(r.estimatedWastedMinutes)}`}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}