import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import areaService from '../services/areaService'
import scanService from '../services/scanService'
import LoadingSpinner from '../components/LoadingSpinner'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

/**
 * Analytics Page
 * --------------
 * Apple-inspired minimalist analytics with monochrome charts.
 */
function Analytics() {
  const [areas, setAreas] = useState([])
  const [selectedAreaId, setSelectedAreaId] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areaService.getAllAreas()
        setAreas(data)
        if (data.length > 0) {
          setSelectedAreaId(data[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch areas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAreas()
  }, [])

  // Fetch trend data when area is selected
  useEffect(() => {
    if (!selectedAreaId) return

    const fetchTrends = async () => {
      try {
        const data = await scanService.getHourlyTrend(selectedAreaId)
        setTrendData(data)
        
        if (data.length >= 3) {
          const lastThree = data.slice(-3)
          const avg = Math.round(
            lastThree.reduce((sum, d) => sum + d.count, 0) / 3
          )
          setPrediction(avg)
        } else {
          setPrediction(null)
        }
      } catch (err) {
        console.error('Failed to fetch trends:', err)
        setTrendData(generateMockTrendData())
      }
    }
    fetchTrends()
  }, [selectedAreaId])

  // Generate mock trend data for demo
  const generateMockTrendData = () => {
    const hours = []
    const now = new Date()
    for (let i = 12; i >= 0; i--) {
      const hour = new Date(now - i * 3600000)
      hours.push({
        hour: hour.getHours() + ':00',
        entries: Math.floor(Math.random() * 50) + 10,
        exits: Math.floor(Math.random() * 40) + 5,
        count: Math.floor(Math.random() * 100) + 20
      })
    }
    return hours
  }

  // Get heat intensity based on occupancy (monochrome)
  const getHeatIntensity = (area) => {
    const occupancy = (area.currentCount / area.capacity) * 100
    if (occupancy >= 90) return 'bg-neutral-900 text-white'
    if (occupancy >= 70) return 'bg-neutral-700 text-white'
    if (occupancy >= 50) return 'bg-neutral-500 text-white'
    if (occupancy >= 30) return 'bg-neutral-300 text-neutral-800'
    return 'bg-neutral-100 text-neutral-800'
  }

  // Monochrome chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif',
            size: 11,
            weight: '500'
          },
          color: '#525252'
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif', size: 10 },
          color: '#737373'
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f5f5f5' },
        ticks: {
          font: { family: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif', size: 10 },
          color: '#737373'
        }
      }
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 3, hoverRadius: 5 }
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />
  }

  const selectedArea = areas.find(a => a.id === selectedAreaId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-neutral-500 mt-1">Crowd trends and predictions</p>
        </div>
        <select
          value={selectedAreaId || ''}
          onChange={(e) => setSelectedAreaId(Number(e.target.value))}
          className="input w-56"
        >
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      {selectedArea && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">Current Count</p>
            <p className="stat-value">{selectedArea.currentCount}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Capacity</p>
            <p className="stat-value">{selectedArea.capacity}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Occupancy</p>
            <p className="stat-value">
              {Math.round((selectedArea.currentCount / selectedArea.capacity) * 100)}%
            </p>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #171717' }}>
            <p className="stat-label">Predicted Next Hour</p>
            <p className="stat-value">
              {prediction !== null ? prediction : '—'}
            </p>
            <p className="stat-meta">Moving average</p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">Hourly Trend</h3>
        <div className="h-72">
          <Line
            data={{
              labels: trendData.map(d => d.hour),
              datasets: [
                {
                  label: 'Entries',
                  data: trendData.map(d => d.entries),
                  borderColor: '#a3a3a3',
                  backgroundColor: 'rgba(163, 163, 163, 0.1)',
                  borderWidth: 2,
                },
                {
                  label: 'Exits',
                  data: trendData.map(d => d.exits),
                  borderColor: '#d4d4d4',
                  backgroundColor: 'rgba(212, 212, 212, 0.1)',
                  borderWidth: 2,
                },
                {
                  label: 'Total Count',
                  data: trendData.map(d => d.count),
                  borderColor: '#171717',
                  backgroundColor: 'rgba(23, 23, 23, 0.05)',
                  borderWidth: 2.5,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Area Density</h3>
        <p className="text-sm text-neutral-500 mb-6">
          Intensity represents current occupancy level
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => (
            <div
              key={area.id}
              className={`${getHeatIntensity(area)} rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer`}
              onClick={() => setSelectedAreaId(area.id)}
            >
              <h4 className="font-medium text-sm truncate">{area.name}</h4>
              <p className="text-2xl font-semibold my-2 tracking-tight">{area.currentCount}</p>
              <p className="text-xs opacity-75">
                of {area.capacity} ({Math.round((area.currentCount / area.capacity) * 100)}%)
              </p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-xs text-neutral-500">Low</span>
          <div className="flex gap-1">
            {['bg-neutral-100', 'bg-neutral-300', 'bg-neutral-500', 'bg-neutral-700', 'bg-neutral-900'].map((color, i) => (
              <div key={i} className={`w-6 h-3 ${color} rounded`}></div>
            ))}
          </div>
          <span className="text-xs text-neutral-500">High</span>
        </div>
      </div>

      {/* Prediction Method Info */}
      <div className="card bg-neutral-50 border-neutral-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">
              Prediction Method
            </h3>
            <p className="text-sm text-neutral-600">
              Predictions use a <strong>Simple Moving Average</strong> of the last 3 hours 
              to estimate the next hour's crowd count.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
