import { useState, useEffect, useRef } from 'react'
import { BsArrowUpSquareFill, BsArrowDownSquareFill } from "react-icons/bs";
import { TbSquareLetterSFilled, TbSquareLetterWFilled } from "react-icons/tb";
import './App.css'

function App() {
  const step = 10
  const gameH = 300
  const gameW = 600
  const playerW = 10
  const playerH = 50
  const ballSize = 8
  
  const [pos, setPos] = useState({ x: 10, y: gameH/2 - (playerH / 2)})
  const [pos2, setPos2] = useState({ x: gameW - playerW -10, y: gameH/2 - (playerH / 2)})
  const [ballPos, setBallPos] = useState({ x: gameW/2, y: gameH/2 })
  const [leftPlayerScore, setLeftPlayerScore] = useState(0)
  const [rightPlayerScore, setRightPlayerScore] = useState(0)
  const [paused,setPaused] = useState(false)
  const [reseted,setReseted] = useState(false)
  const [scoreAnimation, setScoreAnimation] = useState<'left' | 'right' | null>(null)
  const ballVel = useRef({ x: 5, y: 3 }) // Increased speed from (3, 2) to (5, 3)
  const posRef = useRef(pos)
  const pos2Ref = useRef(pos2)
  const hasScored = useRef(false)

  useEffect(() => {
    const keysPressed = new Set<string>()

    function onKeyDown(e: KeyboardEvent) {
      keysPressed.add(e.key)
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        e.preventDefault()
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      keysPressed.delete(e.key)
    }

    const gameLoop = setInterval(() => {
      if (reseted)
      {
        ballVel.current = { x: 5, y: 3 }
        setBallPos({ x: gameW/2, y: gameH/2 })
        setLeftPlayerScore(0)
        setRightPlayerScore(0)
        setReseted(false)
      }
      if(paused)
          return
      // Move players
      setPos((p) => {
        let newY = p.y
        if (keysPressed.has('w')) {
          newY = Math.max(0, newY - step)
        }
        if (keysPressed.has('s')) {
          newY = Math.min(gameH - playerH, newY + step)
        }
        const newPos = { ...p, y: newY }
        posRef.current = newPos // Update ref
        return newPos
      })

      setPos2((p) => {
        let newY = p.y
        if (keysPressed.has('ArrowUp')) {
          newY = Math.max(0, newY - step)
        }
        if (keysPressed.has('ArrowDown')) {
          newY = Math.min(gameH - playerH, newY + step)
        }
        const newPos = { ...p, y: newY }
        pos2Ref.current = newPos // Update ref
        return newPos
      })

      // Move ball with velocity
      setBallPos((ball) => {
        let newX = ball.x + ballVel.current.x
        let newY = ball.y + ballVel.current.y
        let newVelX = ballVel.current.x
        let newVelY = ballVel.current.y

        // Check if ball goes out of bounds FIRST - reset immediately
        if (ball.x > gameW) {
          // Left player scores (ball went past right edge)
          if (!hasScored.current)
          {
            setLeftPlayerScore(prev => prev + 1)
            setScoreAnimation('left')
            setTimeout(() => setScoreAnimation(null), 300)
            hasScored.current = true
          }
          ballVel.current = { x: -5, y: 3 }
          return { x: gameW / 2, y: gameH / 2 }
        }
        if (ball.x < 0 ) {
          // Right player scores (ball went past left edge)
          if (!hasScored.current)
          {
            setRightPlayerScore(prev => prev + 1)
            setScoreAnimation('right')
            setTimeout(() => setScoreAnimation(null), 300)
            hasScored.current = true
          }
          ballVel.current = { x: 5, y: 3 }
          return { x: gameW / 2, y: gameH / 2 }
        }

        // Reset hasScored flag when ball is back in play
        if (ball.x >= 50 && ball.x <= gameW - 50) {
          hasScored.current = false
        }

        // Bounce off top and bottom walls
        if (newY <= 0 || newY >= gameH - ballSize) {
          newVelY = -newVelY
          newY = Math.max(0, Math.min(gameH - ballSize, newY))
        }

        // Check collision with left player (blue) using ref
        const leftPlayer = posRef.current
        if (
          newX <= leftPlayer.x + playerW &&
          newX + ballSize >= leftPlayer.x &&
          newY + ballSize >= leftPlayer.y &&
          newY <= leftPlayer.y + playerH &&
          newVelX < 0 // Only bounce if moving left
        ) {
          newVelX = Math.abs(newVelX) * 1.1 // Bounce right
          newX = leftPlayer.x + playerW // Push ball out of paddle
        }

        // Check collision with right player (indigo) using ref
        const rightPlayer = pos2Ref.current
        if (
          newX + ballSize >= rightPlayer.x &&
          newX <= rightPlayer.x + playerW &&
          newY + ballSize >= rightPlayer.y &&
          newY <= rightPlayer.y + playerH &&
          newVelX > 0 // Only bounce if moving right
        ) {
          newVelX = -Math.abs(newVelX) * 1.1 // Bounce left
          newX = rightPlayer.x - ballSize // Push ball out of paddle
        }

        // Update velocity ref
        ballVel.current = { x: newVelX, y: newVelY }

        return { x: newX, y: newY }
      })
    }, 50) // Update every 50ms

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      clearInterval(gameLoop)
    }
  }, [paused,reseted])

  return (
    <>
    <div className='flex flex-col justify-center items-center'>
        <div className='-mt-30' >
          <img src='/yinyong.png'></img>
        </div>
        <div className='-mt-1 m-5 shadow-lg border-b border-b-white'>
          <h1>
            <span className={scoreAnimation === 'left' ? 'score-animate inline-block' : 'inline-block'}>
              {leftPlayerScore}
            </span>
            {' : '}
            <span className={scoreAnimation === 'right' ? 'score-animate inline-block' : 'inline-block'}>
              {rightPlayerScore}
            </span>
          </h1>
        </div>
        {paused && (
          <div className="absolute mt-20 text-blue-500 font-semibold z-1 text-3xl pause-text">
            ⏸ PAUSED
          </div>

        )}
      <div className='absolute w-170 flex justify-between mt-20'>
        <div className='grid grid-cols-1 gap-2' >
          <TbSquareLetterWFilled size={30} />
          <TbSquareLetterSFilled size={30} />
        </div>
        <div className='grid grid-cols-1 gap-2'>
          <BsArrowUpSquareFill size={24} />
          <BsArrowDownSquareFill size={24} />
        </div>
      </div>
      {/* container for the movable box */}
      <div className="game-arena w-[600px] h-[300px] border border-gray-600 relative mt-4 overflow-hidden">
        {/* Center dashed line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <line 
            x1="300" 
            y1="0" 
            x2="300" 
            y2="300" 
            stroke="rgba(255, 255, 255, 0.3)" 
            strokeWidth="2"
            className="center-line"
          />
        </svg>
        
        <div
          className="absolute w-2.5 h-[50px] bg-black flex items-center justify-center text-white select-none"
          style={{
            left: pos2.x,
            top: pos2.y,
          }}
        >
        </div>
        <div
          className="absolute w-2.5 h-[50px] bg-white flex items-center justify-center text-white select-none"
          style={{
            left: pos.x,
            top: pos.y,
          }}
        >
        </div>
        <div
          id='ball'
          className='absolute w-2 h-2 bg-red-600 rounded-full'
          style={{
            left: ballPos.x,
            top: ballPos.y,
          }}
        >
        </div>
      </div>
      <div className=' flex gap-2 justify-center mt-5'>
        <button
         className='w-25 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold'
         onClick={() => setPaused(!paused)} > 
         {paused ? ' Resume':' Pause'}
        </button>
        <button 
          className='w-25 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold'
          onClick={() => setReseted(true)} > 
           Reset
        </button>
      </div>
      <div className='absolute bottom-0 pointer-events-none w-full -z-10 flex justify-between'>
        <div className='w-full flex justify-start items-end'>
          <img src='/p1.png' className='w-100 h-70'></img>
        </div>
        <div className='w-full flex justify-end'>
          <img src='/p2.png' className='w-100 h-80'></img>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
