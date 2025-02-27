import React, { useState, useEffect, useRef } from 'react';
import { DispatchTeam, DispatchActivity, SectionData } from '../types/index';
import { Shield, Heart, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
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

interface DispatchPanelProps {
  teams: DispatchTeam[];
  activities: DispatchActivity[];
  selectedSection?: SectionData;
  onDispatch: (team: DispatchTeam, sectionId: string) => void;
}

// Add this helper function at the top level
const getRelativeTimeLabel = (date: Date) => {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  return `${hours}h ago`;
};

export function DispatchPanel({ teams, activities, selectedSection, onDispatch }: DispatchPanelProps) {
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [historicalData, setHistoricalData] = useState<Array<{ timestamp: Date; count: number }>>([]);
  const chartRef = useRef<ChartJS<"line">>();
  
  // Update data whenever selectedSection changes or updates
  useEffect(() => {
    if (selectedSection) {
      // Update historical data immediately with current section data
      const now = new Date();
      const newData = [];
      
      // Generate data points for the last 2 hours, every 10 minutes
      for (let i = 12; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
        // Use actual section data for current point, slight variations for historical
        const count = i === 0 ? selectedSection.peopleCount : 
          Math.max(0, selectedSection.peopleCount + (Math.random() * 20 - 10));
        
        newData.push({
          timestamp,
          count: Math.round(count)
        });
      }
      setHistoricalData(newData);
    }
  }, [selectedSection?.id, selectedSection?.peopleCount]); // Update when section or its data changes

  // Update chart data every 15 seconds to match section updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSection) {
        setHistoricalData(prev => {
          const now = new Date();
          // Use actual section data for new point
          const newPoint = {
            timestamp: now,
            count: selectedSection.peopleCount
          };
          
          const newData = [...prev, newPoint];
          // Keep only last 2 hours of data
          const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
          return newData.filter(point => point.timestamp > twoHoursAgo);
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedSection]);

  if (!selectedSection) {
    return (
      <div className="bg-[#1A2332] rounded-xl p-6">
        <div className="text-center text-gray-400 py-8">
          Select a section to view analytics and dispatch controls
        </div>
      </div>
    );
  }

  // Chart configuration with real data
  const chartData = {
    labels: historicalData.map(data => getRelativeTimeLabel(data.timestamp)),
    datasets: [{
      data: historicalData.map(data => data.count),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...historicalData.map(d => d.count), 600) * 1.1,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          },
          padding: 8,
          callback: function(tickValue: number | string): string | number {
            return typeof tickValue === 'number' ? Math.round(tickValue) : tickValue;
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        },
        border: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `People Count: ${context.raw}`,
          title: (tooltipItems: any[]) => {
            const index = tooltipItems[0].dataIndex;
            return getRelativeTimeLabel(historicalData[index].timestamp);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const
    }
  };

  const getDensityInfo = (density: number) => {
    if (density <= 0.4) return { label: 'Low', value: `${Math.round(density * 100)}%`, color: 'text-green-400' };
    if (density <= 0.7) return { label: 'Medium', value: `${Math.round(density * 100)}%`, color: 'text-yellow-400' };
    return { label: 'High', value: `${Math.round(density * 100)}%`, color: 'text-red-400' };
  };

  const densityInfo = getDensityInfo(selectedSection.crowdDensity);

  // Handle dispatch action
  const handleDispatch = () => {
    const availableTeam = teams.find(team => team.status === 'available');
    if (availableTeam && dispatchMessage.trim()) {
      onDispatch(availableTeam, selectedSection.id);
      setDispatchMessage('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Crowd Analytics */}
      <div className="bg-[#1A2332] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Crowd Analytics</h2>
            <h3 className="text-sm text-gray-400">Section {selectedSection.name}</h3>
          </div>
          <div className="flex items-center gap-2 bg-[#0F1A2A] px-3 py-1.5 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-semibold">{selectedSection.peopleCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Density */}
          <div className="bg-[#0F1A2A] rounded-lg p-2.5">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">Density</div>
            <div className={`text-xl font-bold leading-none ${densityInfo.color} mb-1`}>
              {densityInfo.label}
            </div>
            <div className={`text-xs ${densityInfo.color} opacity-90`}>
              {densityInfo.value}
            </div>
          </div>

          {/* Trend */}
          <div className="bg-[#0F1A2A] rounded-lg p-2.5">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">Trend</div>
            <div className={`flex items-center gap-1 ${selectedSection.crowdTrend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
              {selectedSection.crowdTrend === 'up' ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xl font-bold">Up</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xl font-bold">Down</span>
                </>
              )}
            </div>
            <div className={`text-xs mt-1 ${selectedSection.crowdTrend === 'up' ? 'text-red-400/70' : 'text-green-400/70'}`}>
              Last 30 min
            </div>
          </div>

          {/* Status */}
          <div className="bg-[#0F1A2A] rounded-lg p-2.5">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">Status</div>
            <div className={`text-xl font-bold leading-none ${selectedSection.hasAlert ? 'text-red-400' : 'text-green-400'} mb-1`}>
              {selectedSection.hasAlert ? 'Alert' : 'Normal'}
            </div>
            <div className={`text-xs ${selectedSection.hasAlert ? 'text-red-400/70' : 'text-green-400/70'}`}>
              Current state
            </div>
          </div>
        </div>

        {/* Crowd History Chart */}
        <div className="bg-[#0F1A2A] rounded-lg p-3">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Crowd History (Last 2 Hours)</h3>
          <div className="h-[200px] w-full">
            <Line 
              ref={chartRef}
              data={chartData} 
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    max: Math.max(selectedSection.peopleCount * 1.2, ...historicalData.map(d => d.count)) // Dynamic max based on current count
                  }
                }
              }}
              className="!h-full !w-full"
            />
          </div>
        </div>
      </div>

      {/* Dispatch Control */}
      <div className="bg-[#1A2332] rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Dispatch Control</h2>
        
        {/* Available Teams */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Available Teams</h3>
          <div className="space-y-2">
            {teams.map(team => (
              <div
                key={team.id}
                className={`flex items-center p-3 ${
                  team.status === 'available' ? 'bg-[#0F1A2A]' : 'bg-[#1F2937]'
                } rounded-lg`}
              >
                {team.type === 'security' ? (
                  <Shield className="h-5 w-5 text-blue-400" />
                ) : team.type === 'medical' ? (
                  <Heart className="h-5 w-5 text-red-400" />
                ) : (
                  <Users className="h-5 w-5 text-green-400" />
                )}
                <div className="flex-1 ml-3">
                  <div className="font-medium">
                    {team.type === 'security' ? 'Security Team' : team.type === 'medical' ? 'Medical Team' : 'Staff'} {team.id}
                  </div>
                  <div className="text-sm text-gray-400">
                    {team.status === 'available' ? 'Available' : `Deployed to ${team.location}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Message */}
        <div className="mb-4">
          <textarea
            value={dispatchMessage}
            onChange={(e) => setDispatchMessage(e.target.value)}
            placeholder="Enter dispatch instructions..."
            className="w-full h-24 px-3 py-2 bg-[#0F1A2A] rounded-lg border border-gray-700 
              text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dispatch Button */}
        <button
          onClick={handleDispatch}
          disabled={!teams.some(t => t.status === 'available') || !dispatchMessage.trim()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
            transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="h-4 w-4" />
          Dispatch Team
        </button>

        {/* Recent Activity */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
          {activities
            .filter(activity => activity.sectionId === selectedSection.id)
            .length > 0 ? (
            <div className="space-y-2">
              {activities
                .filter(activity => activity.sectionId === selectedSection.id)
                .map(activity => (
                  <div key={activity.id} className="text-sm text-gray-400">
                    {activity.status === 'dispatched' ? 'Team dispatched to' : 'Team returned from'} Section {activity.sectionId}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              No recent activity for this section
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 