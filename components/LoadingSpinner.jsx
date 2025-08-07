import { useEffect, useRef } from 'react'
import { useAnime } from '../hooks/useAnime.jsx'

const LoadingSpinner = ({ size = 'medium', color = '#0070f3' }) => {
  const spinnerRef = useRef(null)
  const { animate } = useAnime()

  useEffect(() => {
    if (spinnerRef.current) {
      animate(spinnerRef.current, {
        rotate: '360deg',
        duration: 1000,
        easing: 'linear',
        loop: true
      })
    }
  }, [animate])

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center">
      <div
        ref={spinnerRef}
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-current rounded-full`}
        style={{ borderTopColor: color }}
      />
    </div>
  )
}

export default LoadingSpinner
