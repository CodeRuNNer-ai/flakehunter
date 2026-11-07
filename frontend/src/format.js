export function formatMinutes(minutes) {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  return `${(minutes / 60).toFixed(1)} h`
}