import { useMemo, useState } from 'react';
import { Accessibility, Check, Clock, MapPin, Users } from 'lucide-react';
import { CampusBuilding, CampusEvent } from '../types';

interface CampusMapViewProps {
  buildings: CampusBuilding[];
  events: CampusEvent[];
  rsvpedIds: Set<string>;
  onToggleRsvp: (eventId: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
}

export function CampusMapView({
  buildings,
  events,
  rsvpedIds,
  onToggleRsvp,
  onSelectEvent,
}: CampusMapViewProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id ?? 'eng-atrium');

  const eventCountByBuilding = useMemo(() => {
    const map = new Map<string, number>();
    for (const evt of events) {
      map.set(evt.buildingId, (map.get(evt.buildingId) ?? 0) + 1);
    }
    return map;
  }, [events]);

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0],
    [buildings, selectedBuildingId]
  );

  const buildingEvents = useMemo(
    () =>
      events
        .filter((e) => e.buildingId === selectedBuilding.id)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [events, selectedBuilding]
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.04em] uppercase text-[#6546E8] mb-2">
          Interactive Campus Grounds
        </p>
        <h1 className="font-display text-[32px] leading-[40px] font-bold tracking-[-0.02em] text-[#0F172A]">
          Campus Map & Building Schedule
        </h1>
        <p className="mt-2 text-sm leading-[22px] text-[#334155]">
          Select any campus building or quad zone to inspect walking times, accessibility details, and live scheduled events.
        </p>
      </div>

      {/* Building Quick Selector Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Campus buildings">
        {buildings.map((building) => {
          const isSelected = building.id === selectedBuilding.id;
          const count = eventCountByBuilding.get(building.id) ?? 0;
          return (
            <button
              key={building.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedBuildingId(building.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#6546E8] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#334155] hover:border-[#DDD6FE] hover:text-[#0F172A]'
              }`}
            >
              <span>{building.name}</span>
              <span
                className={`tabular-nums ${
                  isSelected ? 'text-[#E6DFFF]' : 'text-[#64748B]'
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Interactive Architectural SVG Map */}
        <div className="lg:col-span-7 cv-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#334155]">
              Central University Grounds · Architectural Schematic
            </span>
            <span className="text-xs text-[#64748B] tabular-nums">
              {buildings.length} venues active
            </span>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FAF8FF]">
            <svg
              viewBox="0 0 760 440"
              className="w-full h-auto block select-none"
              role="img"
              aria-label="Interactive Campus Grounds Map"
            >
              {/* Subtle topographic grid */}
              <defs>
                <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#EAEDFF"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="760" height="440" fill="url(#campusGrid)" />

              {/* Campus Walkways */}
              <path
                d="M 195 176 L 195 270 L 580 270 M 376 158 L 376 340 M 231 285 L 495 285 M 478 220 L 525 180"
                fill="none"
                stroke="#DAE2FD"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 195 176 L 195 270 L 580 270 M 376 158 L 376 340 M 231 285 L 495 285 M 478 220 L 525 180"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* District Labels */}
              <text x="28" y="34" fill="#64748B" fontSize="11" fontWeight="600" letterSpacing="0.06em">
                NORTH ENGINEERING CRESCENT
              </text>
              <text x="515" y="415" fill="#64748B" fontSize="11" fontWeight="600" letterSpacing="0.06em">
                SOUTH STUDENT COMMONS
              </text>

              {/* Clickable Building Footprints */}
              {buildings.map((building) => {
                const isSelected = building.id === selectedBuilding.id;
                const count = eventCountByBuilding.get(building.id) ?? 0;
                const { x, y, width, height } = building.coordinates;
                const isLawn = building.id === 'north-quad';

                return (
                  <g
                    key={building.id}
                    onClick={() => setSelectedBuildingId(building.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedBuildingId(building.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${building.name} (${count} events)`}
                    className="cursor-pointer focus:outline-none"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={isLawn ? 18 : 10}
                      fill={
                        isSelected
                          ? '#6546E8'
                          : isLawn
                            ? '#EEF8F2'
                            : '#FFFFFF'
                      }
                      stroke={isSelected ? '#4C25CF' : '#CBD5E1'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      style={{ transition: 'fill 160ms ease, stroke 160ms ease' }}
                    />

                    {/* Building Short Code */}
                    <text
                      x={x + 14}
                      y={y + 24}
                      fill={isSelected ? '#E6DFFF' : '#6546E8'}
                      fontSize="11"
                      fontWeight="700"
                      letterSpacing="0.05em"
                    >
                      {building.shortCode}
                    </text>

                    {/* Event Count Marker */}
                    <rect
                      x={x + width - 42}
                      y={y + 10}
                      width={30}
                      height={20}
                      rx={10}
                      fill={isSelected ? '#FFFFFF' : '#EDE9FE'}
                    />
                    <text
                      x={x + width - 27}
                      y={y + 24}
                      textAnchor="middle"
                      fill={isSelected ? '#4C25CF' : '#4C25CF'}
                      fontSize="11"
                      fontWeight="700"
                    >
                      {count}
                    </text>

                    {/* Building Name */}
                    <text
                      x={x + 14}
                      y={y + height - 18}
                      fill={isSelected ? '#FFFFFF' : '#0F172A'}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {building.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
            <span>Click any venue footprint to inspect room schedules.</span>
            <span>All paths ADA step-free accessible</span>
          </div>
        </div>

        {/* Synchronized Building Details & Event Schedule Rail */}
        <aside className="lg:col-span-5 cv-card p-6 flex flex-col">
          <div className="border-b border-[#F1F5F9] pb-5">
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#64748B]">
              <span className="font-semibold text-[#4C25CF]">{selectedBuilding.zone}</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                {selectedBuilding.walkMinutesFromQuad} min walk from Quad
              </span>
            </div>

            <h2 className="mt-2 font-display text-[22px] leading-[30px] font-semibold text-[#0F172A]">
              {selectedBuilding.name}
            </h2>
            <p className="mt-2 text-sm leading-[22px] text-[#334155]">
              {selectedBuilding.description}
            </p>

            <div className="mt-3 flex items-start gap-2 text-xs text-[#64748B]">
              <Accessibility className="h-4 w-4 shrink-0 text-[#00668A] mt-0.5" />
              <span>{selectedBuilding.accessibilityNote}</span>
            </div>
          </div>

          <div className="mt-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                Scheduled at this Venue
              </h3>
              <span className="text-xs text-[#64748B] tabular-nums">
                {buildingEvents.length} {buildingEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {buildingEvents.length > 0 ? (
              <div className="divide-y divide-[#F1F5F9]">
                {buildingEvents.map((evt) => {
                  const isRsvped = rsvpedIds.has(evt.id);
                  const count = evt.attendeeCount + (isRsvped ? 1 : 0);
                  return (
                    <div key={evt.id} className="py-4 first:pt-1 last:pb-0">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#64748B]">
                        <span className="tabular-nums font-medium text-[#334155]">
                          {evt.dateLabel}, {evt.startTime}
                        </span>
                        <span>{evt.room}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectEvent(evt)}
                        className="mt-1.5 block text-left font-display text-[15px] font-semibold text-[#0F172A] hover:text-[#6546E8] transition-colors cursor-pointer"
                      >
                        {evt.title}
                      </button>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] tabular-nums">
                          <Users className="h-3.5 w-3.5" />
                          {count} / {evt.capacity} going
                        </span>

                        <button
                          type="button"
                          onClick={() => onToggleRsvp(evt.id)}
                          aria-pressed={isRsvped}
                          className={`inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-semibold cursor-pointer ${
                            isRsvped ? 'cv-btn-subtle' : 'cv-btn-primary'
                          }`}
                        >
                          {isRsvped ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Going</span>
                            </>
                          ) : (
                            <span>RSVP</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] p-6 text-center">
                <MapPin className="h-5 w-5 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#334155]">
                  No upcoming events posted for this building yet.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
