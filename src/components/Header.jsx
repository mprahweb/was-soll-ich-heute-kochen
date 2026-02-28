export default function Header({ activeTab, onTabChange, shoppingCount, pantryCount }) {
  return (
    <header className="header">
      <div className="header-top">
        <div className="header-title">
          <span className="header-icon">🍳</span>
          <div>
            <h1>Was soll ich heute kochen?</h1>
            <p>Vorrat verwalten &amp; Rezepte entdecken</p>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('home')}
        >
          <span>🥗</span>
          <span>Mein Vorrat</span>
          {pantryCount > 0 && <span className="nav-badge">{pantryCount}</span>}
        </button>
        <button
          className={`nav-tab ${activeTab === 'shopping' ? 'active' : ''}`}
          onClick={() => onTabChange('shopping')}
        >
          <span>🛒</span>
          <span>Einkaufsliste</span>
          {shoppingCount > 0 && <span className="nav-badge">{shoppingCount}</span>}
        </button>
      </nav>
    </header>
  )
}
