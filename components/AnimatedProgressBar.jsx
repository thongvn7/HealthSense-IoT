import { useEffect, useRef } from 'react'
import { useAnime } from '../hooks/useAnime.jsx'

const AnimatedProgressBar = ({ 
  progress = 0, 
  max = 100, 
  height = '8px',
  backgroundColor = '#e5e7eb',
  progressColor = '#0070f3',
  showPercentage = false,
  className = '',
  duration = 1000
}) => {
  const progressRef = useRef(null)
  const percentageRef = useRef(null)
  const { animate } = useAnime()

  useEffect(() => {
    const percentage = (progress / max) * 100
    
    if (progressRef.current) {
      animate(progressRef.current, {
        width: [`${progressRef.current.style.width || '0%'}`, `${percentage}%`],
        duration,
        easing: 'easeOutCubic'
      })
    }

    if (percentageRef.current && showPercentage) {
      animate(percentageRef.current, {
        innerHTML: [0, Math.round(percentage)],
        duration,
        easing: 'easeOutCubic',
        round: 1
      })
    }
  }, [progress, max, animate, duration, showPercentage])

  return (
    <div className={`relative ${className}`}>
      <div 
        className="w-full rounded-full overflow-hidden"
        style={{ 
          height, 
          backgroundColor 
        }}
      >
        <div
          ref={progressRef}
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: progressColor,
            width: '0%'
          }}
        />
      </div>
      {showPercentage && (
        <div 
          ref={percentageRef}
          className="absolute top-0 right-0 text-sm font-medium"
          style={{ color: progressColor }}
        >
          0%
        </div>
      )}
    </div>
  )
}

export default AnimatedProgressBar
