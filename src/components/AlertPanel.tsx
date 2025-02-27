import React from 'react';
import { Alert } from '../types/index';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';

export interface AlertPanelProps {
  alerts: Alert[];
  className?: string;
}

export function AlertPanel({ alerts, className = '' }: AlertPanelProps) {
  return (
    <div className={`${className} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold">Active Alerts</h2>
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg ${
              alert.severity === 'critical' 
                ? 'bg-red-500/10' 
                : 'bg-yellow-500/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${
                  alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  Section {alert.sectionId}
                </span>
                <span className={`text-sm px-2 py-0.5 rounded ${
                  alert.severity === 'critical' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                </span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <p className="text-gray-300 text-sm">{alert.message}</p>
            
            {alert.suggestions && alert.suggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-400">Suggested Actions:</p>
                {alert.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-1.5 text-xs text-gray-300">
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
}