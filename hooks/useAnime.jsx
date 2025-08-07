import { useEffect, useRef } from 'react'

export const useAnime = () => {
  const animeRef = useRef(null)

  const animate = (targets, options) => {
    if (animeRef.current) {
      animeRef.current.pause()
    }
    
    // Use CSS animations instead of animejs
    return cssAnimation(targets, options)
  }

  // CSS-based animation
  const cssAnimation = (targets, options) => {
    if (!targets) return null
    
    const elements = Array.isArray(targets) ? targets : [targets]
    
    elements.forEach(element => {
      if (element && element.style) {
        // Apply CSS transitions
        element.style.transition = `all ${options.duration || 800}ms ${options.easing || 'ease-out'}`
        
        // Apply initial state
        if (options.opacity) {
          element.style.opacity = options.opacity[0]
        }
        if (options.translateY) {
          element.style.transform = `translateY(${options.translateY[0]}px)`
        }
        if (options.translateX) {
          element.style.transform = `translateX(${options.translateX[0]}px)`
        }
        if (options.scale) {
          element.style.transform = `scale(${options.scale[0]})`
        }
        
        // Handle special cases
        if (options.rotate) {
          element.style.transform = `rotate(${options.rotate})`
        }
        
        // Handle loop animations
        if (options.loop) {
          const interval = setInterval(() => {
            if (options.scale) {
              element.style.transform = `scale(${options.scale[1] || 1.1})`
              setTimeout(() => {
                element.style.transform = `scale(${options.scale[0] || 1})`
              }, options.duration / 2)
            }
            if (options.translateY) {
              element.style.transform = `translateY(${options.translateY[1] || -10}px)`
              setTimeout(() => {
                element.style.transform = `translateY(${options.translateY[0] || 0}px)`
              }, options.duration / 2)
            }
          }, options.duration)
          
          // Store interval for cleanup
          element._animationInterval = interval
        } else {
          // Trigger animation
          setTimeout(() => {
            if (options.opacity) {
              element.style.opacity = options.opacity[options.opacity.length - 1]
            }
            if (options.translateY) {
              element.style.transform = `translateY(${options.translateY[options.translateY.length - 1]}px)`
            }
            if (options.translateX) {
              element.style.transform = `translateX(${options.translateX[options.translateX.length - 1]}px)`
            }
            if (options.scale) {
              element.style.transform = `scale(${options.scale[options.scale.length - 1]})`
            }
          }, options.delay || 0)
        }
      }
    })
    
    return { 
      pause: () => {
        elements.forEach(element => {
          if (element && element.style) {
            element.style.transition = 'none'
            if (element._animationInterval) {
              clearInterval(element._animationInterval)
              delete element._animationInterval
            }
          }
        })
      }
    }
  }

  const stop = () => {
    if (animeRef.current) {
      animeRef.current.pause()
    }
  }

  useEffect(() => {
    return () => {
      if (animeRef.current) {
        animeRef.current.pause()
      }
    }
  }, [])

  return { animate, stop }
}

// Predefined animations
export const animations = {
  fadeInUp: {
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 800,
    easing: 'easeOutCubic'
  },
  
  fadeInLeft: {
    opacity: [0, 1],
    translateX: [-50, 0],
    duration: 800,
    easing: 'easeOutCubic'
  },
  
  fadeInRight: {
    opacity: [0, 1],
    translateX: [50, 0],
    duration: 800,
    easing: 'easeOutCubic'
  },
  
  scaleIn: {
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 600,
    easing: 'easeOutBack'
  },
  
  bounceIn: {
    opacity: [0, 1],
    scale: [0.3, 1.1, 1],
    duration: 1000,
    easing: 'easeOutBounce'
  },
  
  slideInUp: {
    opacity: [0, 1],
    translateY: [100, 0],
    duration: 1000,
    easing: 'easeOutQuart'
  },
  
  pulse: {
    scale: [1, 1.05, 1],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true
  },
  
  heartbeat: {
    scale: [1, 1.1, 1],
    duration: 1000,
    easing: 'easeInOutSine',
    loop: true
  },
  
  float: {
    translateY: [0, -10, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true
  },
  
  shimmer: {
    backgroundPosition: ['-200% 0', '200% 0'],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true
  }
}
