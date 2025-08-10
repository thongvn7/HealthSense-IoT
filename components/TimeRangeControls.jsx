// components/TimeRangeControls.jsx
export default function TimeRangeControls({ range, setRange }) {
  const options = [
    { label: '24 giờ', val: 24 },
    { label: '7 ngày', val: 24 * 7 },
    { label: '30 ngày', val: 24 * 30 },
  ]

  return (
    <div className="controls">
      <div className="time-range">
        <span>Khoảng thời gian:</span>
        {options.map((btn) => (
          <button
            key={btn.val}
            onClick={() => setRange(btn.val)}
            className={`btn-range ${range === btn.val ? 'active' : ''}`}
            aria-pressed={range === btn.val}
            aria-label={`Chọn ${btn.label}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}


