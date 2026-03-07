import { useEffect, useRef, useState, useCallback } from 'react'

const W = 480
const H = 300
const TRACTOR_X = 75
const TRACTOR_SPEED = 4.5
const PLAY_TOP = 38
const PLAY_BOTTOM = H - 30

const CROPS = ['🌽', '🥕', '🌻', '🍎', '🍓', '🫐']
const OBSTACLES = ['🪨', '🌵', '🪵']

const getHi = () => Number(localStorage.getItem('tractor-hi') || 0)
const setHi = (n) => localStorage.setItem('tractor-hi', String(n))

function makeItem(speed) {
  const isCrop = Math.random() < 0.65
  return {
    x: W + 40,
    y: PLAY_TOP + 20 + Math.random() * (PLAY_BOTTOM - PLAY_TOP - 40),
    emoji: isCrop
      ? CROPS[Math.floor(Math.random() * CROPS.length)]
      : OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)],
    type: isCrop ? 'crop' : 'obstacle',
    vx: -(speed + Math.random() * 1.5),
    size: 34,
  }
}

function drawCloud(ctx, x, y) {
  ctx.beginPath()
  ctx.arc(x, y, 18, 0, Math.PI * 2)
  ctx.arc(x + 20, y - 8, 22, 0, Math.PI * 2)
  ctx.arc(x + 42, y, 16, 0, Math.PI * 2)
  ctx.fill()
}

function drawBg(ctx, offset) {
  // Sky
  ctx.fillStyle = '#87CEEB'
  ctx.fillRect(0, 0, W, H * 0.38)

  // Sun
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(W - 50, 38, 24, 0, Math.PI * 2)
  ctx.fill()

  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  const cloudBases = [60, 200, 340]
  cloudBases.forEach((base) => {
    const cx = ((base - offset * 0.18) % (W + 120)) - 60
    drawCloud(ctx, cx, 28)
    drawCloud(ctx, cx + 160, 50)
  })

  // Grass
  ctx.fillStyle = '#5DB34C'
  ctx.fillRect(0, H * 0.35, W, H * 0.65)

  // Dirt path
  ctx.fillStyle = '#C8A060'
  ctx.fillRect(0, H * 0.27, W, H * 0.56)

  // Path dashes
  ctx.strokeStyle = '#B0895A'
  ctx.lineWidth = 3
  ctx.setLineDash([40, 30])
  ctx.lineDashOffset = -(offset % 70)
  ctx.beginPath()
  ctx.moveTo(0, H * 0.52)
  ctx.lineTo(W, H * 0.52)
  ctx.stroke()
  ctx.setLineDash([])

  // Grass edge strips
  ctx.fillStyle = '#4CA33D'
  ctx.fillRect(0, H * 0.83, W, 7)
  ctx.fillRect(0, H * 0.26, W, 6)
}

