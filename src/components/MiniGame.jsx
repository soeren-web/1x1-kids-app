import React, { useState, useEffect } from 'react'

const TIME_PER_Q = 3500

function generateMiniQuestion(selectedTables) {
  const tables = selectedTables.length > 0 ? selectedTables : Array.from({ length: 10 }, (_, i) => i + 1)
  const a = tables[Math.floor(Math.random() * tables.length)]
  const b = Math.floor(Math.random() * 10) + 1
  const correct = a * b
  let wrong
  do {
    wrong = correct + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 5) + 1)
  } while (wrong <= 0 || wrong === correct)
  const choices = Math.random() < 0.5 ? [correct, wrong] : [wrong, correct]
  return { a, b, correct, choices }
}

export default function MiniGame({ onClose, onEarnStar, selectedTables }) {
  const [phase, setPhase] = useState('intro')
  const [questions] = useState(() =>
    Array.from({ length: 5 }, () => generateMiniQuestion(selectedTables))
  )
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [answered, setAnswered] = useState(false)
  const [choiceResult, setChoiceResult] = useState(null) // { index, correct: bool }

  useEffect(() => {
    if (phase !== 'playing' || answered) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 50), 50)
    return () => clearTimeout(t)
  }, [phase, timeLeft, answered])

  function handleTimeout() {
    setAnswered(true)
    setChoiceResult(null)
    setTimeout(advance, 900)
  }

  function handleChoice(choice, index) {
    if (answered) return
    setAnswered(true)
    const isCorrect = choice === questions[qIndex].correct
    setChoiceResult({ index, correct: isCorrect })
    if (isCorrect) {
      setScore(prev => prev + 1)
      onEarnStar(1)
    }
    setTimeout(advance, 700)
  }

  function advance() {
    const next = qIndex + 1
    if (next >= 5) {
      setPhase('done')
    } else {
      setQIndex(next)
      setTimeLeft(TIME_PER_Q)
      setAnswered(false)
      setChoiceResult(null)
    }
  }

  function handleDone() {
    const bonus = score === 5 ? 3 : 0
    if (bonus > 0) onEarnStar(bonus)
    onClose(score + bonus)
  }

  if (phase === 'intro') {
    return (
      <div className="minigame-overlay">
        <div className="minigame-card">
          <div className="minigame-intro-emoji">🌾⚡🚜</div>
          <h2 className="minigame-title">Ernte-Blitz!</h2>
          <p className="minigame-subtitle">10er-Serie! Schaffst du 5 Blitz-Fragen?</p>
          <p className="minigame-hint">2 Antworten · 3,5 Sekunden pro Frage</p>
          <button className="minigame-start-btn" onClick={() => setPhase('playing')}>
            Los geht's! ⚡
          </button>
          <button className="minigame-skip-btn" onClick={() => onClose(0)}>
            Überspringen
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const isPerfect = score === 5
    return (
      <div className="minigame-overlay">
        <div className="minigame-card">
          <div className="minigame-result-emoji">
            {isPerfect ? '🏆' : score >= 3 ? '🌟' : '💪'}
          </div>
          <h2 className="minigame-title">
            {isPerfect ? 'Perfekt!' : score >= 3 ? 'Gut gemacht!' : 'Weiter üben!'}
          </h2>
          <div className="minigame-score">{score} / 5 richtig</div>
          <div className="minigame-stars-earned">
            {score > 0 && <span>+{score} ⭐</span>}
            {isPerfect && <span className="minigame-bonus"> +3 Bonus! 🎉</span>}
          </div>
          <button className="minigame-start-btn" onClick={handleDone}>
            Weiter üben! 🚜
          </button>
        </div>
      </div>
    )
  }

  const q = questions[qIndex]
  const timerPct = (timeLeft / TIME_PER_Q) * 100
  const timerColor = timerPct > 50 ? '#56CCF2' : timerPct > 25 ? '#FFC857' : '#FF6B6B'

  return (
    <div className="minigame-overlay">
      <div className="minigame-card">
        <div className="minigame-progress">
          <span className="minigame-qcount">Frage {qIndex + 1} / 5</span>
          <span className="minigame-score-live">✅ {score}</span>
        </div>
        <div className="minigame-timer-bar">
          <div
            className="minigame-timer-fill"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
        </div>
        <div className="minigame-question">
          <span className="minigame-num">{q.a}</span>
          <span className="minigame-op">×</span>
          <span className="minigame-num">{q.b}</span>
          <span className="minigame-op">=</span>
          <span className="minigame-blank">?</span>
        </div>
        <div className="minigame-choices">
          {q.choices.map((choice, i) => {
            let cls = 'minigame-choice'
            if (choiceResult) {
              if (choiceResult.index === i) {
                cls += choiceResult.correct ? ' correct' : ' wrong'
              } else if (answered && choice === q.correct) {
                cls += ' correct'
              }
            } else if (answered && timeLeft <= 0 && choice === q.correct) {
              cls += ' timeout'
            }
            return (
              <button key={i} className={cls} onClick={() => handleChoice(choice, i)} disabled={answered}>
                {choice}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
