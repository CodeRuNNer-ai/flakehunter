export default function VerdictBadge({ verdict }) {
  return <span className={`badge badge-${verdict.toLowerCase()}`}>{verdict}</span>
}