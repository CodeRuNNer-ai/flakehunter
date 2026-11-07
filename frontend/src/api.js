async function request(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}${text ? ' - ' + text.slice(0, 120) : ''}`)
  }
  return res.json()
}

export const fetchFlakyTests = (repo, rerunMinutes) =>
  request(
    `/api/flaky-tests?repo=${encodeURIComponent(repo)}&rerunMinutes=${encodeURIComponent(rerunMinutes)}`,
  )

export const syncRepo = (repo) =>
  request(`/api/sync?repo=${encodeURIComponent(repo)}`, { method: 'POST' })