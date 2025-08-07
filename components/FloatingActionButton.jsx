import { useEffect, useRef } from 'react'
import { useAnime } from '../hooks/useAnime.jsx'

const FloatingActionButton = ({ 
  children, 
  onClick, 
  className = '', 
  position = 'bottom-right',
  ...props 
}) => {
  const buttonRef = useRef(null)
  const { animate } = useAnime()

  useEffect(() => {
    if (buttonRef.current) {
      animate(buttonRef.current, {
        translateY: [0, -10, 0],
        duration: 3000,
        easing: 'easeInOutSine',
        loop: true
      })
    }
  }, [animate])

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`fixed ${positionClasses[position]} z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default FloatingActionButton
