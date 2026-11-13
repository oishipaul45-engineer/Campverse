export type ScreenView = 'discover' | 'organizations' | 'schedule' | 'map';

export type EventCategory =
  | 'Tech & Hackathons'
  | 'Arts & Design'
  | 'Music & Social'
  | 'Academic'
  | 'Athletics';

export type OrganizationCategory =
  | 'Engineering'
  | 'Arts & Media'
  | 'Music & Culture'
  | 'Academic'
  | 'Sports & Outdoors';

export interface CampusBuilding {
  id: string;
  name: string;
  shortCode: string;
  zone: string;
  walkMinutesFromQuad: number;
  description: string;
  accessibilityNote: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface StudentOrganization {
  id: string;
  name: string;
  initials: string;
  category: OrganizationCategory;
  memberCount: number;
  meetingSchedule: string;
  buildingId: string;
  room: string;
  mission: string;
  president: string;
  contactEmail: string;
  establishedYear: number;
  accentTone: 'violet' | 'blue' | 'slate' | 'emerald';
}

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  dateISO: string; // YYYY-MM-DD
  dateLabel: string;
  startTime: string;
  endTime: string;
  dayBucket: 'Today' | 'This Week' | 'Next Week';
  buildingId: string;
  buildingName: string;
  room: string;
  organizationId: string;
  organizationName: string;
  attendeeCount: number;
  capacity: number;
  isLiveNow?: boolean;
  isFeatured?: boolean;
  hasFreeRefreshments: boolean;
  imageUrl?: string;
  imageAlt: string;
  summary: string;
  highlights: string[];
}
