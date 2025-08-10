const LoadingSpinner = ({ size = 'medium', color = '#0070f3' }) => {
  const sizePx = { small: 24, medium: 32, large: 48 }
  const dimension = sizePx[size] || sizePx.medium

  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <style jsx>{`
        .spinner-wrap { display: flex; align-items: center; justify-content: center; }
        .spinner {
          width: ${dimension}px;
          height: ${dimension}px;
          border: 4px solid #e5e7eb;
          border-top-color: ${color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default LoadingSpinner
