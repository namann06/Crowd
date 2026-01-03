import { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import areaService from '../services/areaService'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

/**
 * Dashboard Page
 * --------------
 * Apple-inspired minimalist dashboard with:
 * - Clean stat cards
 * - Monochrome charts
 * - Subtle shadows and borders
 */
function Dashboard() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Polling interval for real-time updates (5 seconds)
  const POLL_INTERVAL = 5000

  // Fetch areas data
  const fetchAreas = async () => {
    try {
      const data = await areaService.getAllAreas()
      setAreas(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch areas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and polling setup
  useEffect(() => {
    fetchAreas()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAreas, POLL_INTERVAL)
    
    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])

  // Calculate summary stats
  const totalPeople = areas.reduce((sum, a) => sum + a.currentCount, 0)
  const totalCapacity = areas.reduce((sum, a) => sum + a.capacity, 0)
  const areasAtWarning = areas.filter(a => a.status === 'YELLOW').length
  const areasAtCritical = areas.filter(a => a.status === 'RED').length
  const occupancyRate = totalCapacity > 0 ? Math.round((totalPeople / totalCapacity) * 100) : 0

  // Status distribution counts
  const statusCounts = {
    GREEN: areas.filter(a => a.status === 'GREEN').length,
    YELLOW: areas.filter(a => a.status === 'YELLOW').length,
    RED: areas.filter(a => a.status === 'RED').length
  }

  // Monochrome chart theme
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
            size: 12,
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
          font: { family: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif', size: 11 },
          color: '#737373'
        }
      },
      y: {
        grid: { color: '#f5f5f5' },
        ticks: {
          font: { family: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif', size: 11 },
          color: '#737373'
        }
      }
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-neutral-500 mb-4">{error}</p>
        <button onClick={fetchAreas} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Real-time crowd monitoring overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 bg-neutral-900 rounded-full animate-pulse"></span>
          Live • Updates every 5s
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total People */}
        <div className="stat-card">
          <p className="stat-label">Total People</p>
          <p className="stat-value">{totalPeople.toLocaleString()}</p>
          <p className="stat-meta">of {totalCapacity.toLocaleString()} capacity</p>
        </div>

        {/* Active Areas */}
        <div className="stat-card">
          <p className="stat-label">Active Areas</p>
          <p className="stat-value">{areas.length}</p>
          <p className="stat-meta">being monitored</p>
        </div>

        {/* Warning Areas */}
        <div className="stat-card">
          <p className="stat-label">At Threshold</p>
          <p className="stat-value">{areasAtWarning}</p>
          <p className="stat-meta">{areasAtWarning === 1 ? 'area' : 'areas'} at warning</p>
        </div>

        {/* Critical Areas */}
        <div className="stat-card" style={{ borderLeft: areasAtCritical > 0 ? '3px solid #171717' : undefined }}>
          <p className="stat-label">Critical</p>
          <p className="stat-value">{areasAtCritical}</p>
          <p className="stat-meta">{areasAtCritical === 1 ? 'area' : 'areas'} at capacity</p>
        </div>
      </div>

      {/* Occupancy Overview Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-neutral-600">Overall Occupancy</span>
          <span className="text-sm font-semibold text-neutral-900">{occupancyRate}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-bar-fill ${occupancyRate >= 90 ? 'critical' : occupancyRate >= 70 ? 'warning' : ''}`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Crowd Count per Area */}
        <div className="lg:col-span-2 card">
          <h3 className="text-base font-semibold text-neutral-900 mb-6">Crowd Distribution</h3>
          <div className="h-72">
            <Bar
              data={{
                labels: areas.map(a => a.name.length > 12 ? a.name.substring(0, 12) + '...' : a.name),
                datasets: [
                  {
                    label: 'Current',
                    data: areas.map(a => a.currentCount),
                    backgroundColor: '#0f172a',
                    borderRadius: 4,
                  },
                  {
                    label: 'Capacity',
                    data: areas.map(a => a.capacity),
                    backgroundColor: '#cbd5e1',
                    borderRadius: 4,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Doughnut Chart - Status Distribution */}
        <div className="card">
          <h3 className="text-base font-semibold text-neutral-900 mb-6">Status Overview</h3>
          <div className="h-72 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Safe', 'Warning', 'Critical'],
                datasets: [
                  {
                    data: [statusCounts.GREEN, statusCounts.YELLOW, statusCounts.RED],
                    backgroundColor: ['#cbd5e1', '#64748b', '#0f172a'],
                    borderWidth: 0,
                    cutout: '70%',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 16,
                      font: {
                        family: '-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif',
                        size: 11,
                        weight: '500'
                      },
                      color: '#525252'
                    }
                  }
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Areas Table */}
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-6">All Areas</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Current</th>
                <th>Threshold</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => {
                const occupancy = Math.round((area.currentCount / area.capacity) * 100)
                return (
                  <tr key={area.id}>
                    <td className="font-medium text-neutral-900">{area.name}</td>
                    <td>{area.currentCount}</td>
                    <td>{area.threshold}</td>
                    <td>{area.capacity}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-20 progress-bar">
                          <div
                            className={`progress-bar-fill ${
                              area.status === 'RED' ? 'critical' :
                              area.status === 'YELLOW' ? 'warning' : ''
                            }`}
                            style={{ width: `${Math.min(occupancy, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-neutral-500 w-8">{occupancy}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={area.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
