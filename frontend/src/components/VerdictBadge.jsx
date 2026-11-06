export default function VerdictBadge({ verdict }) {
  const safeVerdict = String(verdict || 'INCONCLUSIVE').toLowerCase()
  return <span className={`badge badge-${safeVerdict}`}>{verdict || 'INCONCLUSIVE'}</span>
}
