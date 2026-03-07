import React, { useState, useCallback, useEffect, useRef } from 'react'

const ENCOURAGEMENTS_CORRECT = ['Super! 🎉', 'Toll! ⭐', 'Richtig! 🌟', 'Fantastisch! 🦄', 'Bravo! 🎊', 'Klasse! 🏆']
const ENCOURAGEMENTS_WRONG = ['Fast! Versuch es nochmal 💪', 'Nicht ganz... 🤔', 'Probier es nochmal! 😊']

const TRACTOR_TIERS = [
  { min: 0,  max: 0,           emoji: '🌱',       badgeEmoji: '🌱', label: 'Los geht\'s!',        color: '#A8E063', bg: '#F0FFF0' },
  { min: 1,  max: 4,           emoji: '🚜',       badgeEmoji: '🚜', label: 'Traktor unterwegs!',  color: '#56CCF2', bg: '#EFF9FF' },
  { min: 5,  max: 9,           emoji: '🌾🚜🌾',  badgeEmoji: '🚜', label: 'Ernte-Serie!',        color: '#FFC857', bg: '#FFFBEF' },
  { min: 10, max: 14,          emoji: '🚜💨',     badgeEmoji: '🚜', label: 'Volldampf!',          color: '#FF8E53', bg: '#FFF5EF' },
  { min: 15, max: 19,          emoji: '🚜🚜',     badgeEmoji: '🚜', label: 'Traktor-Konvoi!',     color: '#F953C6', bg: '#FFF0FB' },
  { min: 20, max: Infinity,    emoji: '🏆🚜🏆',   badgeEmoji: '🏆', label: 'Meister-Fahrer!',     color: '#6C63FF', bg: '#F0EEFF' },
]

function getTractorTier(streak) {
  return TRACTOR_TIERS.findIndex(t => streak >= t.min && streak <= t.max)
}

function generateQuestion(selectedTables) {
  const tables = selectedTables.length > 0 ? selectedTables : Array.from({ length: 10 }, (_, i) => i + 1)
  const a = tables[Math.floor(Math.random() * tables.length)]
  const b = Math.floor(Math.random() * 10) + 1
  const correct = a * b

  const wrongAnswers = new Set()
  while (wrongAnswers.size < 3) {
    const delta = Math.floor(Math.random() * 20) - 10
    const candidate = correct + delta
    if (candidate !== correct && candidate > 0) {
      wrongAnswers.add(candidate)
    }
  }

  const choices = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5)
  return { a, b, correct, choices }
}