export default function TractorGame() {
  const canvasRef = useRef(null)
  const gsRef = useRef(null)
  const rafRef = useRef(null)
  const [ui, setUi] = useState({ phase: 'start', score: 0, lives: 3, highScore: getHi() })

  function startGame() {
    gsRef.current = {
      phase: 'playing',
      tractorY: H / 2,
      speed: 2.8,
      items: [],
      floatingTexts: [],
      score: 0,
      lives: 3,
      frame: 0,
      bgOffset: 0,
      keys: new Set(),
      spawnTimer: 60,
      flashTimer: 0,
    }
    setUi({ phase: 'playing', score: 0, lives: 3, highScore: getHi() })
  }

  const loop = useCallback(() => {
    const gs = gsRef.current
    if (!gs || gs.phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // --- Update ---
    gs.frame++
    gs.bgOffset += gs.speed * 0.6

    // Tractor movement
    if (gs.keys.has('ArrowUp') || gs.keys.has('w') || gs.keys.has('W')) {
      gs.tractorY = Math.max(PLAY_TOP + 24, gs.tractorY - TRACTOR_SPEED)
    }
    if (gs.keys.has('ArrowDown') || gs.keys.has('s') || gs.keys.has('S')) {
      gs.tractorY = Math.min(PLAY_BOTTOM - 24, gs.tractorY + TRACTOR_SPEED)
    }

    // Speed up over time
    if (gs.frame % 400 === 0 && gs.speed < 8) {
      gs.speed += 0.35
    }

    // Spawn items
    gs.spawnTimer--
    if (gs.spawnTimer <= 0) {
      gs.items.push(makeItem(gs.speed))
      const interval = Math.max(35, 70 - gs.score * 0.7)
      gs.spawnTimer = interval
      if (gs.score > 8 && Math.random() < 0.35) {
        gs.items.push(makeItem(gs.speed))
      }
    }

    // Move items + collision
    const hitW = 38, hitH = 30
    gs.items = gs.items.filter((item) => {
      item.x += item.vx
      if (item.x < -50) return false

      // AABB collision
      if (
        Math.abs(item.x - TRACTOR_X) < (hitW + item.size * 0.38) / 2 &&
        Math.abs(item.y - gs.tractorY) < (hitH + item.size * 0.38) / 2
      ) {
        if (item.type === 'crop') {
          gs.score++
          gs.floatingTexts.push({
            x: item.x, y: item.y - 10,
            text: '+1 🌾', alpha: 1, vy: -1.4, life: 38,
          })
          setUi((u) => ({ ...u, score: gs.score }))
        } else {
          gs.lives--
          gs.flashTimer = 18
          setUi((u) => ({ ...u, lives: gs.lives }))
          if (gs.lives <= 0) {
            gs.phase = 'gameover'
            const newHi = Math.max(getHi(), gs.score)
            setHi(newHi)
            setUi({ phase: 'gameover', score: gs.score, lives: 0, highScore: newHi })
          }
        }
        return false
      }
      return true
    })

    if (gs.phase !== 'playing') {
      rafRef.current = null
      return
    }

    // Floating texts
    gs.floatingTexts = gs.floatingTexts.filter((ft) => {
      ft.y += ft.vy
      ft.alpha -= 1 / ft.life
      ft.life--
      return ft.life > 0
    })

    if (gs.flashTimer > 0) gs.flashTimer--

    // --- Draw ---
    drawBg(ctx, gs.bgOffset)

    // Hit flash overlay
    if (gs.flashTimer > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${gs.flashTimer / 36})`
      ctx.fillRect(0, 0, W, H)
    }

    // Items
    gs.items.forEach((item) => {
      ctx.font = `${item.size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.emoji, item.x, item.y)
    })

    // Tractor with bounce
    const bounce = Math.sin(gs.frame * 0.25) * 2
    ctx.font = '46px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🚜', TRACTOR_X, gs.tractorY + bounce)

    // Floating score texts
    gs.floatingTexts.forEach((ft) => {
      ctx.globalAlpha = ft.alpha
      ctx.font = 'bold 15px sans-serif'
      ctx.fillStyle = '#1a6b00'
      ctx.textAlign = 'center'
      ctx.fillText(ft.text, ft.x, ft.y)
    })
    ctx.globalAlpha = 1

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // Keyboard input
  useEffect(() => {
    const down = (e) => gsRef.current?.keys.add(e.key)
    const up = (e) => gsRef.current?.keys.delete(e.key)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Start/stop RAF loop
  useEffect(() => {
    if (ui.phase === 'playing') {
      rafRef.current = requestAnimationFrame(loop)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [ui.phase, loop])

  const pressUp = (on) => {
    if (on) gsRef.current?.keys.add('ArrowUp')
    else gsRef.current?.keys.delete('ArrowUp')
  }
  const pressDown = (on) => {
    if (on) gsRef.current?.keys.add('ArrowDown')
    else gsRef.current?.keys.delete('ArrowDown')
  }

  return (
    <div className="tg-wrap">
      <div className="tg-header">
        <span className="tg-title">🚜 Tractor Drive</span>
        {ui.phase === 'playing' && (
          <div className="tg-hud">
            <span>🌾 {ui.score}</span>
            <span>
              {'❤️'.repeat(ui.lives)}
              {'🖤'.repeat(Math.max(0, 3 - ui.lives))}
            </span>
            <span className="tg-hi">Best: {ui.highScore}</span>
          </div>
        )}
      </div>

      <div className="tg-canvas-wrap">
        <canvas ref={canvasRef} width={W} height={H} className="tg-canvas" />

        {ui.phase === 'start' && (
          <div className="tg-overlay">
            <div className="tg-overlay-box">
              <div className="tg-overlay-title">🚜 Tractor Drive!</div>
              <p>Drive your tractor and collect crops!</p>
              <div className="tg-legend">
                <span>🌽🥕🌻 = +1 point</span>
                <span>🪨🌵 = lose ❤️</span>
              </div>
              <p className="tg-controls-hint">Arrow keys or W / S to move</p>
              {ui.highScore > 0 && <p className="tg-best">Best: {ui.highScore} 🌾</p>}
              <button className="tg-btn" onClick={startGame}>
                Start Game!
              </button>
            </div>
          </div>
        )}

        {ui.phase === 'gameover' && (
          <div className="tg-overlay">
            <div className="tg-overlay-box">
              <div className="tg-overlay-title">Game Over! 🌾</div>
              <p className="tg-score-big">Score: {ui.score}</p>
              {ui.score > 0 && ui.score >= ui.highScore && (
                <p className="tg-record">🏆 New Record!</p>
              )}
              <p className="tg-best">Best: {ui.highScore} 🌾</p>
              <button className="tg-btn" onClick={startGame}>
                Play Again!
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="tg-touch">
        <button
          className="tg-touch-btn"
          onTouchStart={(e) => { e.preventDefault(); pressUp(true) }}
          onTouchEnd={(e) => { e.preventDefault(); pressUp(false) }}
          onMouseDown={() => pressUp(true)}
          onMouseUp={() => pressUp(false)}
          onMouseLeave={() => pressUp(false)}
        >
          ▲
        </button>
        <button
          className="tg-touch-btn"
          onTouchStart={(e) => { e.preventDefault(); pressDown(true) }}
          onTouchEnd={(e) => { e.preventDefault(); pressDown(false) }}
          onMouseDown={() => pressDown(true)}
          onMouseUp={() => pressDown(false)}
          onMouseLeave={() => pressDown(false)}
        >
          ▼
        </button>
      </div>
    </div>
  )
}
