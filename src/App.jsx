import React, { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import MultiplicationTable from './components/MultiplicationTable'
import PracticeMode from './components/PracticeMode'
import QuizMode from './components/QuizMode'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [totalStars, setTotalStars] = useState(() => {
    try { return parseInt(localStorage.getItem('total-stars') || '0', 10) } catch { return 0 }
  })

  function earnStar(count = 1) {
    setTotalStars(prev => {
      const next = prev + count
      try { localStorage.setItem('total-stars', String(next)) } catch {}
      return next
    })
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <HomeScreen onSelectMode={setScreen} totalStars={totalStars} />
      )}
      {screen === 'table' && (
        <MultiplicationTable onBack={() => setScreen('home')} />
      )}
      {screen === 'practice' && (
        <PracticeMode onBack={() => setScreen('home')} onEarnStar={earnStar} />
      )}
      {screen === 'quiz' && (
        <QuizMode onBack={() => setScreen('home')} onEarnStar={earnStar} />
      )}
    </div>
  )
}