export default function PracticeMode({ onBack, onEarnStar }) {
  const [selectedTables, setSelectedTables] = useState([])
  const [question, setQuestion] = useState(() => generateQuestion([]))
  const [feedback, setFeedback] = useState(null)
  const [streak, setStreak] = useState(0)
  const [sessionStars, setSessionStars] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [showUnlock, setShowUnlock] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1)

  function toggleTable(n) {
    setSelectedTables(prev =>
      prev.includes(n) ? prev.filter(t => t !== n) : [...prev, n]
    )
  }

  function handleAnswer(choice) {
    if (answered) return
    setAnswered(true)

    const isCorrect = choice === question.correct
    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      const newTierIndex = getTractorTier(newStreak)
      const oldTierIndex = getTractorTier(streak)
      if (newTierIndex !== oldTierIndex) {
        setAnimKey(k => k + 1)
        if (newTierIndex > 0) {
          setShowUnlock(TRACTOR_TIERS[newTierIndex].label)
          setTimeout(() => setShowUnlock(null), 2200)
        }
      }
      const stars = newStreak % 5 === 0 ? 2 : 1
      setSessionStars(prev => prev + stars)
      onEarnStar(stars)
      const msg = ENCOURAGEMENTS_CORRECT[Math.floor(Math.random() * ENCOURAGEMENTS_CORRECT.length)]
      setFeedback({ type: 'correct', msg, stars })
    } else {
      setStreak(0)
      setAnimKey(k => k + 1)
      setShowUnlock(null)
      const msg = ENCOURAGEMENTS_WRONG[Math.floor(Math.random() * ENCOURAGEMENTS_WRONG.length)]
      setFeedback({ type: 'wrong', msg, correct: question.correct })
    }

    setTimeout(() => {
      setFeedback(null)
      setAnswered(false)
      setQuestion(generateQuestion(selectedTables))
    }, 1500)
  }

  const tierIndex = getTractorTier(streak)
  const tier = TRACTOR_TIERS[tierIndex]

  const nextMin = tierIndex < 5 ? TRACTOR_TIERS[tierIndex + 1].min : streak
  const tierStart = tier.min
  const meterProgress = tierIndex === 5
    ? 100
    : tierIndex === 0
      ? 0
      : Math.min(100, ((streak - tierStart) / (nextMin - tierStart)) * 100)

  return (
    <div className="practice-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Zurück</button>
        <h2>Üben</h2>
        <div className="session-info">
          <span>⭐ {sessionStars}</span>
          <span
            className="streak-badge"
            style={{ background: streak > 0 ? tier.color : '#aaa' }}
          >
            {tier.badgeEmoji} {streak}
          </span>
        </div>
      </div>

      <div className="table-selector">
        <span className="selector-label">Reihen auswählen:</span>
        <div className="selector-buttons">
          {numbers.map(n => (
            <button
              key={n}
              className={`table-select-btn ${selectedTables.includes(n) ? 'selected' : ''}`}
              onClick={() => toggleTable(n)}
            >
              {n}
            </button>
          ))}
        </div>
        {selectedTables.length === 0 && (
          <span className="selector-hint">Alle Reihen aktiv</span>
        )}
      </div>

      <div className="tractor-zone" key={animKey}>
        {streak === 0 ? (
          <div className="tractor-idle">
            <span className="tractor-emoji">🌱</span>
            <span className="tractor-idle-label">Los geht's!</span>
          </div>
        ) : (
          <div
            className="tractor-display"
            style={{
              background: tier.bg,
              borderColor: tier.color,
              '--bounce-speed': tierIndex === 5 ? '0.9s' : '1.8s',
              '--emoji-size': tierIndex === 5 ? '52px' : '40px',
            }}
          >
            <div className="tractor-emoji-row">
              <span className="tractor-main-emoji">{tier.emoji}</span>
            </div>
            <div className="tractor-label" style={{ color: tier.color }}>
              {tier.label}
            </div>
            <div className="tractor-streak-count">
              {streak}er Serie
            </div>
            <div className="tractor-meter">
              <div
                className="tractor-meter-fill"
                style={{
                  background: tier.color,
                  width: `${meterProgress}%`,
                }}
              />
            </div>
          </div>
        )}

        {showUnlock && (
          <div className="tier-unlocked-banner">
            <span>🎉 Neues Level: {showUnlock} 🎉</span>
          </div>
        )}
      </div>

      <div className="question-card">
        <div className="question-text">
          <span className="question-num">{question.a}</span>
          <span className="question-op">×</span>
          <span className="question-num">{question.b}</span>
          <span className="question-op">=</span>
          <span className="question-blank">?</span>
        </div>

        <div className="choices-grid">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              className={`choice-btn ${
                answered
                  ? choice === question.correct
                    ? 'choice-correct'
                    : 'choice-wrong'
                  : ''
              }`}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
            >
              {choice}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback-overlay ${feedback.type}`}>
            <div className="feedback-content">
              <div className="feedback-msg">{feedback.msg}</div>
              {feedback.stars > 1 && (
                <div className="bonus-stars">+{feedback.stars} ⭐</div>
              )}
              {feedback.type === 'wrong' && (
                <div className="correct-answer">
                  Richtig wäre: <strong>{question.a} × {question.b} = {feedback.correct}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
