// components/StatsCards.jsx
export default function StatsCards({ records, rangeHours }) {
  const toMs = (ts) => (!ts ? 0 : ts < 1e12 ? ts * 1000 : ts)
  const nowMs = Date.now()
  const cutoffMs = nowMs - rangeHours * 3600 * 1000
  const filtered = (records || []).filter((r) => toMs(r.ts) >= cutoffMs)

  const avgBpm = filtered.length > 0
    ? Math.round(filtered.reduce((sum, r) => sum + (r.heart_rate ?? r.bpm ?? 0), 0) / filtered.length)
    : 0
  const avgSpo2 = filtered.length > 0
    ? Math.round((filtered.reduce((sum, r) => sum + (r.spo2 ?? 0), 0) / filtered.length) * 10) / 10
    : 0

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">❤️</div>
        <div className="stat-content">
          <div className="stat-value" data-value={avgBpm}>0</div> BPM
          <div className="stat-label">Nhịp tim trung bình</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🫁</div>
        <div className="stat-content">
          <div className="stat-value" data-value={avgSpo2}>0</div>%
          <div className="stat-label">SpO₂ trung bình</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">Số lần đo</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⏱️</div>
        <div className="stat-content">
          <div className="stat-value">{rangeHours}h</div>
          <div className="stat-label">Khoảng thời gian</div>
        </div>
      </div>
    </div>
  )
}


