import { SectionData, CrowdTrend, AlertLevel, SectionType } from '../types/index';

// Facility configuration type
interface FacilityConfig {
  type: SectionType;
  label: string;
  coordinates: [number, number];
  entranceDirection?: 'N' | 'S' | 'E' | 'W';
}

// List of all section IDs in the stadium
export const SECTION_IDS = [
  'N1', 'N2', 'N3', 'N4',                    // North sections
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', // East sections
  'S1', 'S2', 'S3', 'S4',                    // South sections
  'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', // West sections
  'NE', 'SE', 'SW', 'NW',                    // Corner sections
  // Facilities
  'INFO', 'FC', 'REST1', 'REST2', 'FA',      // Info Desk, Food Court, Restrooms, First Aid
  'EN', 'ES', 'EE', 'EW'                     // Entrances (North, South, East, West)
];

// Facility configurations
const FACILITIES: Record<string, FacilityConfig> = {
  'INFO': { type: 'info', label: 'Info Desk', coordinates: [380, 300] },
  'FC': { type: 'food', label: 'Food Court', coordinates: [480, 300] },
  'REST1': { type: 'restroom', label: 'Restrooms', coordinates: [380, 200] },
  'REST2': { type: 'restroom', label: 'Restrooms', coordinates: [480, 400] },
  'FA': { type: 'firstaid', label: 'First Aid', coordinates: [380, 400] },
  'EN': { type: 'entrance', label: 'Entrance', coordinates: [400, 80], entranceDirection: 'N' },
  'ES': { type: 'entrance', label: 'Entrance', coordinates: [400, 520], entranceDirection: 'S' },
  'EE': { type: 'entrance', label: 'Entrance', coordinates: [720, 300], entranceDirection: 'E' },
  'EW': { type: 'entrance', label: 'Entrance', coordinates: [80, 300], entranceDirection: 'W' }
};

// Generate random crowd density between 0 and 1
const generateRandomDensity = (): number => {
  return Math.random();
};

// Generate random people count based on density
const generatePeopleCount = (density: number): number => {
  const baseCount = 100;
  const maxAdditional = 500;
  return Math.floor(baseCount + (density * maxAdditional));
};

// Determine alert level based on density
const determineAlertLevel = (density: number): AlertLevel => {
  if (density > 0.8) return 'critical';
  if (density > 0.6) return 'warning';
  return 'normal';
};

// Generate random crowd trend with some logic based on previous density
const generateCrowdTrend = (previousDensity: number, currentDensity: number): CrowdTrend => {
  if (previousDensity === currentDensity) {
    return Math.random() > 0.5 ? 'up' : 'down';
  }
  return currentDensity > previousDensity ? 'up' : 'down';
};

// Generate random section data
export const generateRandomSectionData = (
  sectionId: string,
  previousData?: SectionData
): SectionData => {
  // Check if this is a facility
  const facilityConfig = FACILITIES[sectionId];
  if (facilityConfig) {
    return {
      id: sectionId,
      name: sectionId,
      crowdDensity: 0,
      peopleCount: 0,
      hasAlert: false,
      crowdTrend: 'up',
      alertLevel: 'normal',
      coordinates: facilityConfig.coordinates,
      type: facilityConfig.type,
      label: facilityConfig.label,
      entranceDirection: facilityConfig.entranceDirection as 'N' | 'S' | 'E' | 'W' | undefined
    };
  }

  // Regular section
  const density = generateRandomDensity();
  const peopleCount = generatePeopleCount(density);
  const hasAlert = density > 0.6;
  const crowdTrend = previousData 
    ? generateCrowdTrend(previousData.crowdDensity, density)
    : Math.random() > 0.5 ? 'up' : 'down';

  return {
    id: sectionId,
    name: sectionId,
    crowdDensity: density,
    peopleCount,
    hasAlert,
    crowdTrend,
    alertLevel: determineAlertLevel(density),
    coordinates: [0, 0], // These would be actual coordinates in a real implementation
    type: 'section'
  };
};

// Generate data for all sections
export const generateAllSectionsData = (previousData?: SectionData[]): SectionData[] => {
  return SECTION_IDS.map(sectionId => {
    const previousSection = previousData?.find(section => section.id === sectionId);
    return generateRandomSectionData(sectionId, previousSection);
  });
};

// Generate historical data points
export const generateHistoricalData = (
  hours: number = 6,
  dataPointsPerHour: number = 12
): Array<{ timestamp: Date; count: number; density: number }> => {
  const dataPoints = hours * dataPointsPerHour;
  const now = new Date();
  const data = [];

  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * (3600000 / dataPointsPerHour)));
    const density = generateRandomDensity();
    data.push({
      timestamp,
      count: generatePeopleCount(density),
      density
    });
  }

  return data;
};

// Calculate total crowd count
export const calculateTotalCrowdCount = (sections: SectionData[]): number => {
  return sections.reduce((total, section) => total + section.peopleCount, 0);
};

// Get number of active alerts
export const getActiveAlertsCount = (sections: SectionData[]): number => {
  return sections.filter(section => section.hasAlert).length;
}; 