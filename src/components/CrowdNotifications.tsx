import React, { useState } from 'react';
import { SectionData } from '../types/index';
import { Bell, ArrowRight, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface CrowdNotificationsProps {
  sections: SectionData[];
}

export function CrowdNotifications({ sections }: CrowdNotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getNotificationForSection = (section: SectionData) => {
    if (section.crowdDensity > 0.8) {
      return {
        type: 'critical',
        message: `Section ${section.name} is at capacity. Please use alternate routes through sections ${
          section.name === 'A1' ? 'B1 or B2' : section.name === 'A2' ? 'B1 or B2' : 'A1 or A2'
        }.`,
      };
    }
    if (section.crowdDensity > 0.6) {
      return {
        type: 'warning',
        message: `Section ${section.name} is getting crowded (${Math.round(section.crowdDensity * 100)}%). Consider using nearby sections for quicker access.`,
      };
    }
    return null;
  };

  const activeNotifications = sections
    .map(getNotificationForSection)
    .filter((notification): notification is NonNullable<typeof notification> => notification !== null);

  return (
    <div className="relative z-50">
      <div className={`absolute top-0 left-0 right-0 bg-[#1A2332] rounded-xl border border-gray-700/50 shadow-2xl transition-all duration-300 ease-in-out ${isExpanded ? 'h-96' : 'h-32'}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="text-blue-400 w-5 h-5" />
                {activeNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </div>
              <h2 className="text-lg font-bold text-white">
                Crowd Notifications
                {activeNotifications.length > 0 && (
                  <span className="ml-2 text-sm text-gray-400">
                    ({activeNotifications.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Stadium Screens & Mobile Devices</span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-700/30 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Area */}
        <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${isExpanded ? 'h-[calc(100%-3.5rem)]' : 'h-[calc(100%-3.5rem)]'}`}>
          <div className="p-3 space-y-2">
            {activeNotifications.length > 0 ? (
              activeNotifications.map((notification, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    notification.type === 'critical'
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      notification.type === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                    }`}
                  >
                    <Users className={`w-5 h-5 ${notification.type === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        notification.type === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {notification.type === 'critical' ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{notification.message}</p>
                    {notification.type === 'critical' && (
                      <div className="flex items-center gap-2 mt-2 text-xs bg-gray-800/50 p-2 rounded-lg">
                        <span className="text-red-400 font-medium">Alternate Route:</span>
                        <div className="flex items-center gap-1 text-gray-400">
                          Gate B
                          <ArrowRight className="w-3 h-3" />
                          Lower Level
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-4 text-gray-400">
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <p>All sections operating normally</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Spacer div to maintain layout flow */}
      <div className={`${isExpanded ? 'h-96' : 'h-32'} transition-all duration-300 ease-in-out`} />
    </div>
  );
}