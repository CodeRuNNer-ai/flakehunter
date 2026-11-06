const ITEMS = [
  { label: 'Overview', icon: '▦', active: true },
  { label: 'Test inventory', icon: '≡' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="sidebar-brand" href="/">
        <span className="brand-mark">F</span>
        <span>FlakeHunter</span>
      </a>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {ITEMS.map((item) => (
          <a key={item.label} href="#tests" className={`sidebar-link ${item.active ? 'sidebar-link-active' : ''}`}>
            <span aria-hidden="true">{item.icon}</span>{item.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <span className="sidebar-label">REPOSITORY</span>
        <p>Connect a GitHub repository to inspect test reliability.</p>
      </div>
    </aside>
  )
}
