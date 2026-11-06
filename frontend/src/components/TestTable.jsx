import VerdictBadge from './VerdictBadge'

const COLUMNS = [
  { key: 'testName', label: 'Test', numeric: false },
  { key: 'verdict', label: 'Verdict', numeric: false },
  { key: 'runs', label: 'Runs', numeric: true },
  { key: 'failures', label: 'Failures', numeric: true },
  { key: 'failureRatePercent', label: 'Failure rate', numeric: true },
]

function splitName(full = '') {
  const [className, method] = full.split('#')
  return { className, method }
}

export default function TestTable({ rows, sort, onSort, totalRows, search }) {
  if (totalRows === 0) {
    return (
      <div className="empty-state">
        <strong>No test results yet</strong>
        <p>Sync this repository with GitHub to import CI test results.</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <strong>{search ? 'No matching tests' : 'No tests in this view'}</strong>
        <p>{search ? 'Try another test name or clear the search.' : 'Choose another verdict filter to see more tests.'}</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                className={column.numeric ? 'numeric' : ''}
                aria-sort={sort.key === column.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <button type="button" className="sort-button" onClick={() => onSort(column.key)}>
                  {column.label}
                  <span className="sort-indicator">
                    {sort.key === column.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { className, method } = splitName(row.testName)
            const rate = Math.max(0, Math.min(Number(row.failureRatePercent) || 0, 100))
            return (
              <tr key={row.testName}>
                <td className="test-cell">
                  <span className="test-method">{method || className || row.testName}</span>
                  {method && <span className="test-class">{className}</span>}
                </td>
                <td><VerdictBadge verdict={row.verdict} /></td>
                <td className="numeric">{row.runs}</td>
                <td className="numeric">{row.failures}</td>
                <td className="numeric">
                  <div className="rate">
                    <div className="bar" aria-hidden="true">
                      <div className={`bar-fill bar-${String(row.verdict).toLowerCase()}`} style={{ width: `${rate}%` }} />
                    </div>
                    <span className="rate-value">{rate}%</span>
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
