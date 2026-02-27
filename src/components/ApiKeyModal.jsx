import { useState } from 'react'

export default function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [value, setValue] = useState(currentKey || '')
  const [show, setShow] = useState(false)

  const handleSave = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>🔑 Claude API-Key</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-desc">
            Für die KI-generierten Rezeptvorschläge wird ein{' '}
            <strong>Anthropic API-Key</strong> benötigt. Der Key wird ausschließlich
            lokal in deinem Browser gespeichert und nie an externe Server übertragen
            (außer direkt an Anthropic für die Rezeptgenerierung).
          </p>
          <div className="api-key-hint">
            <span>💡</span>
            <span>
              API-Key erhältst du unter{' '}
              <code>console.anthropic.com</code> &rarr; API Keys
            </span>
          </div>
          <label className="field-label">Dein API-Key</label>
          <div className="api-key-input-wrap">
            <input
              type={show ? 'text' : 'password'}
              className="api-key-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="sk-ant-api03-..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="toggle-visibility" onClick={() => setShow(!show)} type="button">
              {show ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Abbrechen</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!value.trim()}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
