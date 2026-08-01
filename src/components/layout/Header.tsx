function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <div>
          <h1 className="text-xl font-bold text-gray-900">TimeVisual</h1>
          <p className="text-sm text-gray-500">可视化你的每一天</p>
        </div>
      </div>
    </header>
  )
}

export default Header
