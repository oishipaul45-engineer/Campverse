import { useMemo } from 'react';
import { Bookmark, Calendar, Download, MapPin, Trash2 } from 'lucide-react';
import { CampusEvent, ScreenView, StudentOrganization } from '../types';
import { downloadEventsIcs } from '../utils/calendar';

interface ScheduleViewProps {
  events: CampusEvent[];
  organizations: StudentOrganization[];
  rsvpedIds: Set<string>;
  savedIds: Set<string>;
  joinedOrgIds: Set<string>;
  onToggleRsvp: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onSelectOrg: (org: StudentOrganization) => void;
  onNavigate: (screen: ScreenView) => void;
}

export function ScheduleView({
  events,
  organizations,
  rsvpedIds,
  savedIds,
  joinedOrgIds,
  onToggleRsvp,
  onToggleSave,
  onSelectEvent,
  onSelectOrg,
  onNavigate,
}: ScheduleViewProps) {
  const rsvpedEvents = useMemo(
    () =>
      events
        .filter((e) => rsvpedIds.has(e.id))
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [events, rsvpedIds]
  );

  const savedOnlyEvents = useMemo(
    () =>
      events
        .filter((e) => savedIds.has(e.id) && !rsvpedIds.has(e.id))
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [events, savedIds, rsvpedIds]
  );

  const joinedOrgs = useMemo(
    () => organizations.filter((o) => joinedOrgIds.has(o.id)),
    [organizations, joinedOrgIds]
  );

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, { label: string; items: CampusEvent[] }>();
    for (const evt of rsvpedEvents) {
      const existing = groups.get(evt.dateISO);
      if (existing) {
        existing.items.push(evt);
      } else {
        groups.set(evt.dateISO, { label: evt.dateLabel, items: [evt] });
      }
    }
    return Array.from(groups.entries());
  }, [rsvpedEvents]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#E2E8F0] pb-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.04em] uppercase text-[#6546E8] mb-2">
            Personal Campus Agenda
          </p>
          <h1 className="font-display text-[32px] leading-[40px] font-bold tracking-[-0.02em] text-[#0F172A]">
            My Schedule & Saved Events
          </h1>
          <p className="mt-1.5 text-sm text-[#334155]">
            Your confirmed RSVPs, bookmarked sessions, and joined campus societies.
          </p>
        </div>

        <button
          type="button"
          disabled={rsvpedEvents.length === 0}
          onClick={() => downloadEventsIcs(rsvpedEvents)}
          className="cv-btn-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 text-[#6546E8]" />
          <span>Export .ics Calendar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Agenda Column */}
        <div className="lg:col-span-8 space-y-8">
          <section aria-label="Confirmed RSVPs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-[#0F172A]">
                Confirmed RSVPs
              </h2>
              <span className="text-xs font-medium text-[#64748B] tabular-nums">
                {rsvpedEvents.length} {rsvpedEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {groupedByDate.length > 0 ? (
              <div className="space-y-6">
                {groupedByDate.map(([dateISO, group]) => (
                  <div key={dateISO}>
                    <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[#4C25CF]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{group.label}</span>
                      {group.items[0]?.dayBucket === 'Today' ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#00668A]">Today</span>
                        </>
                      ) : null}
                    </div>

                    <div className="cv-card overflow-hidden divide-y divide-[#F1F5F9]">
                      {group.items.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-[#FAF9F6]/70 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                              <span className="font-mono font-medium text-[#0F172A] tabular-nums">
                                {evt.startTime} – {evt.endTime}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{evt.category}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onSelectEvent(evt)}
                              className="mt-1.5 block text-left font-display text-base font-semibold text-[#0F172A] hover:text-[#6546E8] transition-colors cursor-pointer"
                            >
                              {evt.title}
                            </button>

                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#64748B]">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {evt.buildingName} · {evt.room}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{evt.organizationName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => downloadEventsIcs([evt], `${evt.id}.ics`)}
                              className="cv-btn-outline h-8 rounded-lg px-3 text-xs font-medium whitespace-nowrap cursor-pointer"
                            >
                              Add to Cal
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleRsvp(evt.id)}
                              aria-label={`Cancel RSVP for ${evt.title}`}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-[#64748B] hover:border-[#FCA5A5] hover:text-[#BA1A1A] transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cv-card p-10 text-center">
                <h3 className="font-display text-base font-semibold text-[#0F172A]">
                  Your campus schedule is open
                </h3>
                <p className="mt-1.5 text-sm text-[#64748B] max-w-md mx-auto">
                  RSVP to workshops, concerts, and speaker sessions on the Discover feed to build your personal agenda.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('discover')}
                  className="cv-btn-primary mt-5 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer"
                >
                  Browse Campus Events
                </button>
              </div>
            )}
          </section>

          {/* Saved / Bookmarked Events */}
          {savedOnlyEvents.length > 0 ? (
            <section aria-label="Bookmarked events">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-[#0F172A]">
                  Bookmarked for Later
                </h2>
                <span className="text-xs font-medium text-[#64748B] tabular-nums">
                  {savedOnlyEvents.length} saved
                </span>
              </div>

              <div className="cv-card overflow-hidden divide-y divide-[#F1F5F9]">
                {savedOnlyEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#64748B] tabular-nums">
                        {evt.dateLabel}, {evt.startTime} · {evt.buildingName}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(evt)}
                        className="mt-1 font-display text-base font-semibold text-[#0F172A] hover:text-[#6546E8] text-left cursor-pointer"
                      >
                        {evt.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleSave(evt.id)}
                        aria-label={`Remove bookmark for ${evt.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDD6FE] bg-[#EDE9FE] text-[#6546E8] cursor-pointer"
                      >
                        <Bookmark className="h-3.5 w-3.5 fill-[#6546E8]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleRsvp(evt.id)}
                        className="cv-btn-primary h-8 rounded-lg px-3.5 text-xs font-semibold cursor-pointer"
                      >
                        RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right Rail: Joined Organizations */}
        <aside className="lg:col-span-4">
          <div className="cv-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-[#0F172A]">
                Joined Organizations
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('organizations')}
                className="text-xs font-semibold text-[#6546E8] hover:text-[#4C25CF] cursor-pointer"
              >
                Explore
              </button>
            </div>

            {joinedOrgs.length > 0 ? (
              <div className="divide-y divide-[#F1F5F9]">
                {joinedOrgs.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => onSelectOrg(org)}
                    className="flex w-full items-center gap-3 py-3 text-left hover:bg-[#FAF9F6] -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EDE9FE] font-display text-xs font-bold text-[#4C25CF]">
                      {org.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {org.meetingSchedule} · {org.room}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">
                You haven’t joined any student clubs yet. Browse the directory to follow weekly meetings.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
