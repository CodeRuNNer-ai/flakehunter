import Sidebar from './components/Sidebar.jsx'

const statCards = [
  { label: 'Total failures', value: '128', change: '+12%' },
  { label: 'Tests passing', value: '94.3%', change: '+1.8%' },
  { label: 'Open flakes', value: '19', change: '-4%' },
]

function App() {
  return (
    <div className="flex min-h-screen bg-[#0d0d16] text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-400">Overview</p>
          <h2 className="mt-2 text-3xl font-bold">Dashboard</h2>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {statCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-white/10 bg-[#141423] p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-gray-400">{card.label}</p>
              <div className="mt-4 flex items-end justify-between">
                <h3 className="text-3xl font-bold">{card.value}</h3>
                <span className="text-sm font-medium text-emerald-400">{card.change}</span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
