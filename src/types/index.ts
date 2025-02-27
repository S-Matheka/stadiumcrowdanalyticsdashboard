export type AlertLevel = 'normal' | 'warning' | 'critical';
export type CrowdTrend = 'up' | 'down';
export type SectionType = 'food' | 'restroom' | 'info' | 'firstaid' | 'entrance' | 'section';

export interface SectionData {
  id: string;
  name: string;
  crowdDensity: number;
  peopleCount: number;
  hasAlert: boolean;
  crowdTrend: CrowdTrend;
  alertLevel: AlertLevel;
  coordinates: [number, number];
  type: SectionType;
  label?: string;  // For facility labels
  entranceDirection?: 'N' | 'S' | 'E' | 'W';  // For entrance sections
  historicalData?: Array<{
    timestamp: Date;
    count: number;
    density: number;
  }>;
}

export interface Alert {
  id: string;
  sectionId: string;
  type: 'density' | 'security' | 'medical';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface DispatchTeam {
  id: string;
  type: 'security' | 'medical' | 'staff';
  status: 'available' | 'dispatched' | 'returning';
  location?: string;
  dispatchTime?: Date;
}

export interface DispatchActivity {
  id: string;
  teamId: string;
  teamType: 'security' | 'medical' | 'staff';
  sectionId: string;
  timestamp: Date;
  status: 'dispatched' | 'completed' | 'cancelled';
}

export interface CrowdMetrics {
  currentCount: number;
  density: number;
  trend: CrowdTrend;
  hasAlert: boolean;
  historicalData: Array<{
    timestamp: Date;
    count: number;
    density: number;
  }>;
}

// Helper type for SVG elements
export interface SVGSectionElement extends SVGElement {
  getBBox(): DOMRect;
} 