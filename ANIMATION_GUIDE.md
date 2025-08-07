# 🎨 Animation Guide - HealthMonitor

Hướng dẫn sử dụng các hiệu ứng animation đẹp mắt với Anime.js trong dự án HealthMonitor.

## 📦 Cài đặt

Các package đã được cài đặt:
```bash
npm install animejs @types/animejs
```

## 🎯 Các Component Animation

### 1. AnimatedElement
Component cơ bản để tạo animation cho bất kỳ element nào.

```jsx
import AnimatedElement from '../components/AnimatedElement'

<AnimatedElement 
  animation="fadeInUp" 
  delay={200} 
  trigger="onScroll"
  className="my-class"
>
  <div>Nội dung cần animate</div>
</AnimatedElement>
```

**Props:**
- `animation`: Loại animation (fadeInUp, fadeInLeft, scaleIn, bounceIn, etc.)
- `delay`: Độ trễ trước khi bắt đầu animation (ms)
- `trigger`: Khi nào trigger animation ('onMount' hoặc 'onScroll')
- `threshold`: Ngưỡng hiển thị cho scroll trigger (0-1)

### 2. LoadingSpinner
Spinner loading với animation xoay.

```jsx
import LoadingSpinner from '../components/LoadingSpinner'

<LoadingSpinner size="medium" color="#0070f3" />
```

**Props:**
- `size`: Kích thước ('small', 'medium', 'large')
- `color`: Màu sắc của spinner

### 3. PulseButton
Button với hiệu ứng pulse animation.

```jsx
import PulseButton from '../components/PulseButton'

<PulseButton 
  onClick={handleClick}
  pulseColor="rgba(0, 112, 243, 0.3)"
  className="btn-primary"
>
  Click Me!
</PulseButton>
```

### 4. FloatingActionButton
Button nổi với animation float.

```jsx
import FloatingActionButton from '../components/FloatingActionButton'

<FloatingActionButton 
  onClick={handleClick}
  position="bottom-right"
>
  ➕
</FloatingActionButton>
```

**Props:**
- `position`: Vị trí ('bottom-right', 'bottom-left', 'top-right', 'top-left')

### 5. AnimatedProgressBar
Progress bar với animation smooth.

```jsx
import AnimatedProgressBar from '../components/AnimatedProgressBar'

<AnimatedProgressBar 
  progress={75} 
  max={100}
  showPercentage={true}
  progressColor="#0070f3"
/>
```

## 🎨 Các Animation Có Sẵn

### Basic Animations
- `fadeInUp`: Fade in từ dưới lên
- `fadeInLeft`: Fade in từ trái sang
- `fadeInRight`: Fade in từ phải sang
- `scaleIn`: Scale từ nhỏ đến lớn
- `bounceIn`: Bounce animation
- `slideInUp`: Slide từ dưới lên
- `pulse`: Pulse animation
- `heartbeat`: Heartbeat animation
- `float`: Float animation
- `shimmer`: Shimmer effect

### Custom Animation
Bạn có thể tạo animation tùy chỉnh:

```jsx
const customAnimation = {
  opacity: [0, 1],
  translateY: [50, 0],
  scale: [0.8, 1],
  duration: 1000,
  easing: 'easeOutCubic'
}

<AnimatedElement animation={customAnimation}>
  Content
</AnimatedElement>
```

## 🎯 CSS Classes

### Animation Classes
- `.animate-shimmer`: Shimmer effect
- `.animate-heartbeat`: Heartbeat animation
- `.animate-float`: Float animation
- `.animate-bounce`: Bounce animation
- `.animate-slide-in-left`: Slide in from left
- `.animate-slide-in-right`: Slide in from right
- `.animate-fade-in-scale`: Fade in with scale
- `.animate-rotate-in`: Rotate in animation

### Hover Effects
- `.hover-lift`: Lift effect on hover
- `.hover-glow`: Glow effect on hover
- `.hover-scale`: Scale effect on hover

### Utility Classes
- `.gradient-text`: Gradient text effect
- `.glass`: Glass morphism effect
- `.smooth-transition`: Smooth transitions
- `.focus-ring`: Focus ring effect

## 📱 Responsive Animations

Tất cả animation đều responsive và tôn trọng user preference:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations for users who prefer reduced motion */
}
```

## 🚀 Sử dụng trong Components

### Ví dụ với Landing Page
```jsx
// Header với animation
<AnimatedElement animation="fadeInLeft" className="logo">
  <h2>💓 HealthMonitor</h2>
</AnimatedElement>

// Hero content với delay
<AnimatedElement animation="fadeInUp" delay={200} className="hero-content">
  <h1>Theo dõi sức khỏe thông minh với AI</h1>
</AnimatedElement>

// Feature cards với scroll trigger
<AnimatedElement animation="fadeInUp" delay={100} trigger="onScroll" className="feature-card">
  <div className="feature-icon">📡</div>
  <h3>Thu thập dữ liệu thời gian thực</h3>
</AnimatedElement>
```

### Ví dụ với Dashboard
```jsx
// Stats với number animation
<AnimatedElement animation="fadeInUp" delay={100} className="stat-card">
  <div className="stat-value" data-value={avgBpm}>0</div> BPM
</AnimatedElement>

// Chart container
<AnimatedElement animation="scaleIn" trigger="onScroll" className="chart-container">
  <Line data={chartData} options={chartOptions} />
</AnimatedElement>
```

## 🎨 Demo Page

Truy cập `/animation-demo` để xem tất cả các animation trong action.

## 🔧 Tùy chỉnh

### Thêm Animation Mới
1. Thêm vào `hooks/useAnime.js`:
```js
export const animations = {
  // ... existing animations
  myCustomAnimation: {
    opacity: [0, 1],
    translateX: [-100, 0],
    duration: 800,
    easing: 'easeOutCubic'
  }
}
```

2. Sử dụng:
```jsx
<AnimatedElement animation="myCustomAnimation">
  Content
</AnimatedElement>
```

### Thêm CSS Animation
1. Thêm vào `styles/animations.css`:
```css
@keyframes myAnimation {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.animate-my-animation {
  animation: myAnimation 0.5s ease-out;
}
```

2. Sử dụng:
```jsx
<div className="animate-my-animation">
  Content
</div>
```

## 📝 Best Practices

1. **Performance**: Sử dụng `transform` và `opacity` thay vì thay đổi layout
2. **Accessibility**: Tôn trọng `prefers-reduced-motion`
3. **Timing**: Sử dụng delay hợp lý để tạo flow tự nhiên
4. **Consistency**: Giữ nhất quán về timing và easing
5. **Mobile**: Test trên mobile để đảm bảo performance

## 🎯 Tips

- Sử dụng `trigger="onScroll"` cho content dài
- Kết hợp `delay` để tạo sequence animation
- Sử dụng `threshold` để control khi nào animation trigger
- Test trên các device khác nhau
- Monitor performance với DevTools

---

**Happy Animating! 🎨✨**
