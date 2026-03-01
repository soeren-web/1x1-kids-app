import React, { useState, useEffect, useRef, useCallback } from 'react'

const QUIZ_DURATION = 60

function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1
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

export default function QuizMode({ onBack, onEarnStar }) {
  const [phase, setPhase] = useState('ready') // ready | playing | done
  const [question, setQuestion] = useState(generateQuestion())
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(null)
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('quiz-highscore') || '0', 10) } catch { return 0 }
  })
  const timerRef = useRef(null)

  const endQuiz = useCallback((finalScore, finalTotal) => {
    clearInterval(timerRef.current)
    setPhase('done')
    const stars = Math.floor(finalScore / 2)
    onEarnStar(stars)
    setHighScore(prev => {
      const newHigh = Math.max(prev, finalScore)
      try { localStorage.setItem('quiz-highscore', String(newHigh)) } catch {}
      return newHigh
    })
  }, [onEarnStar])

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setScore(s => { setTotal(t => { endQuiz(s, t); return t }); return s })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, endQuiz])

  function startQuiz() {
    setScore(0)
    setTotal(0)
    setTimeLeft(QUIZ_DURATION)
    setQuestion(generateQuestion())
    setAnswered(false)
    setLastCorrect(null)
    setPhase('playing')
  }

  function handleAnswer(choice) {
    if (answered || phase !== 'playing') return
    setAnswered(true)

    const isCorrect = choice === question.correct
    setLastCorrect(isCorrect)

    const newScore = isCorrect ? score + 1 : score
    const newTotal = total + 1
    setScore(newScore)
    setTotal(newTotal)

    setTimeout(() => {
      setAnswered(false)
      setLastCorrect(null)
      setQuestion(generateQuestion())
    }, 400)
  }

  const timerPercent = (timeLeft / QUIZ_DURATION) * 100
  const timerColor = timeLeft > 20 ? '#56CCF2' : timeLeft > 10 ? '#FFC857' : '#FF6B6B'

  if (phase === 'ready') {
    return (
      <div className="quiz-screen">
        <div className="screen-header">
          <button className="back-btn" onClick={onBack}>← Zurück</button>
          <h2>Quiz</h2>
        </div>
        <div className="quiz-ready">
          <div className="quiz-trophy">🏆</div>
          <h3>Bereit für das Quiz?</h3>
          <p>Du hast <strong>{QUIZ_DURATION} Sekunden</strong> Zeit,<br />so viele Aufgaben wie möglich zu lösen!</p>
          {highScore > 0 && (
            <div className="high-score-display">
              Rekord: <strong>{highScore}</strong> richtige Antworten
            </div>
          )}
          <button className="start-quiz-btn" onClick={startQuiz}>Los geht's! 🚀</button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const percent = total > 0 ? Math.round((score / total) * 100) : 0
    const isNewHigh = score >= highScore && score > 0
    const stars = Math.floor(score / 2)

    return (
      <div className="quiz-screen">
        <div className="screen-header">
          <button className="back-btn" onClick={onBack}>← Zurück</button>
          <h2>Quiz</h2>
        </div>
        <div className="quiz-result">
          <div className="result-trophy">{isNewHigh ? '🏆' : percent >= 80 ? '🌟' : percent >= 50 ? '😊' : '💪'}</div>
          {isNewHigh && <div className="new-record">Neuer Rekord!</div>}
          <div className="result-score">
            <span className="score-num">{score}</span>
            <span className="score-of">von {total} richtig</span>
          </div>
          <div className="result-percent">{percent}%</div>
          {stars > 0 && (
            <div className="earned-stars">+{stars} ⭐ verdient!</div>
          )}
          <div className="result-message">
            {percent >= 90 ? 'Ausgezeichnet! Du bist ein Mathe-Profi!' :
             percent >= 70 ? 'Sehr gut! Weiter üben und du schaffst 100%!' :
             percent >= 50 ? 'Gut gemacht! Übe weiter, du schaffst das!' :
             'Nicht aufgeben! Übung macht den Meister!'}
          </div>
          <div className="result-buttons">
            <button className="retry-btn" onClick={startQuiz}>Nochmal! 🔄</button>
            <button className="home-btn" onClick={onBack}>Zurück 🏠</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Zurück</button>
        <div className="quiz-stats">
          <span className="quiz-score">✓ {score}</span>
          <span className="quiz-total">von {total}</span>
        </div>
      </div>

      <div className="timer-bar-container">
        <div
          className="timer-bar"
          style={{ width: `${timerPercent}%`, background: timerColor }}
        />
      </div>
      <div className="timer-number" style={{ color: timerColor }}>{timeLeft}s</div>

      <div className={`quiz-question-card ${lastCorrect === true ? 'flash-correct' : lastCorrect === false ? 'flash-wrong' : ''}`}>
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
                    : 'choice-wrong-dim'
                  : ''
              }`}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
