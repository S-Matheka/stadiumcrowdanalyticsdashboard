import React, { useState, useEffect } from 'react';
import { SectionData, SVGSectionElement } from '../types/index';
import { AlertTriangle, Users, Info, Coffee, Heart, DoorOpen, Bath } from 'lucide-react';

interface StadiumMapProps {
  sections: SectionData[];
  onSectionClick: (section: SectionData) => void;
}

type SectionType = 'food' | 'shopping' | 'entertainment' | 'beauty' | 'services' | 'default' | 'restroom' | 'info' | 'firstaid' | 'entrance';

// Section type mapping
const sectionTypes: Record<string, SectionType> = {
  // Food & Drinks (Red tones)
  'N1': 'food',
  'N2': 'food',
  'E1': 'food',
  'E2': 'food',
  
  // Outlet Shopping (Blue tones)
  'S1': 'shopping',
  'S2': 'shopping',
  'W1': 'shopping',
  'W2': 'shopping',
  
  // Entertainment (Purple tones)
  'N3': 'entertainment',
  'N4': 'entertainment',
  'E3': 'entertainment',
  'E4': 'entertainment',
  
  // Beauty Services (Pink tones)
  'S3': 'beauty',
  'S4': 'beauty',
  'W3': 'beauty',
  'W4': 'beauty',
  
  // Services (Green tones)
  'E5': 'services',
  'E6': 'services',
  'E7': 'services',
  'W5': 'services',
  'W6': 'services',
  'W7': 'services',
  
  // Corner sections mixed use
  'NE': 'food',
  'SE': 'shopping',
  'SW': 'entertainment',
  'NW': 'services',
  
  // Facilities
  'F1': 'restroom',
  'F2': 'info',
  'F3': 'firstaid',
  'F4': 'entrance'
};

const baseColors: Record<SectionType, string> = {
  food: '#FF6B6B',        // Warm red
  shopping: '#4DABF7',    // Blue
  entertainment: '#9775FA', // Purple
  beauty: '#FF8FAB',      // Pink
  services: '#69DB7C',    // Green
  default: '#d9d9d9',    // Default gray
  restroom: '#59B6F6',    // Blue
  info: '#9333EA',       // Purple
  firstaid: '#EF4444',    // Red
  entrance: '#4ADE80'     // Green
};

