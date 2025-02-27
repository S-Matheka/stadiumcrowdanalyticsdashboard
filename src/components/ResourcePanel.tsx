import React from 'react';
import { DispatchTeam } from '../types/index';
import { Shield, Heart, ArrowRight } from 'lucide-react';

export interface ResourcePanelProps {
  resources: DispatchTeam[];
  onDispatch: (resource: DispatchTeam, sectionId: string) => void;
  className?: string;
}

export function ResourcePanel({ resources, onDispatch, className = '' }: ResourcePanelProps) {
  return (
    <div className={`${className} rounded-xl p-4`}>
      <h2 className="text-lg font-semibold mb-4">Available Resources</h2>
      <div className="space-y-2">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className={`p-3 rounded-lg ${
              resource.status === 'dispatched'
                ? 'bg-blue-500/10'
                : 'bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {resource.type === 'security' ? (
                <Shield className="h-5 w-5 text-blue-400" />
              ) : (
                <Heart className="h-5 w-5 text-red-400" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">
                    {resource.type === 'security' ? 'Security' : 'Medical'} Team {resource.id}
                  </p>
                  {resource.status === 'dispatched' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Dispatched
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Status: {resource.status === 'dispatched' ? `Dispatched to ${resource.location}` : 'Available'}
                </p>
              </div>
              
              {resource.status === 'available' && (
                <button
                  onClick={() => onDispatch(resource, 'A1')}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                    flex items-center gap-1.5 transition-colors text-sm"
                >
                  Deploy
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}