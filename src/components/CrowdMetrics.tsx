import React from 'react';
import { SectionData } from '../types/index';
import { TrendingUp, TrendingDown, AlertTriangle, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CrowdMetricsProps {
  selectedSection?: SectionData;
  allSections: SectionData[];
}

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#9CA3AF',
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#9CA3AF',
      }
    }
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

// Helper function to get density label and color
const getDensityInfo = (density: number): { label: string; color: string } => {
  if (density <= 0.4) return { label: 'Low', color: 'text-green-400' };
  if (density <= 0.7) return { label: 'Medium', color: 'text-yellow-400' };
  return { label: 'High', color: 'text-red-400' };
};

// Helper function to get status label and color
const getStatusInfo = (section: SectionData): { label: string; color: string } => {
  if (section.hasAlert) return { label: 'Alert', color: 'text-red-400' };
  if (section.crowdDensity > 0.8) return { label: 'Critical', color: 'text-red-400' };
  if (section.crowdDensity > 0.6) return { label: 'Warning', color: 'text-yellow-400' };
  return { label: 'Normal', color: 'text-green-400' };
};

// Generate mock historical data
const generateHistoricalData = () => {
  const hours = 6;
  const dataPoints = hours * 12; // 5-minute intervals
  const data = [];
  const now = new Date();

  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * 5 * 60 * 1000));
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count: Math.floor(Math.random() * 300 + 200)
    });
  }

  return data;
};

export function CrowdMetrics({ selectedSection, allSections }: CrowdMetricsProps) {
  // Calculate total metrics
  const totalPeopleCount = allSections.reduce((sum, section) => sum + section.peopleCount, 0);
  const averageDensity = allSections.reduce((sum, section) => sum + section.crowdDensity, 0) / allSections.length;
  const activeAlerts = allSections.filter(section => section.hasAlert).length;

  if (selectedSection) {
    const densityInfo = getDensityInfo(selectedSection.crowdDensity);
    const statusInfo = getStatusInfo(selectedSection);
    const historicalData = generateHistoricalData();

    const chartData = {
      labels: historicalData.map(d => d.time),
      datasets: [
        {
          data: historicalData.map(d => d.count),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    };

    return (
      <div className="bg-[#1A2332] rounded-xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Crowd Analytics</h1>
          <div className="flex items-center gap-2">
            <h2 className="text-xl">Section {selectedSection.name}</h2>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-xl font-semibold">{selectedSection.peopleCount}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Density */}
          <div className="bg-[#0F1A2A] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Density</div>
            <div className={`text-lg font-semibold ${densityInfo.color}`}>
              {densityInfo.label}
            </div>
            <div className="text-sm text-gray-400">
              ({Math.round(selectedSection.crowdDensity * 100)}%)
            </div>
          </div>

          {/* Trend */}
          <div className="bg-[#0F1A2A] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Trend</div>
            <div className={`text-lg font-semibold ${
              selectedSection.crowdTrend === 'up' ? 'text-red-400' : 'text-green-400'
            }`}>
              {selectedSection.crowdTrend === 'up' ? 'Increasing' : 'Decreasing'}
            </div>
            <div className="text-sm text-gray-400">
              Last 30 minutes
            </div>
          </div>

          {/* Status */}
          <div className="bg-[#0F1A2A] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Status</div>
            <div className={`text-lg font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
            <div className="text-sm text-gray-400">
              Current state
            </div>
          </div>
        </div>

        {/* Crowd History Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Crowd History (Last 6 Hours)</h3>
          <div className="bg-[#0F1A2A] rounded-lg p-4">
            <div className="h-[300px] relative">
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overall stadium metrics (existing code)
  return (
    <div className="bg-[#1A2332] rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold">Overall Stadium Metrics</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0F1A2A] rounded-lg p-4">
          <div className="text-gray-400 mb-1">Total Attendance</div>
          <div className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            {totalPeopleCount}
          </div>
        </div>

        <div className="bg-[#0F1A2A] rounded-lg p-4">
          <div className="text-gray-400 mb-1">Average Density</div>
          <div className="text-2xl font-semibold">
            {Math.round(averageDensity * 100)}%
          </div>
        </div>

        <div className="bg-[#0F1A2A] rounded-lg p-4">
          <div className="text-gray-400 mb-1">Active Alerts</div>
          <div className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            {activeAlerts}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0F1A2A] rounded-lg p-4">
          <div className="text-gray-400 mb-2">Critical Sections</div>
          <div className="space-y-2">
            {allSections
              .filter(section => section.crowdDensity > 0.8)
              .map(section => (
                <div key={section.id} className="flex items-center justify-between">
                  <span>Section {section.name}</span>
                  <span className="text-red-400">
                    {Math.round(section.crowdDensity * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#0F1A2A] rounded-lg p-4">
          <div className="text-gray-400 mb-2">Sections with Alerts</div>
          <div className="space-y-2">
            {allSections
              .filter(section => section.hasAlert)
              .map(section => (
                <div key={section.id} className="flex items-center justify-between">
                  <span>Section {section.name}</span>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 