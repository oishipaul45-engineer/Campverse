import { useEffect, useState } from 'react';
import { Bookmark, Calendar, Check, Download, MapPin, Share2, Users, X } from 'lucide-react';
import { CampusEvent, StudentOrganization } from '../types';
import { downloadEventsIcs } from '../utils/calendar';
import { MediaBanner } from './MediaBanner';

interface EventDetailModalProps {
  event: CampusEvent | null;
  organization?: StudentOrganization;
  isRsvped: boolean;
  isSaved: boolean;
  onClose: () => void;
  onToggleRsvp: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
  onSelectOrg: (org: StudentOrganization) => void;
}

export function EventDetailModal({
  event,
  organization,
  isRsvped,
  isSaved,
  onClose,
  onToggleRsvp,
  onToggleSave,
  onSelectOrg,
}: EventDetailModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [event, onClose]);

  useEffect(() => {
    setCopied(false);
  }, [event?.id]);

  if (!event) return null;

  const effectiveAttendees = event.attendeeCount + (isRsvped ? 1 : 0);
  const fillPct = Math.min(100, Math.round((effectiveAttendees / event.capacity) * 100));
  const isFull = effectiveAttendees >= event.capacity && !isRsvped;

  const handleCopyShare = async () => {
    const shareText = `${event.title} — ${event.dateLabel}, ${event.startTime} at ${event.buildingName}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white border-l border-[#E2E8F0] shadow-[0_20px_30px_-10px_rgba(15,23,42,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F1F5F9] bg-white/95 backdrop-blur-sm px-6 py-4">
          <span className="text-xs font-semibold text-[#4C25CF]">
            {event.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF9F6] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <MediaBanner
          src={event.imageUrl}
          alt={event.imageAlt}
          category={event.category}
          title={event.title}
        />

        <div className="flex-1 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#64748B]">
            <span className="tabular-nums font-semibold text-[#0F172A]">
              {event.dateLabel} · {event.startTime} – {event.endTime}
            </span>
            {event.isLiveNow ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#00668A]">Happening Now</span>
              </>
            ) : null}
          </div>

          <h2
            id="event-detail-title"
            className="mt-2 font-display text-[24px] leading-[32px] font-bold tracking-[-0.015em] text-[#0F172A]"
          >
            {event.title}
          </h2>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#E2E8F0] bg-[#FAF9F6] p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-[#6546E8] mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F172A]">{event.buildingName}</p>
                <p className="text-[#64748B] mt-0.5">{event.room}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-[#6546E8] mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F172A]">{event.dateLabel}</p>
                <p className="text-[#64748B] mt-0.5 tabular-nums">
                  {event.startTime} – {event.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity Indicator */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#334155]">
                <Users className="h-3.5 w-3.5 text-[#64748B]" />
                Attendance Capacity
              </span>
              <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                {effectiveAttendees} / {event.capacity} ({fillPct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className="h-full rounded-full bg-[#6546E8] transition-all duration-300"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-display text-sm font-semibold text-[#0F172A]">
              About this Event
            </h3>
            <p className="mt-2 text-sm leading-[22px] text-[#334155]">{event.summary}</p>
          </div>

          {event.highlights.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                What to Expect
              </h3>
              <ul className="mt-2.5 space-y-2">
                {event.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#334155]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6546E8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Host Organization Box */}
          <div className="mt-6 border-t border-[#F1F5F9] pt-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-[#64748B]">Hosted by</p>
              <p className="font-display text-sm font-semibold text-[#0F172A] truncate">
                {event.organizationName}
              </p>
            </div>
            {organization ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectOrg(organization);
                }}
                className="cv-btn-outline h-8 rounded-lg px-3 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                View Club
              </button>
            ) : null}
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="sticky bottom-0 border-t border-[#E2E8F0] bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(event.id)}
              aria-pressed={isSaved}
              className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold cursor-pointer ${
                isSaved
                  ? 'border-[#DDD6FE] bg-[#EDE9FE] text-[#6546E8]'
                  : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#CBD5E1]'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-[#6546E8]' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => downloadEventsIcs([event], `${event.id}.ics`)}
              className="cv-btn-outline inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.ics</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShare}
              className="cv-btn-outline inline-flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isFull}
            onClick={() => onToggleRsvp(event.id)}
            aria-pressed={isRsvped}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isRsvped ? 'cv-btn-subtle' : 'cv-btn-primary'
            }`}
          >
            {isRsvped ? (
              <>
                <Check className="h-4 w-4" />
                <span>Going</span>
              </>
            ) : isFull ? (
              <span>Event Full</span>
            ) : (
              <span>RSVP Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
