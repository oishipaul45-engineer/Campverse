import { useEffect } from 'react';
import { Calendar, Check, Mail, MapPin, Users, X } from 'lucide-react';
import { CampusEvent, StudentOrganization } from '../types';

interface OrgDetailModalProps {
  organization: StudentOrganization | null;
  events: CampusEvent[];
  isJoined: boolean;
  rsvpedIds: Set<string>;
  onClose: () => void;
  onToggleJoin: (orgId: string) => void;
  onToggleRsvp: (eventId: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
}

export function OrgDetailModal({
  organization,
  events,
  isJoined,
  rsvpedIds,
  onClose,
  onToggleJoin,
  onToggleRsvp,
  onSelectEvent,
}: OrgDetailModalProps) {
  useEffect(() => {
    if (!organization) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [organization, onClose]);

  if (!organization) return null;

  const orgEvents = events.filter((e) => e.organizationId === organization.id);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="org-detail-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white border-l border-[#E2E8F0] shadow-[0_20px_30px_-10px_rgba(15,23,42,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F1F5F9] bg-white/95 backdrop-blur-sm px-6 py-4">
          <span className="text-xs font-semibold text-[#4C25CF]">
            {organization.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close organization profile"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF9F6] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] font-display text-lg font-bold text-[#4C25CF]">
              {organization.initials}
            </div>
            <div>
              <h2
                id="org-detail-title"
                className="font-display text-[22px] leading-[30px] font-bold text-[#0F172A]"
              >
                {organization.name}
              </h2>
              <p className="mt-1 text-xs text-[#64748B] tabular-nums">
                Est. {organization.establishedYear} ·{' '}
                {organization.memberCount + (isJoined ? 1 : 0)} members
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-[22px] text-[#334155]">
            {organization.mission}
          </p>

          <div className="mt-6 space-y-3 rounded-xl border border-[#E2E8F0] bg-[#FAF9F6] p-4 text-xs text-[#334155]">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-[#6546E8]" />
              <span>Meets {organization.meetingSchedule}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-[#6546E8]" />
              <span>{organization.room}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 shrink-0 text-[#6546E8]" />
              <span>President: {organization.president}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[#6546E8]" />
              <span className="font-mono">{organization.contactEmail}</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                Upcoming Hosted Events
              </h3>
              <span className="text-xs text-[#64748B] tabular-nums">
                {orgEvents.length}
              </span>
            </div>

            {orgEvents.length > 0 ? (
              <div className="divide-y divide-[#F1F5F9] border-t border-[#F1F5F9]">
                {orgEvents.map((evt) => {
                  const isRsvped = rsvpedIds.has(evt.id);
                  return (
                    <div key={evt.id} className="py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-[#64748B] tabular-nums">
                          {evt.dateLabel}, {evt.startTime}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectEvent(evt);
                          }}
                          className="mt-1 font-display text-sm font-semibold text-[#0F172A] hover:text-[#6546E8] text-left cursor-pointer block truncate"
                        >
                          {evt.title}
                        </button>
                        <p className="mt-0.5 text-xs text-[#64748B]">
                          {evt.buildingName} · {evt.room}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleRsvp(evt.id)}
                        className={`h-8 rounded-lg px-3 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                          isRsvped ? 'cv-btn-subtle' : 'cv-btn-primary'
                        }`}
                      >
                        {isRsvped ? 'Going' : 'RSVP'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">
                No upcoming public events scheduled yet for this term.
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[#E2E8F0] bg-white px-6 py-4 flex items-center justify-between gap-3">
          <span className="text-xs text-[#64748B]">
            Open to all undergraduate & graduate students
          </span>
          <button
            type="button"
            onClick={() => onToggleJoin(organization.id)}
            aria-pressed={isJoined}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              isJoined ? 'cv-btn-subtle' : 'cv-btn-primary'
            }`}
          >
            {isJoined ? (
              <>
                <Check className="h-4 w-4" />
                <span>Joined Club</span>
              </>
            ) : (
              <span>Join Club</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
