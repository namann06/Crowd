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
 * Main dashboard showing:
 * - Summary statistics
 * - Area status overview
 * - Crowd count bar chart
 * - Status distribution pie chart
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

  // Data for bar chart
  const chartData = areas.map(a => ({
    name: a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name,
    current: a.currentCount,
    capacity: a.capacity,
    threshold: a.threshold
  }))

  // Data for pie chart (status distribution)
  const statusCounts = {
    GREEN: areas.filter(a => a.status === 'GREEN').length,
    YELLOW: areas.filter(a => a.status === 'YELLOW').length,
    RED: areas.filter(a => a.status === 'RED').length
  }
  const pieData = [
    { name: 'Safe', value: statusCounts.GREEN, color: '#22c55e' },
    { name: 'Warning', value: statusCounts.YELLOW, color: '#eab308' },
    { name: 'Critical', value: statusCounts.RED, color: '#ef4444' }
  ].filter(d => d.value > 0)

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchAreas} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">
          Auto-refreshing every 5 seconds
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total People</p>
          <p className="text-3xl font-bold text-blue-600">{totalPeople}</p>
          <p className="text-sm text-gray-500">of {totalCapacity} capacity</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Active Areas</p>
          <p className="text-3xl font-bold text-gray-900">{areas.length}</p>
          <p className="text-sm text-gray-500">being monitored</p>
        </div>
        <div className="card border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Warning Areas</p>
          <p className="text-3xl font-bold text-yellow-600">{areasAtWarning}</p>
          <p className="text-sm text-gray-500">at threshold</p>
        </div>
        <div className="card border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Critical Areas</p>
          <p className="text-3xl font-bold text-red-600">{areasAtCritical}</p>
          <p className="text-sm text-gray-500">at capacity</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Crowd Count per Area */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-4">Crowd Count by Area</h3>
          <div className="h-80">
            <Bar
              data={{
                labels: areas.map(a => a.name.length > 12 ? a.name.substring(0, 12) + '...' : a.name),
                datasets: [
                  {
                    label: 'Current',
                    data: areas.map(a => a.currentCount),
                    backgroundColor: '#3b82f6',
                  },
                  {
                    label: 'Capacity',
                    data: areas.map(a => a.capacity),
                    backgroundColor: '#e5e7eb',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart - Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Safe', 'Warning', 'Critical'],
                datasets: [
                  {
                    data: [statusCounts.GREEN, statusCounts.YELLOW, statusCounts.RED],
                    backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Areas Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">All Areas Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Area</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Current</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Threshold</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Capacity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Occupancy</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{area.name}</td>
                  <td className="px-4 py-3 text-gray-600">{area.currentCount}</td>
                  <td className="px-4 py-3 text-gray-600">{area.threshold}</td>
                  <td className="px-4 py-3 text-gray-600">{area.capacity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            area.status === 'RED' ? 'bg-red-500' :
                            area.status === 'YELLOW' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((area.currentCount / area.capacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((area.currentCount / area.capacity) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={area.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
