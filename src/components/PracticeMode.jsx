import React, { useState, useCallback } from 'react'

const ENCOURAGEMENTS_CORRECT = ['Super! 🎉', 'Toll! ⭐', 'Richtig! 🌟', 'Fantastisch! 🦄', 'Bravo! 🎊', 'Klasse! 🏆']
const ENCOURAGEMENTS_WRONG = ['Fast! Versuch es nochmal 💪', 'Nicht ganz... 🤔', 'Probier es nochmal! 😊']

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
      const stars = newStreak % 5 === 0 ? 2 : 1
      setSessionStars(prev => prev + stars)
      onEarnStar(stars)
      const msg = ENCOURAGEMENTS_CORRECT[Math.floor(Math.random() * ENCOURAGEMENTS_CORRECT.length)]
      setFeedback({ type: 'correct', msg, stars })
    } else {
      setStreak(0)
      const msg = ENCOURAGEMENTS_WRONG[Math.floor(Math.random() * ENCOURAGEMENTS_WRONG.length)]
      setFeedback({ type: 'wrong', msg, correct: question.correct })
    }

    setTimeout(() => {
      setFeedback(null)
      setAnswered(false)
      setQuestion(generateQuestion(selectedTables))
    }, 1500)
  }

  return (
    <div className="practice-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Zurück</button>
        <h2>Üben</h2>
        <div className="session-info">
          <span>⭐ {sessionStars}</span>
          <span className="streak-badge">🔥 {streak}</span>
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

      <div className="progress-hint">
        {streak >= 5 && <div className="streak-fire">🔥 {streak}er Serie! Weiter so!</div>}
      </div>
    </div>
  )
}
