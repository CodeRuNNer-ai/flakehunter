import VerdictBadge from './VerdictBadge';
import { formatMinutes } from '../format';

const COLUMNS = [
  { key: 'testName', label: 'Test' },
  { key: 'verdict', label: 'Verdict' },
  { key: 'runs', label: 'Runs', num: true },
  { key: 'failures', label: 'Failures', num: true },
  { key: 'estimatedWastedMinutes', label: 'Time wasted', num: true },
  { key: 'failureRatePercent', label: 'Failure rate', num: true },
];

function splitName(testName) {
  const i = testName.indexOf('#');
  return i === -1
    ? { cls: '', method: testName }
    : { cls: testName.slice(0, i), method: testName.slice(i + 1) };
}

export default function TestTable({ rows, sort, onSort }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key} className={c.num ? 'num' : ''} onClick={() => onSort(c.key)}>
                {c.label}
                {sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const { cls, method } = splitName(r.testName);
            const v = r.verdict.toLowerCase();
            return (
              <tr key={r.testName}>
                <td>
                  <div className="test-method">{method}</div>
                  <div className="test-class">{cls}</div>
                </td>
                <td><VerdictBadge verdict={r.verdict} /></td>
                <td className="num">{r.runs}</td>
                <td className="num">{r.failures}</td>
                <td className="num">
                  {r.estimatedWastedMinutes > 0 ? formatMinutes(r.estimatedWastedMinutes) : '-'}
                </td>
                <td className="num">
                  <span className="rate">
                    <span className="bar">
                      <span
                        className={`bar-fill bar-${v}`}
                        style={{ display: 'block', width: `${r.failureRatePercent}%` }}
                      />
                    </span>
                    {Math.round(r.failureRatePercent)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}