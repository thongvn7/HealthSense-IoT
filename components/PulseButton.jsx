import { useEffect, useRef } from 'react'
import { useAnime } from '../hooks/useAnime.jsx'

const PulseButton = ({ 
  children, 
  onClick, 
  className = '', 
  pulseColor = 'rgba(0, 112, 243, 0.3)',
  ...props 
}) => {
  const buttonRef = useRef(null)
  const pulseRef = useRef(null)
  const { animate } = useAnime()

  useEffect(() => {
    if (pulseRef.current) {
      animate(pulseRef.current, {
        scale: [0, 1.5],
        opacity: [0.8, 0],
        duration: 2000,
        easing: 'easeOutCubic',
        loop: true,
        delay: 1000
      })
    }
  }, [animate])

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={onClick}
        className={`relative z-10 ${className}`}
        {...props}
      >
        {children}
      </button>
      <div
        ref={pulseRef}
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: pulseColor,
          transform: 'scale(0)',
          zIndex: 1
        }}
      />
    </div>
  )
}

export default PulseButton
