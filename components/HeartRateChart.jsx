// components/HeartRateChart.jsx
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function HeartRateChart({ records, rangeHours }) {
  const toMs = (ts) => (!ts ? 0 : ts < 1e12 ? ts * 1000 : ts)
  const nowMs = Date.now()
  const cutoffMs = nowMs - rangeHours * 3600 * 1000
  const filtered = (records || []).filter((r) => toMs(r.ts) >= cutoffMs)

  const labels = filtered.map((r) => new Date(toMs(r.ts)))

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nhịp tim (BPM)',
        data: filtered.map((r) => r.heart_rate ?? r.bpm ?? 0),
        borderColor: '#ff6b6b',
        backgroundColor: (ctx) => {
          const { ctx: gctx, chartArea } = ctx.chart
          if (!chartArea) return 'rgba(255, 107, 107, 0.1)'
          const gradient = gctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(255, 107, 107, 0.25)')
          gradient.addColorStop(1, 'rgba(255, 107, 107, 0.02)')
          return gradient
        },
        fill: 'origin',
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        type: 'time',
        time: { unit: rangeHours <= 24 ? 'hour' : rangeHours <= 168 ? 'day' : 'week' },
        title: { display: true, text: 'Thời gian' },
        grid: { display: false }
      },
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Nhịp tim (BPM)' },
        min: 50,
        max: 120,
        ticks: { stepSize: 10 },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (items) => items?.[0]?.label || '',
          label: (item) => `${item.dataset.label}: ${item.formattedValue}`
        }
      }
    }
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">💓 Nhịp tim (BPM)</h3>
      </div>
      {filtered.length > 0 ? (
        <div style={{ height: 360 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">📈</div>
          <h3>Chưa có dữ liệu</h3>
          <p>Chưa có dữ liệu nhịp tim trong khoảng thời gian này.</p>
        </div>
      )}
    </div>
  )
}


