import React from 'react'

const MASCOT_EMOJIS = ['🦄', '🐸', '🦊', '🐧', '🐨', '🦁', '🐯', '🦋']

export default function HomeScreen({ onSelectMode, totalStars }) {
  const mascot = MASCOT_EMOJIS[Math.floor(Math.random() * MASCOT_EMOJIS.length)]

  return (
    <div className="home-screen">
      <div className="mascot">{mascot}</div>
      <h1 className="app-title">Das Einmaleins</h1>
      <p className="app-subtitle">Lernen macht Spaß!</p>

      {totalStars > 0 && (
        <div className="stars-display">
          <span className="star-icon">⭐</span>
          <span className="stars-count">{totalStars} Sterne gesammelt!</span>
        </div>
      )}

      <div className="mode-cards">
        <button className="mode-card mode-table" onClick={() => onSelectMode('table')}>
          <div className="mode-emoji">📊</div>
          <div className="mode-name">Tabelle</div>
          <div className="mode-desc">Alle Rechnungen anschauen</div>
        </button>

        <button className="mode-card mode-practice" onClick={() => onSelectMode('practice')}>
          <div className="mode-emoji">✏️</div>
          <div className="mode-name">Üben</div>
          <div className="mode-desc">Aufgaben lösen und Sterne sammeln</div>
        </button>

        <button className="mode-card mode-quiz" onClick={() => onSelectMode('quiz')}>
          <div className="mode-emoji">🏆</div>
          <div className="mode-name">Quiz</div>
          <div className="mode-desc">Wieviele schaffst du in 60 Sekunden?</div>
        </button>
      </div>
    </div>
  )
}
