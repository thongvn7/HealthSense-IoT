import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import { useRouter } from 'next/router'
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { database } from '../lib/firebase'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const { isAdmin } = useAdmin()
  const router = useRouter()
  const [records, setRecords] = useState([])
  const [range, setRange] = useState(24) // hours
  const [dataLoading, setDataLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/landing')
    }
  }, [user, loading, router])

  // Fetch user's health data
  useEffect(() => {
    if (!user) return

    setDataLoading(true)
    
    // Query records for current user
    const recordsRef = ref(database, 'records')
    const userRecordsQuery = query(
      recordsRef,
      orderByChild('userId'),
      equalTo(user.uid)
    )

    const unsubscribe = onValue(userRecordsQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const recordsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }))
        // Sort by timestamp descending
        recordsArray.sort((a, b) => (b.ts || 0) - (a.ts || 0))
        setRecords(recordsArray)
      } else {
        setRecords([])
      }
      setDataLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/landing')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div>Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  // Filter records by time range
  const now = Date.now() / 1000
  const cutoff = now - range * 3600
  const filtered = records.filter(r => (r.ts || 0) >= cutoff)

  // Prepare chart data
  const labels = filtered.map(r => new Date((r.ts || 0) * 1000))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nhịp tim (BPM)',
        data: filtered.map(r => r.bpm || 0),
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        yAxisID: 'y1',
        tension: 0.4
      },
      {
        label: 'SpO₂ (%)',
        data: filtered.map(r => r.spo2 || 0),
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        yAxisID: 'y2',
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: range <= 24 ? 'hour' : range <= 168 ? 'day' : 'week'
        },
        title: {
          display: true,
          text: 'Thời gian'
        }
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Nhịp tim (BPM)'
        },
        min: 50,
        max: 120
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'SpO₂ (%)'
        },
        min: 90,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Biểu đồ theo dõi sức khỏe'
      },
      legend: {
        display: true,
        position: 'top'
      }
    }
  }

  // Calculate average values
  const avgBpm = filtered.length > 0 
    ? Math.round(filtered.reduce((sum, r) => sum + (r.bpm || 0), 0) / filtered.length)
    : 0
  const avgSpo2 = filtered.length > 0
    ? Math.round(filtered.reduce((sum, r) => sum + (r.spo2 || 0), 0) / filtered.length * 10) / 10
    : 0

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1>💓 Dashboard Sức khỏe</h1>
          <div className="user-info">
            <span>Xin chào, {user.email}</span>
            <button 
              onClick={() => router.push('/device-setup')}
              className="btn-setup"
            >
              Thiết bị
            </button>
            {isAdmin && (
              <button 
                onClick={() => router.push('/admin')}
                className="btn-admin"
              >
                Admin Panel
              </button>
            )}
            <button onClick={handleLogout} className="btn-logout">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-value">{avgBpm} BPM</div>
              <div className="stat-label">Nhịp tim trung bình</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🫁</div>
            <div className="stat-content">
              <div className="stat-value">{avgSpo2}%</div>
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
              <div className="stat-value">{range}h</div>
              <div className="stat-label">Khoảng thời gian</div>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="controls">
          <div className="time-range">
            <span>Khoảng thời gian:</span>
            {[
              { label: '24 giờ', val: 24 },
              { label: '7 ngày', val: 24 * 7 },
              { label: '30 ngày', val: 24 * 30 }
            ].map(btn => (
              <button
                key={btn.val}
                onClick={() => setRange(btn.val)}
                className={`btn-range ${range === btn.val ? 'active' : ''}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="chart-container">
          {dataLoading ? (
            <div className="chart-loading">
              <div>Đang tải dữ liệu...</div>
            </div>
          ) : filtered.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="no-data">
              <div className="no-data-icon">📈</div>
              <h3>Chưa có dữ liệu</h3>
              <p>Chưa có dữ liệu sức khỏe trong khoảng thời gian này.</p>
              <p>Hãy kết nối thiết bị ESP32 để bắt đầu thu thập dữ liệu.</p>
            </div>
          )}
        </div>

        {/* Health Insights */}
        {filtered.length > 0 && (
          <div className="insights">
            <h3>📋 Nhận xét sức khỏe</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Nhịp tim</h4>
                <p>
                  {avgBpm < 60 
                    ? '⚠️ Nhịp tim hơi chậm. Nên tham khảo ý kiến bác sĩ.'
                    : avgBpm > 100
                    ? '⚠️ Nhịp tim hơi nhanh. Hãy nghỉ ngơi và thư giãn.'
                    : '✅ Nhịp tim trong giới hạn bình thường.'
                  }
                </p>
              </div>
              
              <div className="insight-card">
                <h4>SpO₂</h4>
                <p>
                  {avgSpo2 < 95
                    ? '⚠️ Nồng độ oxy trong máu thấp. Cần kiểm tra sức khỏe.'
                    : '✅ Nồng độ oxy trong máu tốt.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 1rem 0;
          margin-bottom: 2rem;
        }

        .header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          color: #333;
          margin: 0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info span {
          color: #666;
        }

        .btn-logout, .btn-setup, .btn-admin {
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s;
          font-weight: 500;
        }

        .btn-logout {
          background: #dc3545;
          color: white;
        }

        .btn-logout:hover {
          background: #c82333;
        }

        .btn-setup {
          background: #28a745;
          color: white;
          margin-right: 0.5rem;
        }
        
        .btn-admin {
          background: #6f42c1;
          color: white;
          margin-right: 0.5rem;
        }
        
        .btn-admin:hover {
          background: #5a32a3;
        }

        .btn-setup:hover {
          background: #218838;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: #666;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        .controls {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .time-range span {
          font-weight: 500;
          color: #333;
        }

        .btn-range {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #495057;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-range:hover {
          background: #e9ecef;
        }

        .btn-range.active {
          background: #0070f3;
          color: white;
          border-color: #0070f3;
        }

        .chart-container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .chart-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
          color: #666;
        }

        .no-data {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .no-data-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-data h3 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .insights {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .insights h3 {
          color: #333;
          margin-bottom: 1.5rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .insight-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #0070f3;
        }

        .insight-card h4 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .insight-card p {
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .header .container {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .time-range {
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
