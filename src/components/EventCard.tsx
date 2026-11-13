import { Bookmark, Check, MapPin, Users } from 'lucide-react';
import { CampusEvent } from '../types';
import { MediaBanner } from './MediaBanner';

interface EventCardProps {
  event: CampusEvent;
  isRsvped: boolean;
  isSaved: boolean;
  onToggleRsvp: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
}

export function EventCard({
  event,
  isRsvped,
  isSaved,
  onToggleRsvp,
  onToggleSave,
  onSelectEvent,
}: EventCardProps) {
  const effectiveAttendees = event.attendeeCount + (isRsvped ? 1 : 0);
  const isFull = effectiveAttendees >= event.capacity && !isRsvped;

  return (
    <article className="cv-card cv-card-interactive group flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onSelectEvent(event)}
        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#6546E8] cursor-pointer"
      >
        <MediaBanner
          src={event.imageUrl}
          alt={event.imageAlt}
          category={event.category}
          title={event.title}
        />
      </button>

      <div className="flex flex-1 flex-col p-6">
        {/* Clean unboxed metadata row — no static pill enclosures */}
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#64748B]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[#4C25CF] font-semibold">{event.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums whitespace-nowrap">
              {event.dateLabel}, {event.startTime}
            </span>
          </div>
          {event.isLiveNow ? (
            <span className="text-[#00668A] font-semibold whitespace-nowrap shrink-0">
              Happening Now
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onSelectEvent(event)}
          className="mt-2.5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6546E8] rounded-sm"
        >
          <h3 className="font-display text-[18px] leading-[26px] font-semibold tracking-[-0.01em] text-[#0F172A] group-hover:text-[#6546E8] transition-colors">
            {event.title}
          </h3>
        </button>

        <p className="mt-2 text-sm leading-[22px] text-[#334155] line-clamp-2">
          {event.summary}
        </p>

        {/* Campus building & tabular capacity */}
        <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-[#64748B]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
            <span className="truncate">
              {event.buildingName} · {event.room}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
            <span className="tabular-nums">
              {effectiveAttendees} / {event.capacity} going
            </span>
            {event.hasFreeRefreshments ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Refreshments</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto pt-5 flex items-center justify-between gap-3 border-t border-[#F1F5F9]">
          <span className="text-xs font-medium text-[#64748B] truncate">
            Hosted by <span className="text-[#334155]">{event.organizationName}</span>
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(event.id)}
              aria-label={isSaved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
              aria-pressed={isSaved}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6546E8] ${
                isSaved
                  ? 'border-[#DDD6FE] bg-[#EDE9FE] text-[#6546E8]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A]'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-[#6546E8]' : ''}`} />
            </button>

            <button
              type="button"
              disabled={isFull}
              onClick={() => onToggleRsvp(event.id)}
              aria-pressed={isRsvped}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6546E8] disabled:cursor-not-allowed disabled:opacity-50 ${
                isRsvped
                  ? 'cv-btn-subtle'
                  : 'cv-btn-primary'
              }`}
            >
              {isRsvped ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Going</span>
                </>
              ) : isFull ? (
                <span>Full</span>
              ) : (
                <span>RSVP</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
