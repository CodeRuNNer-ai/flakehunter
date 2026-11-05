import VerdictBadge from './VerdictBadge'

const COLUMNS = [
  { key: 'testName', label: 'Test' },
  { key: 'verdict', label: 'Verdict' },
  { key: 'runs', label: 'Runs', num: true },
  { key: 'failures', label: 'Failures', num: true },
  { key: 'failureRatePercent', label: 'Failure rate', num: true },
]

function splitName(full) {
  const [cls, method] = full.split('#')
  return { cls, method }
}

export default function TestTable({ rows, sort, onSort, totalRows }) {
  if (totalRows === 0) {
    return (
      <p className="state">
        No data for this repository yet. Click "Sync from GitHub" to import CI results.
      </p>
    )
  }
  if (rows.length === 0) {
    return <p className="state">No tests match this filter.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={c.num ? 'num' : ''}
                onClick={() => onSort(c.key)}
                aria-sort={
                  sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
                }
              >
                {c.label}
                <span className="arrow">
                  {sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const { cls, method } = splitName(r.testName)
            return (
              <tr key={r.testName}>
                <td>
                  <div className="test-method">{method || cls}</div>
                  {method && <div className="test-class">{cls}</div>}
                </td>
                <td><VerdictBadge verdict={r.verdict} /></td>
                <td className="num">{r.runs}</td>
                <td className="num">{r.failures}</td>
                <td className="num">
                  <div className="rate">
                    <div className="bar">
                      <div
                        className={`bar-fill bar-${r.verdict.toLowerCase()}`}
                        style={{ width: `${Math.min(r.failureRatePercent, 100)}%` }}
                      />
                    </div>
                    <span>{r.failureRatePercent}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}