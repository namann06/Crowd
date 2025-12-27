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
 * Shows crowd analytics:
 * - Hourly trend chart
 * - Heatmap-style area visualization
 * - Simple prediction using moving average
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
        
        // Calculate simple prediction (moving average of last 3 hours)
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
        // Use mock data for demo
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

  // Get heat intensity class (0-10) based on occupancy
  const getHeatClass = (area) => {
    const occupancy = (area.currentCount / area.capacity) * 100
    if (occupancy >= 100) return 'bg-red-600'
    if (occupancy >= 90) return 'bg-red-500'
    if (occupancy >= 80) return 'bg-orange-500'
    if (occupancy >= 70) return 'bg-orange-400'
    if (occupancy >= 60) return 'bg-yellow-500'
    if (occupancy >= 50) return 'bg-yellow-400'
    if (occupancy >= 40) return 'bg-green-400'
    if (occupancy >= 30) return 'bg-green-500'
    if (occupancy >= 20) return 'bg-green-600'
    return 'bg-green-700'
  }

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />
  }

  const selectedArea = areas.find(a => a.id === selectedAreaId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={selectedAreaId || ''}
          onChange={(e) => setSelectedAreaId(Number(e.target.value))}
          className="input w-64"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Current Count</p>
            <p className="text-3xl font-bold text-blue-600">{selectedArea.currentCount}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Capacity</p>
            <p className="text-3xl font-bold text-gray-600">{selectedArea.capacity}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Occupancy</p>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round((selectedArea.currentCount / selectedArea.capacity) * 100)}%
            </p>
          </div>
          <div className="card border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Predicted (Next Hour)</p>
            <p className="text-3xl font-bold text-blue-700">
              {prediction !== null ? prediction : '—'}
            </p>
            <p className="text-xs text-gray-500">Based on moving average</p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Hourly Trend</h3>
        <div className="h-80">
          <Line
            data={{
              labels: trendData.map(d => d.hour),
              datasets: [
                {
                  label: 'Entries',
                  data: trendData.map(d => d.entries),
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  tension: 0.3,
                },
                {
                  label: 'Exits',
                  data: trendData.map(d => d.exits),
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.3,
                },
                {
                  label: 'Total Count',
                  data: trendData.map(d => d.count),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 3,
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Area Heatmap</h3>
        <p className="text-sm text-gray-600 mb-4">
          Color intensity represents occupancy level (darker = more crowded)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => (
            <div
              key={area.id}
              className={`${getHeatClass(area)} rounded-xl p-4 text-white transition-all hover:scale-105 cursor-pointer`}
              onClick={() => setSelectedAreaId(area.id)}
            >
              <h4 className="font-semibold truncate">{area.name}</h4>
              <p className="text-3xl font-bold my-2">{area.currentCount}</p>
              <p className="text-sm opacity-90">
                of {area.capacity} ({Math.round((area.currentCount / area.capacity) * 100)}%)
              </p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Low</span>
          <div className="flex gap-1">
            {['bg-green-700', 'bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-red-600'].map((color, i) => (
              <div key={i} className={`w-8 h-4 ${color} rounded`}></div>
            ))}
          </div>
          <span className="text-sm text-gray-600">High</span>
        </div>
      </div>

      {/* Prediction Info */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📊 Prediction Method
        </h3>
        <p className="text-sm text-blue-800">
          The prediction uses a <strong>Simple Moving Average (SMA)</strong> of the last 3 hours 
          of crowd data to estimate the next hour's count. This provides a basic but effective 
          forecast for crowd planning.
        </p>
      </div>
    </div>
  )
}

export default Analytics
