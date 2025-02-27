import React, { useState, useEffect } from 'react';
import { StadiumMap } from './components/StadiumMap';
import { AlertPanel } from './components/AlertPanel';
import { CrowdNotifications } from './components/CrowdNotifications';
import type { SectionData, Alert, DispatchTeam, DispatchActivity } from './types/index';
import { Activity, Bell, Settings, Shield, Heart, Users, AlertTriangle, ChevronRight, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { CrowdMetrics } from './components/CrowdMetrics';
import { DispatchPanel } from './components/DispatchPanel';
import { generateAllSectionsData } from './utils/crowdDataGenerator';

// Initial teams data
const initialTeams: DispatchTeam[] = [
  { id: '1', type: 'security', status: 'available' },
  { id: '2', type: 'security', status: 'available' },
  { id: '3', type: 'medical', status: 'available' },
  { id: '4', type: 'medical', status: 'available' },
  { id: '5', type: 'staff', status: 'available' },
  { id: '6', type: 'staff', status: 'available' },
];

function App() {
  // State management
  const [sections, setSections] = useState<SectionData[]>(generateAllSectionsData());
  const [selectedSection, setSelectedSection] = useState<SectionData | undefined>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [teams, setTeams] = useState<DispatchTeam[]>(initialTeams);
  const [activities, setActivities] = useState<DispatchActivity[]>([]);

  // Generate suggestions based on section status
  const generateSuggestions = (section: SectionData) => {
    if (section.crowdDensity > 80) {
      return [
        'Immediately dispatch security team',
        'Open additional exits in adjacent sections',
        'Send emergency notification to section staff',
        'Prepare medical team for potential deployment'
      ];
    } else if (section.crowdDensity > 60) {
      return [
        'Monitor crowd movement patterns',
        'Alert section staff to be on standby',
        'Consider redirecting incoming traffic'
      ];
    }
    return [];
  };

  // Update crowd data at a reasonable interval
  useEffect(() => {
    // Initial update
    updateAlerts(sections);

    const interval = setInterval(() => {
      setSections(prev => {
        const newSections = generateAllSectionsData(prev);
        // Immediately update alerts when sections change
        updateAlerts(newSections);
        return newSections;
      });
    }, 10000); // Changed to 10 seconds for better balance

    return () => clearInterval(interval);
  }, []);

  // Update alerts based on crowd density changes with confirmation
  const updateAlerts = (sections: SectionData[]) => {
    setAlerts(prevAlerts => {
      const filteredAlerts = prevAlerts.filter(alert => {
        if (alert.type !== 'density') return true;
        const section = sections.find(s => s.id === alert.sectionId);
        if (!section) return false;
        
        // Keep alerts that are still valid based on density
        return section.crowdDensity >= 0.6;
      });

      sections.forEach(section => {
        const existingAlertIndex = filteredAlerts.findIndex(
          alert => alert.sectionId === section.id && alert.type === 'density'
        );

        // Only create/update alerts if the condition persists
        const existingAlert = prevAlerts.find(
          alert => alert.sectionId === section.id && alert.type === 'density'
        );

        const shouldTriggerCritical = section.crowdDensity > 0.8;
        const shouldTriggerWarning = section.crowdDensity > 0.6;

        // Create new alert only if condition persists or is getting worse
        const shouldCreateNewAlert = 
          (shouldTriggerCritical && (!existingAlert || existingAlert.severity === 'warning')) ||
          (shouldTriggerWarning && !existingAlert);

        if (shouldCreateNewAlert) {
          const newAlert = shouldTriggerCritical ? {
            id: `density-${section.id}-${Math.random().toString(36).substr(2, 9)}`,
            sectionId: section.id,
            type: 'density' as const,
            severity: 'critical' as const,
            message: `Critical: Section ${section.name} at ${Math.round(section.crowdDensity * 100)}% capacity. Immediate action required.`,
            timestamp: new Date(),
            suggestions: generateSuggestions(section)
          } : {
            id: `density-${section.id}-${Math.random().toString(36).substr(2, 9)}`,
            sectionId: section.id,
            type: 'density' as const,
            severity: 'warning' as const,
            message: `Warning: Section ${section.name} approaching capacity at ${Math.round(section.crowdDensity * 100)}%.`,
            timestamp: new Date(),
            suggestions: generateSuggestions(section)
          };

          if (existingAlertIndex !== -1) {
            filteredAlerts[existingAlertIndex] = newAlert;
          } else {
            filteredAlerts.unshift(newAlert);
          }
        }
      });

      return filteredAlerts.slice(0, 5); // Keep only the 5 most recent alerts
    });

    // Update section hasAlert flags for consistency
    setSections(currentSections => 
      currentSections.map(section => ({
        ...section,
        hasAlert: section.crowdDensity > 0.6
      }))
    );
  };

  // Handle section selection
  const handleSectionClick = (section: SectionData) => {
    setSelectedSection(section);
  };

  // Handle team dispatch
  const handleDispatch = (team: DispatchTeam, sectionId: string) => {
    // Update team status
    setTeams(prev => prev.map(t => 
      t.id === team.id 
        ? { ...t, status: 'dispatched', location: `Section ${sectionId}`, dispatchTime: new Date() }
        : t
    ));

    // Add dispatch activity
    const activity: DispatchActivity = {
      id: Math.random().toString(36).substr(2, 9),
      teamId: team.id,
      teamType: team.type,
      sectionId,
      timestamp: new Date(),
      status: 'dispatched'
    };

    setActivities(prev => [activity, ...prev].slice(0, 10));

    // Auto-return after 2 minutes
    setTimeout(() => {
      setTeams(prev => prev.map(t => 
        t.id === team.id 
          ? { ...t, status: 'available', location: undefined, dispatchTime: undefined }
          : t
      ));

      const returnActivity: DispatchActivity = {
        id: Math.random().toString(36).substr(2, 9),
        teamId: team.id,
        teamType: team.type,
        sectionId,
        timestamp: new Date(),
        status: 'completed'
      };

      setActivities(prev => [returnActivity, ...prev].slice(0, 10));
    }, 120000);
  };

  return (
    <div className="min-h-screen bg-[#0F1A2A] text-white">
      {/* Enhanced Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#1A2332] border-b border-gray-700/50 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Stadium Crowd Analytics</h1>
          <div className="h-4 w-px bg-gray-700/50"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-green-400">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#0F1A2A] transition-colors group">
            <Bell className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm">Alerts</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Content with Enhanced Grid Layout */}
      <div className="grid grid-cols-[280px_1fr_300px] gap-6 p-6">
        {/* Left Sidebar with Improved Spacing */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-[#1A2332] rounded-xl p-4 border border-gray-700/30 hover:border-gray-700/50 transition-colors">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-between group">
                <span>Dispatch Security</span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-between group">
                <span>Medical Response</span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all flex items-center justify-between group">
                <span>Section Control</span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Legend with Hover Effects */}
          <div className="bg-[#1A2332] rounded-xl p-4 border border-gray-700/30">
            <h2 className="text-lg font-semibold mb-4">Legend</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2 hover:bg-[#0F1A2A] rounded-lg transition-colors cursor-default">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-300">Normal (0-60%)</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-[#0F1A2A] rounded-lg transition-colors cursor-default">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-gray-300">Warning (61-80%)</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-[#0F1A2A] rounded-lg transition-colors cursor-default">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm text-gray-300">Critical ({'>'}80%)</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-[#0F1A2A] rounded-lg transition-colors cursor-default">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span className="text-sm text-gray-300">Facilities</span>
              </div>
            </div>
          </div>

          {/* Active Alerts with Enhanced Styling */}
          <div className="bg-[#1A2332] rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-semibold">Active Alerts</h2>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-gray-400 bg-[#0F1A2A] rounded-lg">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <p className="text-sm">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-red-400 font-medium">Section {alert.sectionId}</span>
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-sm text-gray-300">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Teams with Interactive Elements */}
          <div className="bg-[#1A2332] rounded-xl p-4 border border-gray-700/30">
            <h2 className="text-lg font-semibold mb-4">Available Teams</h2>
            <div className="space-y-2">
              {teams
                .filter(team => team.status === 'available')
                .map(team => (
                  <div key={team.id} className="flex items-center justify-between p-3 bg-[#0F1A2A] rounded-lg hover:bg-opacity-70 transition-colors border border-transparent hover:border-gray-700">
                    <div className="flex items-center gap-2">
                      {team.type === 'security' ? (
                        <Shield className="h-5 w-5 text-blue-400" />
                      ) : team.type === 'medical' ? (
                        <Heart className="h-5 w-5 text-red-400" />
                      ) : (
                        <Users className="h-5 w-5 text-green-400" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {team.type.charAt(0).toUpperCase() + team.type.slice(1)} Team {team.id}
                        </div>
                        <div className="text-xs text-gray-400">Available</div>
                      </div>
                    </div>
                    <button
                      onClick={() => selectedSection && handleDispatch(team, selectedSection.id)}
                      disabled={!selectedSection}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50 
                        disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                    >
                      Deploy
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Center Content with Enhanced Styling */}
        <div className="space-y-6">
          {/* Stadium Map Container */}
          <div className="bg-[#1A2332] rounded-xl p-6 space-y-4 border border-gray-700/30">
            {/* Crowd Notifications Strip */}
            <div className="h-[80px]">
              <CrowdNotifications sections={sections} />
            </div>
            
            {/* Stadium Map */}
            <StadiumMap
              sections={sections}
              onSectionClick={handleSectionClick}
            />
          </div>

          {/* Overall Stadium Metrics */}
          <div className="bg-[#1A2332] rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Overall Stadium Metrics</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0F1A2A] rounded-lg p-4 border border-gray-700/30">
                <div className="text-gray-400 mb-2 text-sm">Total Attendance</div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-400" />
                  {sections.reduce((sum, section) => sum + (section.peopleCount || 0), 0)}
                </div>
              </div>
              <div className="bg-[#0F1A2A] rounded-lg p-4 border border-gray-700/30">
                <div className="text-gray-400 mb-2 text-sm">Average Density</div>
                <div className="text-2xl font-semibold">
                  {Math.round(sections.reduce((sum, section) => sum + section.crowdDensity, 0) / sections.length * 100)}%
                </div>
              </div>
              <div className="bg-[#0F1A2A] rounded-lg p-4 border border-gray-700/30">
                <div className="text-gray-400 mb-2 text-sm">Active Alerts</div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  {sections.filter(section => section.hasAlert || false).length}
                </div>
              </div>
            </div>

            {/* Section Comparison Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Section Comparison</h3>
                  <p className="text-gray-400 text-sm mt-1">Click on a section to view detailed analytics</p>
                </div>
                {selectedSection && (
                  <div className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                    Selected: Section {selectedSection.name}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {sections
                  .filter(section => section.type === 'section')
                  .map(section => {
                    const getDensityInfo = (density: number) => {
                      if (density > 0.8) return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
                      if (density > 0.6) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
                      return { label: 'Low', color: 'text-green-400', bg: 'bg-[#0F1A2A]', border: 'border-gray-700/30' };
                    };

                    const densityInfo = getDensityInfo(section.crowdDensity);
                    const isSelected = selectedSection?.id === section.id;

                    return (
                      <div
                        key={section.id}
                        onClick={() => handleSectionClick(section)}
                        className={`${densityInfo.bg} p-3 rounded-lg border ${densityInfo.border} cursor-pointer 
                          hover:border-gray-600 transition-all transform hover:scale-[1.02] ${
                            isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                          }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-white">Section {section.name}</h4>
                          {section.hasAlert && <AlertTriangle className="h-4 w-4 text-red-400" />}
                        </div>
                        <div>
                          <div className="text-2xl font-bold leading-tight">{section.peopleCount}</div>
                          <div className={`text-xs ${densityInfo.color} flex items-center gap-1`}>
                            {section.crowdTrend === 'up' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {densityInfo.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <DispatchPanel
            teams={teams}
            activities={activities}
            selectedSection={selectedSection}
            onDispatch={handleDispatch}
          />
        </div>
      </div>
    </div>
  );
}

export default App