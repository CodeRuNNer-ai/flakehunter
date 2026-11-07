import { formatMinutes } from '../format';

export default function SummaryCards({ counts, wastedMinutes }) {
  return (
    <div className="cards">
      <div className="card">
        <div className="card-number">{counts.ALL}</div>
        <div className="card-label">Tests tracked</div>
      </div>
      <div className="card card-flaky">
        <div className="card-number">{counts.FLAKY}</div>
        <div className="card-label">Flaky</div>
      </div>
      <div className="card card-broken">
        <div className="card-number">{counts.BROKEN}</div>
        <div className="card-label">Broken</div>
      </div>
      <div className="card card-stable">
        <div className="card-number">{counts.STABLE}</div>
        <div className="card-label">Stable</div>
      </div>
      <div className="card card-wasted">
        <div className="card-number">{formatMinutes(wastedMinutes)}</div>
        <div className="card-label">Est. CI time wasted</div>
      </div>
    </div>
  );
}