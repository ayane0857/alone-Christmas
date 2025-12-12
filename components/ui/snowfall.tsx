"use client"

import React, { useEffect, useRef } from 'react'

interface Snowflake {
  x: number
  y: number
  radius: number
  density: number
  color: string
}

const DEFAULT_SNOWFLAKES = 150

const Snowfall: React.FC<{ count?: number }> = ({ count = DEFAULT_SNOWFLAKES }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvasInstance = canvasRef.current
    const contextInstance = canvasInstance?.getContext('2d')
    if (!canvasInstance || !contextInstance) {return}

    // --- Canvas サイズ設定 ---
    const setCanvasSize = () => {
      canvasInstance.width = window.innerWidth
      canvasInstance.height = window.innerHeight
      // 高DPI対応（必要に応じて）
      const dpr = Math.max(window.devicePixelRatio || 1, 1)
      if (dpr !== 1) {
        canvasInstance.width = Math.floor(window.innerWidth * dpr)
        canvasInstance.height = Math.floor(window.innerHeight * dpr)
        canvasInstance.style.width = `${window.innerWidth}px`
        canvasInstance.style.height = `${window.innerHeight}px`
        contextInstance.scale(dpr, dpr)
      }
    }

    // --- 雪の結晶の生成 ---
    let snowflakes: Snowflake[] = []
    const numSnowflakes: number = Math.max(0, Math.floor(count))

    const createSnowflakes = (): void => {
      snowflakes = []
      for (let i = 0; i < numSnowflakes; i++) {
        snowflakes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 3 + 1, // 1px ~ 4px
          density: Math.random() * numSnowflakes,
          color: 'rgba(255, 255, 255, 0.8)'
        })
      }
    }

    // --- 描画 ---
    const drawSnowflakes = (): void => {
      contextInstance.clearRect(0, 0, canvasInstance.width, canvasInstance.height)
      for (let i = 0; i < snowflakes.length; i++) {
        const s = snowflakes[i]
        contextInstance.fillStyle = s.color
        contextInstance.beginPath()
        contextInstance.arc(s.x, s.y, s.radius, 0, Math.PI * 2, true)
        contextInstance.fill()
      }
      updateSnowflakes()
    }

    // --- 更新ロジック ---
    const updateSnowflakes = (): void => {
      for (let i = 0; i < snowflakes.length; i++) {
        const s = snowflakes[i]
        s.y += Math.pow(s.radius, 0.5) * 0.5 + 1
        s.x += Math.sin(s.density * 0.02) * s.radius * 0.1

        if (s.y > window.innerHeight + s.radius) {
          snowflakes[i].x = Math.random() * window.innerWidth
          snowflakes[i].y = -s.radius
        }

        if (s.x > window.innerWidth + s.radius) {
          snowflakes[i].x = -s.radius
        } else if (s.x < -s.radius) {
          snowflakes[i].x = window.innerWidth + s.radius
        }
      }
    }

    // --- アニメーションループ ---
    let animationFrameId = 0
    const animate = (): void => {
      drawSnowflakes()
      animationFrameId = requestAnimationFrame(animate)
    }

    // --- リサイズハンドラ ---
    const handleResize = (): void => {
      setCanvasSize()
      createSnowflakes()
    }

    // 初期化
    setCanvasSize()
    createSnowflakes()
    animate()
    window.addEventListener('resize', handleResize)

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[999]"
      aria-hidden
    />
  )
}

export default Snowfall
