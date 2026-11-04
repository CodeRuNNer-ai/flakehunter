const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Projects', icon: '📁' },
    { name: 'Test Runs', icon: '🧪' },
    { name: 'Flaky Tests', icon: '⚠' },
    { name: 'Reports', icon: '▥' },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#11111b] p-5 text-gray-300">
      <h1 className="mb-10 text-2xl font-bold text-white">
        <span className="text-purple-500">✦</span>
        FlakeHunter
      </h1>

      <input
        type="text"
        placeholder="Search..."
        className="mb-8 w-full rounded-lg border border-white/10 bg-[#1c1c29] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-400"
      />

      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-500">Workspace</p>

      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
              index === 0
                ? 'border border-purple-500/20 bg-purple-600/20 text-purple-400'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-5">
        <button type="button" className="w-full rounded-lg px-4 py-3 text-left text-sm hover:bg-white/5">
          ⚙ Settings
        </button>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
            A
          </div>

          <div>
            <p className="text-sm text-white">Admin User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
