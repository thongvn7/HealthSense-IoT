import { useEffect, useRef } from 'react'
import { useAnime, animations } from '../hooks/useAnime.jsx'

const AnimatedElement = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0, 
  duration, 
  className = '', 
  style = {},
  trigger = 'onMount',
  threshold = 0.1,
  ...props 
}) => {
  const elementRef = useRef(null)
  const { animate } = useAnime()
  const hasAnimated = useRef(false)

  const runAnimation = () => {
    if (hasAnimated.current) return
    
    const animationConfig = typeof animation === 'string' 
      ? { ...animations[animation] }
      : animation
    
    if (duration) {
      animationConfig.duration = duration
    }
    
    if (delay) {
      animationConfig.delay = delay
    }
    
    try {
      animate(elementRef.current, animationConfig)
      hasAnimated.current = true
    } catch (error) {
      console.error('Animation error:', error)
    }
  }

  useEffect(() => {
    if (trigger === 'onMount') {
      runAnimation()
    } else if (trigger === 'onScroll') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              runAnimation()
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold }
      )
      
      if (elementRef.current) {
        observer.observe(elementRef.current)
      }
      
      return () => {
        if (elementRef.current) {
          observer.unobserve(elementRef.current)
        }
      }
    }
  }, [trigger, threshold, delay, duration, animate])

  return (
    <div 
      ref={elementRef}
      className={className}
      style={{ 
        opacity: trigger === 'onScroll' ? 0 : undefined,
        ...style 
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export default AnimatedElement
