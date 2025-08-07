import { useState } from 'react'
import AnimatedElement from './AnimatedElement'
import LoadingSpinner from './LoadingSpinner'
import PulseButton from './PulseButton'
import FloatingActionButton from './FloatingActionButton'
import AnimatedProgressBar from './AnimatedProgressBar'

const AnimationShowcase = () => {
  const [progress, setProgress] = useState(0)
  const [showFAB, setShowFAB] = useState(false)

  const handleProgressChange = () => {
    setProgress(Math.random() * 100)
  }

  return (
    <div className="animation-showcase p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <AnimatedElement animation="fadeInUp" className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            🎨 Animation Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Khám phá các hiệu ứng animation đẹp mắt với Anime.js
          </p>
        </AnimatedElement>

        {/* Basic Animations */}
        <section className="mb-12">
          <AnimatedElement animation="fadeInUp" trigger="onScroll" className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">✨ Basic Animations</h2>
          </AnimatedElement>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedElement animation="fadeInUp" delay={100} trigger="onScroll" className="card hover-lift">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Fade In Up</h3>
                <p className="text-gray-600">Animation mượt mà từ dưới lên</p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fadeInLeft" delay={200} trigger="onScroll" className="card hover-lift">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Fade In Left</h3>
                <p className="text-gray-600">Animation từ trái sang phải</p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="scaleIn" delay={300} trigger="onScroll" className="card hover-lift">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Scale In</h3>
                <p className="text-gray-600">Animation phóng to từ nhỏ</p>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="bounceIn" delay={400} trigger="onScroll" className="card hover-lift">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Bounce In</h3>
                <p className="text-gray-600">Animation nảy lên xuống</p>
              </div>
            </AnimatedElement>
          </div>
        </section>

        {/* Interactive Components */}
        <section className="mb-12">
          <AnimatedElement animation="fadeInUp" trigger="onScroll" className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">🎮 Interactive Components</h2>
          </AnimatedElement>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedElement animation="fadeInLeft" trigger="onScroll" className="card">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Loading Spinner</h3>
                <div className="flex space-x-4">
                  <LoadingSpinner size="small" />
                  <LoadingSpinner size="medium" />
                  <LoadingSpinner size="large" />
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fadeInRight" trigger="onScroll" className="card">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Pulse Button</h3>
                <PulseButton 
                  onClick={() => alert('Pulse button clicked!')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Click Me!
                </PulseButton>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fadeInLeft" trigger="onScroll" className="card">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Progress Bar</h3>
                <AnimatedProgressBar 
                  progress={progress} 
                  showPercentage={true}
                  className="mb-4"
                />
                <button 
                  onClick={handleProgressChange}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Random Progress
                </button>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="fadeInRight" trigger="onScroll" className="card">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Floating Action Button</h3>
                <button 
                  onClick={() => setShowFAB(!showFAB)}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  {showFAB ? 'Hide' : 'Show'} FAB
                </button>
                {showFAB && (
                  <FloatingActionButton 
                    onClick={() => alert('FAB clicked!')}
                    position="bottom-right"
                  >
                    ➕
                  </FloatingActionButton>
                )}
              </div>
            </AnimatedElement>
          </div>
        </section>

        {/* CSS Animations */}
        <section className="mb-12">
          <AnimatedElement animation="fadeInUp" trigger="onScroll" className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">🎨 CSS Animations</h2>
          </AnimatedElement>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-md hover-lift">
              <div className="text-4xl mb-4 animate-heartbeat">❤️</div>
              <h3 className="text-lg font-semibold mb-2">Heartbeat</h3>
              <p className="text-gray-600">Hiệu ứng nhịp tim</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md hover-lift">
              <div className="text-4xl mb-4 animate-float">🦋</div>
              <h3 className="text-lg font-semibold mb-2">Float</h3>
              <p className="text-gray-600">Hiệu ứng bay lơ lửng</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md hover-lift">
              <div className="text-4xl mb-4 animate-shimmer">✨</div>
              <h3 className="text-lg font-semibold mb-2">Shimmer</h3>
              <p className="text-gray-600">Hiệu ứng lấp lánh</p>
            </div>
          </div>
        </section>

        {/* Hover Effects */}
        <section className="mb-12">
          <AnimatedElement animation="fadeInUp" trigger="onScroll" className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">🎯 Hover Effects</h2>
          </AnimatedElement>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-md hover-lift cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Hover Lift</h3>
              <p className="text-gray-600">Di chuột để thấy hiệu ứng nâng lên</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md hover-glow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Hover Glow</h3>
              <p className="text-gray-600">Di chuột để thấy hiệu ứng phát sáng</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md hover-scale cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Hover Scale</h3>
              <p className="text-gray-600">Di chuột để thấy hiệu ứng phóng to</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AnimationShowcase
