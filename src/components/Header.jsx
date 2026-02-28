import { useRef } from 'react'

export default function Header({ activeTab, onTabChange, shoppingCount, pantryCount, onCsvUpload, localCsvLoaded }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => onCsvUpload(evt.target.result)
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

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
        <button
          className={`api-key-btn ${localCsvLoaded ? 'has-key' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          title={localCsvLoaded ? 'Kochbuch ersetzen (CSV hochladen)' : 'Kochbuch als CSV hochladen'}
        >
          📂
          <span>{localCsvLoaded ? 'Kochbuch' : 'CSV laden'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
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