export function StadiumMap({ sections, onSectionClick }: StadiumMapProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  
  // Facility definitions with fixed positions
  const facilities = [
    { id: 'INFO', label: 'INFO DESK', x: 150, y: 150, type: 'info' },
    { id: 'FC', label: 'FOOD COURT', x: 850, y: 150, type: 'food' },
    { id: 'REST1', label: 'RESTROOMS', x: 150, y: 650, type: 'restroom' },
    { id: 'FA', label: 'FIRST AID', x: 850, y: 650, type: 'firstaid' },
    { id: 'EN', label: 'ENTRANCE N', x: 500, y: 80, type: 'entrance', direction: 'N' },
    { id: 'ES', label: 'ENTRANCE S', x: 500, y: 720, type: 'entrance', direction: 'S' },
    { id: 'EE', label: 'ENTRANCE E', x: 920, y: 400, type: 'entrance', direction: 'E' },
    { id: 'EW', label: 'ENTRANCE W', x: 80, y: 400, type: 'entrance', direction: 'W' }
  ];

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-6 h-6 text-purple-400" />;
      case 'food': return <Coffee className="w-6 h-6 text-yellow-400" />;
      case 'firstaid': return <Heart className="w-6 h-6 text-red-400" />;
      case 'entrance': return <DoorOpen className="w-6 h-6 text-green-400" />;
      case 'restroom': return <Bath className="w-6 h-6 text-blue-400" />;
      default: return null;
    }
  };

  const getFacilityColor = (type: string) => {
    switch (type) {
      case 'info': return 'rgb(147 51 234 / 0.2)';
      case 'food': return 'rgb(234 179 8 / 0.2)';
      case 'firstaid': return 'rgb(239 68 68 / 0.2)';
      case 'entrance': return 'rgb(34 197 94 / 0.2)';
      case 'restroom': return 'rgb(59 130 246 / 0.2)';
      default: return 'rgb(75 85 99 / 0.2)';
    }
  };

  const getSectionFill = (section: SectionData) => {
    const density = section.crowdDensity;
    if (density > 0.8) return 'rgb(239 68 68 / 0.8)';
    if (density > 0.6) return 'rgb(234 179 8 / 0.8)';
    return 'rgb(34 197 94 / 0.8)';
  };

  // Get section type label
  const getSectionTypeLabel = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const type = sectionTypes[sectionId] || 'default';
    const typeLabel = (() => {
      switch(type) {
        case 'food': return 'Food & Drinks';
        case 'shopping': return 'Shopping';
        case 'entertainment': return 'Entertainment';
        case 'beauty': return 'Beauty Services';
        case 'services': return 'Services';
        case 'restroom': return 'Restroom';
        case 'info': return 'Info Desk';
        case 'firstaid': return 'First Aid';
        case 'entrance': return 'Entrance';
        default: return 'General Area';
      }
    })();
    
    if (!section) return typeLabel;
    
    return `${typeLabel} - ${Math.round(section.crowdDensity * 100)}% Full`;
  };
  
  // Get opacity based on hover state
  const getSectionOpacity = (sectionId: string) => {
    if (hoveredSection === sectionId) return 1;
    if (hoveredSection !== null) return 0.5;
    return 0.8;
  };

  // Render alert indicator for sections with alerts
  const renderAlertIndicator = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.hasAlert) return null;

    // Get the center coordinates of the section
    const sectionElement = document.getElementById(`section-${sectionId}`) as SVGSectionElement | null;
    if (!sectionElement) return null;

    const bbox = sectionElement.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    return (
      <g>
        <circle
          cx={centerX}
          cy={centerY}
          r={5}
          fill="#ff4d4d"
          className="animate-pulse"
        />
      </g>
    );
  };

  // Handle section click
  const handleSectionClick = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      onSectionClick(section);
    } else {
      // Create a mock section if it doesn't exist in our data
      const mockSection: SectionData = {
        id: sectionId,
        name: sectionId,
        crowdDensity: Math.random(),
        peopleCount: Math.floor(Math.random() * 500),
        hasAlert: false,
        crowdTrend: Math.random() > 0.5 ? 'up' : 'down',
        alertLevel: 'normal',
        coordinates: [0, 0],
        type: 'section'
      };
      onSectionClick(mockSection);
    }
  };
  
  // Get crowd density stats
  const criticalSections = sections.filter(s => s.crowdDensity > 80).length;
  const warningSections = sections.filter(s => s.crowdDensity > 60 && s.crowdDensity <= 80).length;
  const normalSections = sections.filter(s => s.crowdDensity <= 60).length;

  const renderSection = (section: SectionData) => {
    const isFacility = section.type !== 'section';
    const fill = getSectionFill(section);
    
    return (
      <g
        key={section.id}
        onClick={() => !isFacility && onSectionClick(section)}
        className={!isFacility ? '' : 'cursor-default'}
      >
        <rect
          x={section.coordinates[0]}
          y={section.coordinates[1]}
          width={isFacility ? 40 : 60}
          height={isFacility ? 40 : 60}
          fill={fill}
          rx={isFacility ? 8 : 4}
          className={!isFacility ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        />
        
        {/* Section Label */}
        <text
          x={section.coordinates[0] + (isFacility ? 20 : 30)}
          y={section.coordinates[1] + (isFacility ? 20 : 30)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          className="text-xs font-medium"
        >
          {section.label || section.name}
        </text>

        {/* Facility Icon */}
        {isFacility && (
          <foreignObject
            x={section.coordinates[0] + 16}
            y={section.coordinates[1] + 24}
            width="8"
            height="8"
          >
            {getFacilityIcon(section.type)}
          </foreignObject>
        )}

        {/* Entrance Direction */}
        {section.type === 'entrance' && section.entranceDirection && (
          <text
            x={section.coordinates[0] + 20}
            y={section.coordinates[1] + 36}
            textAnchor="middle"
            fill="white"
            className="text-[10px]"
          >
            {section.entranceDirection}
          </text>
        )}

        {/* Alert Indicator */}
        {!isFacility && section.hasAlert && (
          <foreignObject
            x={section.coordinates[0] + 44}
            y={section.coordinates[1] + 4}
            width="12"
            height="12"
          >
            <AlertTriangle className="w-3 h-3 text-white" />
          </foreignObject>
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1000 800" 
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full max-h-full"
      >
        {/* Background */}
        <rect width="1000" height="800" fill="#0a0f2a" />
        
        {/* Stadium Outline */}
        <path 
          d="M250 150 L750 150 C850 150, 900 250, 900 350 L900 450 C900 550, 850 650, 750 650 L250 650 C150 650, 100 550, 100 450 L100 350 C100 250, 150 150, 250 150 Z" 
          fill="#1e293b" 
          stroke="#0f172a" 
          strokeWidth="3" 
        />
        
        {/* Field/Pitch Area */}
        <ellipse 
          cx="500" 
          cy="400" 
          rx="250" 
          ry="150" 
          fill="#0f172a" 
          stroke="#1e293b" 
          strokeWidth="2" 
        />
        <text 
          x="500" 
          y="400" 
          textAnchor="middle" 
          fontFamily="Arial" 
          fontSize="24" 
          fontWeight="bold" 
          fill="#ffffff"
        >
          Arena
        </text>
        
        {/* North Sections */}
        <g id="north-sections">
          <path 
            d="M300 150 L400 150 L400 220 L300 220 Z" 
            fill={getSectionFill(sections.find(s => s.id === "N1") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("N1")}
          />
          <text x="350" y="195" textAnchor="middle" fill="white" className="text-sm font-medium">N1</text>
          
          <path 
            d="M400 150 L500 150 L500 220 L400 220 Z" 
            fill={getSectionFill(sections.find(s => s.id === "N2") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("N2")}
          />
          <text x="450" y="195" textAnchor="middle" fill="white" className="text-sm font-medium">N2</text>
          
          <path 
            d="M500 150 L600 150 L600 220 L500 220 Z" 
            fill={getSectionFill(sections.find(s => s.id === "N3") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("N3")}
          />
          <text x="550" y="195" textAnchor="middle" fill="white" className="text-sm font-medium">N3</text>
          
          <path 
            d="M600 150 L700 150 L700 220 L600 220 Z" 
            fill={getSectionFill(sections.find(s => s.id === "N4") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("N4")}
          />
          <text x="650" y="195" textAnchor="middle" fill="white" className="text-sm font-medium">N4</text>
        </g>

        {/* East Sections */}
        <g id="east-sections">
          {['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7'].map((id, index) => (
            <g key={id}>
              <path 
                d={`M780 ${200 + index * 50} L900 ${200 + index * 50} L900 ${250 + index * 50} L780 ${250 + index * 50} Z`}
                fill={getSectionFill(sections.find(s => s.id === id) as SectionData)}
                stroke="#555"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-80"
                onClick={() => handleSectionClick(id)}
              />
              <text 
                x="840" 
                y={225 + index * 50} 
                textAnchor="middle" 
                fill="white" 
                className="text-sm font-medium"
              >
                {id}
              </text>
            </g>
          ))}
        </g>

        {/* South Sections */}
        <g id="south-sections">
          <path 
            d="M300 580 L400 580 L400 650 L300 650 Z" 
            fill={getSectionFill(sections.find(s => s.id === "S1") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("S1")}
          />
          <text x="350" y="625" textAnchor="middle" fill="white" className="text-sm font-medium">S1</text>
          
          <path 
            d="M400 580 L500 580 L500 650 L400 650 Z" 
            fill={getSectionFill(sections.find(s => s.id === "S2") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("S2")}
          />
          <text x="450" y="625" textAnchor="middle" fill="white" className="text-sm font-medium">S2</text>
          
          <path 
            d="M500 580 L600 580 L600 650 L500 650 Z" 
            fill={getSectionFill(sections.find(s => s.id === "S3") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("S3")}
          />
          <text x="550" y="625" textAnchor="middle" fill="white" className="text-sm font-medium">S3</text>
          
          <path 
            d="M600 580 L700 580 L700 650 L600 650 Z" 
            fill={getSectionFill(sections.find(s => s.id === "S4") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("S4")}
          />
          <text x="650" y="625" textAnchor="middle" fill="white" className="text-sm font-medium">S4</text>
        </g>

        {/* West Sections */}
        <g id="west-sections">
          {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map((id, index) => (
            <g key={id}>
              <path 
                d={`M100 ${200 + index * 50} L220 ${200 + index * 50} L220 ${250 + index * 50} L100 ${250 + index * 50} Z`}
                fill={getSectionFill(sections.find(s => s.id === id) as SectionData)}
                stroke="#555"
                strokeWidth="1.5"
                className="cursor-pointer hover:opacity-80"
                onClick={() => handleSectionClick(id)}
              />
              <text 
                x="160" 
                y={225 + index * 50} 
                textAnchor="middle" 
                fill="white" 
                className="text-sm font-medium"
              >
                {id}
              </text>
            </g>
          ))}
        </g>

        {/* Corner Sections */}
        <g id="corner-sections">
          {/* NE Corner */}
          <path 
            d="M700 150 L750 150 C800 150, 830 180, 850 200 L850 200 L780 200 L780 250 L700 250 Z" 
            fill={getSectionFill(sections.find(s => s.id === "NE") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("NE")}
          />
          <text x="760" y="200" textAnchor="middle" fill="white" className="text-sm font-medium">NE</text>
          
          {/* SE Corner */}
          <path 
            d="M700 550 L780 550 L780 550 L850 550 C830 570, 800 600, 750 600 L700 600 Z" 
            fill={getSectionFill(sections.find(s => s.id === "SE") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("SE")}
          />
          <text x="760" y="575" textAnchor="middle" fill="white" className="text-sm font-medium">SE</text>
          
          {/* SW Corner */}
          <path 
            d="M300 550 L300 600 L250 600 C200 600, 170 570, 150 550 L150 550 L220 550 L220 500 L300 500 Z" 
            fill={getSectionFill(sections.find(s => s.id === "SW") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("SW")}
          />
          <text x="240" y="575" textAnchor="middle" fill="white" className="text-sm font-medium">SW</text>
          
          {/* NW Corner */}
          <path 
            d="M250 150 L300 150 L300 250 L220 250 L220 200 L150 200 C170 180, 200 150, 250 150 Z" 
            fill={getSectionFill(sections.find(s => s.id === "NW") as SectionData)} 
            stroke="#555" 
            strokeWidth="1.5"
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleSectionClick("NW")}
          />
          <text x="240" y="200" textAnchor="middle" fill="white" className="text-sm font-medium">NW</text>
        </g>

        {/* Render all facilities */}
        {facilities.map(facility => (
          <g key={facility.id}>
            {/* Facility background */}
            <rect
              x={facility.x - 40}
              y={facility.y - 25}
              width="80"
              height="50"
              fill={getFacilityColor(facility.type)}
              rx="8"
              className="stroke-2"
              stroke={getFacilityColor(facility.type).replace('0.2', '0.4')}
            />

            {/* Icon */}
            <foreignObject
              x={facility.x - 15}
              y={facility.y - 20}
              width="30"
              height="30"
            >
              {getFacilityIcon(facility.type)}
            </foreignObject>

            {/* Label */}
            <text
              x={facility.x}
              y={facility.y + 15}
              textAnchor="middle"
              fill="white"
              className="text-xs font-medium"
            >
              {facility.label}
            </text>

            {/* Direction indicator for entrances */}
            {facility.type === 'entrance' && facility.direction && (
              <text
                x={facility.x}
                y={facility.y + 5}
                textAnchor="middle"
                fill="white"
                className="text-[10px]"
              >
                {facility.direction}
              </text>
            )}
          </g>
        ))}
        
        {/* Alert indicators */}
        {sections.map(section => renderAlertIndicator(section.id))}
        
        {/* Hover Info */}
        {hoveredSection && (
          <g transform="translate(300, 700)">
            <rect x="0" y="0" width="400" height="80" rx="5" fill="rgba(0,0,0,0.7)" />
            <text x="20" y="30" fill="white" className="text-lg font-bold">
              Section {hoveredSection}
            </text>
            {(() => {
              const section = sections.find(s => s.id === hoveredSection);
              if (section) {
                return (
                  <>
                    <text x="20" y="55" fill="white" className="text-sm">
                      Crowd: {Math.round(section.crowdDensity * 100)}% ({section.peopleCount} people)
                      {section.hasAlert && ' - ⚠️ Alert Active'}
                    </text>
                  </>
                );
              }
              return null;
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}