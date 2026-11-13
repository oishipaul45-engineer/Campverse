import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  CampusBuilding,
  CampusEvent,
  EventCategory,
  StudentOrganization,
} from '../types';
import imgHackathon from '../assets/images/event_campus_hackathon_1794577436064.jpg';
import imgDesign from '../assets/images/event_design_symposium_1794577435690.jpg';
import imgQuad from '../assets/images/event_quad_acoustic_1794577436746.jpg';
import imgRobotics from '../assets/images/event_robotics_lab_1794577436036.jpg';

interface PostEventModalProps {
  isOpen: boolean;
  buildings: CampusBuilding[];
  organizations: StudentOrganization[];
  onClose: () => void;
  onCreateEvent: (newEvent: CampusEvent) => void;
}

const CATEGORIES: EventCategory[] = [
  'Tech & Hackathons',
  'Arts & Design',
  'Music & Social',
  'Academic',
  'Athletics',
];

const CATEGORY_DEFAULT_IMAGES: Record<EventCategory, string> = {
  'Tech & Hackathons': imgHackathon,
  'Arts & Design': imgDesign,
  'Music & Social': imgQuad,
  Academic: imgRobotics,
  Athletics: imgQuad,
};

function formatDateLabel(dateISO: string): string {
  const parsed = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateISO;
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function PostEventModal({
  isOpen,
  buildings,
  organizations,
  onClose,
  onCreateEvent,
}: PostEventModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Tech & Hackathons');
  const [dateISO, setDateISO] = useState('2026-11-19');
  const [startTime, setStartTime] = useState('5:30 PM');
  const [endTime, setEndTime] = useState('7:30 PM');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id ?? 'eng-atrium');
  const [room, setRoom] = useState('Room 201');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? 'org-acm');
  const [capacity, setCapacity] = useState('60');
  const [summary, setSummary] = useState('');
  const [hasFreeRefreshments, setHasFreeRefreshments] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanSummary = summary.trim();
    const parsedCapacity = parseInt(capacity, 10);

    if (cleanTitle.length < 4) {
      setErrorMsg('Please enter an event title (at least 4 characters).');
      return;
    }
    if (cleanSummary.length < 12) {
      setErrorMsg('Please provide a brief description so students know what to expect.');
      return;
    }
    if (!Number.isFinite(parsedCapacity) || parsedCapacity < 5) {
      setErrorMsg('Capacity must be at least 5 attendees.');
      return;
    }

    const building = buildings.find((b) => b.id === buildingId) ?? buildings[0];
    const org = organizations.find((o) => o.id === organizationId) ?? organizations[0];

    const newEvent: CampusEvent = {
      id: `evt-${Date.now()}`,
      title: cleanTitle,
      category,
      dateISO,
      dateLabel: formatDateLabel(dateISO),
      startTime: startTime.trim() || '5:30 PM',
      endTime: endTime.trim() || '7:30 PM',
      dayBucket: dateISO === '2026-11-13' ? 'Today' : 'This Week',
      buildingId: building.id,
      buildingName: building.name,
      room: room.trim() || 'Main Hall',
      organizationId: org.id,
      organizationName: org.name,
      attendeeCount: 1,
      capacity: parsedCapacity,
      hasFreeRefreshments,
      imageUrl: CATEGORY_DEFAULT_IMAGES[category],
      imageAlt: `${cleanTitle} hosted at ${building.name}`,
      summary: cleanSummary,
      highlights: [
        `Hosted by ${org.name}`,
        `Location: ${building.name}, ${room.trim() || 'Main Hall'}`,
      ],
    };

    onCreateEvent(newEvent);
    setTitle('');
    setSummary('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-event-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_20px_30px_-10px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-4">
          <div>
            <h2
              id="post-event-title"
              className="font-display text-lg font-bold text-[#0F172A]"
            >
              Post a Campus Event
            </h2>
            <p className="text-xs text-[#64748B]">
              Publish directly to the Discover feed and Campus Map.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close post event dialog"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg ? (
            <div
              role="alert"
              className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#BA1A1A]"
            >
              {errorMsg}
            </div>
          ) : null}

          <div>
            <label htmlFor="evt-title" className="block text-xs font-semibold text-[#334155] mb-1.5">
              Event Title
            </label>
            <input
              id="evt-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Open Hardware Soldering Workshop"
              className="cv-input h-10 w-full px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="evt-cat" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Category
              </label>
              <select
                id="evt-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="cv-input h-10 w-full px-3 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="evt-org" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Host Organization
              </label>
              <select
                id="evt-org"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="cv-input h-10 w-full px-3 text-sm"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="evt-date" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Date
              </label>
              <input
                id="evt-date"
                type="date"
                required
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="cv-input h-10 w-full px-3 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="evt-start" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Start Time
              </label>
              <input
                id="evt-start"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="5:30 PM"
                className="cv-input h-10 w-full px-3 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="evt-end" className="block text-xs font-semibold text-[#334155] mb-1.5">
                End Time
              </label>
              <input
                id="evt-end"
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="7:30 PM"
                className="cv-input h-10 w-full px-3 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="evt-bldg" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Building
              </label>
              <select
                id="evt-bldg"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="cv-input h-10 w-full px-3 text-sm"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="evt-room" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Room / Space
              </label>
              <input
                id="evt-room"
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Studio 204"
                className="cv-input h-10 w-full px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="evt-cap" className="block text-xs font-semibold text-[#334155] mb-1.5">
                Capacity
              </label>
              <input
                id="evt-cap"
                type="number"
                min={5}
                max={1000}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="cv-input h-10 w-full px-3 text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label htmlFor="evt-desc" className="block text-xs font-semibold text-[#334155] mb-1.5">
              Description
            </label>
            <textarea
              id="evt-desc"
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Share agenda details, who should attend, and any supplies provided..."
              className="cv-input w-full p-3 text-sm resize-none"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] cursor-pointer">
            <input
              type="checkbox"
              checked={hasFreeRefreshments}
              onChange={(e) => setHasFreeRefreshments(e.target.checked)}
              className="h-4 w-4 accent-[#6546E8] rounded"
            />
            <span>Refreshments or snacks provided</span>
          </label>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cv-btn-outline h-10 rounded-lg px-4 text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cv-btn-primary h-10 rounded-lg px-5 text-sm font-semibold cursor-pointer"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
