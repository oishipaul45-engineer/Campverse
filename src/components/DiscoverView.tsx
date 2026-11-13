import { useMemo, useState } from 'react';
import { ArrowRight, Check, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { CampusEvent, EventCategory, ScreenView, StudentOrganization } from '../types';
import { EventCard } from './EventCard';
import { MediaBanner } from './MediaBanner';

interface DiscoverViewProps {
  events: CampusEvent[];
  organizations: StudentOrganization[];
  rsvpedIds: Set<string>;
  savedIds: Set<string>;
  joinedOrgIds: Set<string>;
  onToggleRsvp: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
  onToggleJoinOrg: (orgId: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onSelectOrg: (org: StudentOrganization) => void;
  onNavigate: (screen: ScreenView) => void;
}

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Tech & Hackathons',
  'Arts & Design',
  'Music & Social',
  'Academic',
  'Athletics',
];

export function DiscoverView({
  events,
  organizations,
  rsvpedIds,
  savedIds,
  joinedOrgIds,
  onToggleRsvp,
  onToggleSave,
  onToggleJoinOrg,
  onSelectEvent,
  onSelectOrg,
  onNavigate,
}: DiscoverViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [onlyOpenSpots, setOnlyOpenSpots] = useState(false);
  const [onlyThisWeek, setOnlyThisWeek] = useState(false);
  const [onlyRefreshments, setOnlyRefreshments] = useState(false);
  const [sortBy, setSortBy] = useState<'upcoming' | 'popular'>('upcoming');

  const featuredEvent = useMemo(
    () => events.find((e) => e.isFeatured) ?? events[0],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = events.filter((event) => {
      if (selectedCategory !== 'All' && event.category !== selectedCategory) return false;
      if (onlyOpenSpots && event.attendeeCount + (rsvpedIds.has(event.id) ? 1 : 0) >= event.capacity) {
        return false;
      }
      if (onlyThisWeek && event.dayBucket === 'Next Week') return false;
      if (onlyRefreshments && !event.hasFreeRefreshments) return false;
      if (q) {
        const hay = `${event.title} ${event.buildingName} ${event.organizationName} ${event.category} ${event.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'popular') {
      return [...list].sort(
        (a, b) =>
          b.attendeeCount + (rsvpedIds.has(b.id) ? 1 : 0) -
          (a.attendeeCount + (rsvpedIds.has(a.id) ? 1 : 0))
      );
    }
    return [...list].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, [
    events,
    searchQuery,
    selectedCategory,
    onlyOpenSpots,
    onlyThisWeek,
    onlyRefreshments,
    sortBy,
    rsvpedIds,
  ]);

  const featuredRsvped = featuredEvent ? rsvpedIds.has(featuredEvent.id) : false;
  const featuredCount = featuredEvent
    ? featuredEvent.attendeeCount + (featuredRsvped ? 1 : 0)
    : 0;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header & Unified Search Dock */}
      <section className="mb-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.04em] uppercase text-[#6546E8] mb-3">
            Fall Semester · Campus Discovery
          </p>
          <h1 className="font-display text-[36px] leading-[44px] sm:text-[48px] sm:leading-[56px] font-bold tracking-[-0.03em] text-[#0F172A] [text-wrap:balance]">
            Discover what’s happening across campus today.
          </h1>
          <p className="mt-4 text-base leading-[26px] text-[#334155] max-w-2xl">
            Browse student-hosted buildathons, studio critiques, quad concerts, and academic colloquia across every building and society.
          </p>
        </div>

        {/* Hero Search Input (48px height per spec) */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, buildings, or student clubs..."
              aria-label="Search campus events"
              className="cv-input h-12 w-full pl-10 pr-4 text-sm"
            />
          </div>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="cv-btn-outline h-12 rounded-lg px-4 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {/* Featured Spotlight Card (Split 2-column with items-stretch) */}
      {featuredEvent && !searchQuery && selectedCategory === 'All' ? (
        <section aria-label="Featured campus event" className="mb-12">
          <div className="cv-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7">
              <button
                type="button"
                onClick={() => onSelectEvent(featuredEvent)}
                className="block h-full w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#6546E8]"
              >
                <MediaBanner
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.imageAlt}
                  category={featuredEvent.category}
                  title={featuredEvent.title}
                  className="h-full lg:aspect-auto lg:min-h-[340px]"
                />
              </button>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                  <span className="font-semibold text-[#4C25CF]">Featured Event</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#00668A] font-semibold">
                    {featuredEvent.isLiveNow ? 'Happening Now' : featuredEvent.dateLabel}
                  </span>
                </div>

                <h2 className="mt-3 font-display text-[24px] leading-[32px] font-semibold tracking-[-0.015em] text-[#0F172A] [text-wrap:balance]">
                  {featuredEvent.title}
                </h2>

                <p className="mt-3 text-sm leading-[22px] text-[#334155]">
                  {featuredEvent.summary}
                </p>

                <div className="mt-5 space-y-2 border-t border-[#F1F5F9] pt-4 text-[13px] text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#6546E8]" />
                    <span>
                      {featuredEvent.buildingName} · {featuredEvent.room}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <Users className="h-4 w-4 shrink-0 text-[#6546E8]" />
                    <span>
                      {featuredCount} / {featuredEvent.capacity} students attending · {featuredEvent.startTime} – {featuredEvent.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleRsvp(featuredEvent.id)}
                  aria-pressed={featuredRsvped}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    featuredRsvped ? 'cv-btn-subtle' : 'cv-btn-primary'
                  }`}
                >
                  {featuredRsvped ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Going</span>
                    </>
                  ) : (
                    <span>RSVP Now</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectEvent(featuredEvent)}
                  className="cv-btn-outline inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Event Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Filter Bar & Checkboxes */}
      <section aria-label="Filter campus events" className="mb-8">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Interactive segmented category tabs */}
            <div
              role="tablist"
              aria-label="Event categories"
              className="flex flex-wrap items-center gap-1.5"
            >
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6546E8] ${
                      active
                        ? 'bg-[#EDE9FE] text-[#4C25CF]'
                        : 'bg-transparent text-[#334155] hover:bg-[#F2F3FF] hover:text-[#0F172A]'
                    }`}
                  >
                    {category === 'All' ? 'All Events' : category}
                  </button>
                );
              })}
            </div>

            {/* Sort control */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
              <label htmlFor="discover-sort" className="text-xs font-medium text-[#64748B]">
                Sort:
              </label>
              <select
                id="discover-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'upcoming' | 'popular')}
                className="cv-input h-9 px-2.5 text-xs font-medium text-[#0F172A] cursor-pointer"
              >
                <option value="upcoming">Upcoming Soon</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* 16px Custom Checkboxes per CampVerse design specification */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOpenSpots}
                  onChange={(e) => setOnlyOpenSpots(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] border-[#CBD5E1] bg-white peer-checked:border-[#6546E8] peer-checked:bg-[#6546E8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6546E8]/30 transition-colors">
                  {onlyOpenSpots ? <Check className="h-3 w-3 text-white stroke-[3]" /> : null}
                </span>
                <span>Open spots only</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyThisWeek}
                  onChange={(e) => setOnlyThisWeek(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] border-[#CBD5E1] bg-white peer-checked:border-[#6546E8] peer-checked:bg-[#6546E8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6546E8]/30 transition-colors">
                  {onlyThisWeek ? <Check className="h-3 w-3 text-white stroke-[3]" /> : null}
                </span>
                <span>This week</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyRefreshments}
                  onChange={(e) => setOnlyRefreshments(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] border-[#CBD5E1] bg-white peer-checked:border-[#6546E8] peer-checked:bg-[#6546E8] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6546E8]/30 transition-colors">
                  {onlyRefreshments ? <Check className="h-3 w-3 text-white stroke-[3]" /> : null}
                </span>
                <span>Refreshments provided</span>
              </label>
            </div>

            <p className="text-xs font-medium text-[#64748B] tabular-nums">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Event Card Grid */}
      {filteredEvents.length > 0 ? (
        <section aria-label="Campus events grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRsvped={rsvpedIds.has(event.id)}
              isSaved={savedIds.has(event.id)}
              onToggleRsvp={onToggleRsvp}
              onToggleSave={onToggleSave}
              onSelectEvent={onSelectEvent}
            />
          ))}
        </section>
      ) : (
        <section className="cv-card p-12 text-center">
          <h3 className="font-display text-lg font-semibold text-[#0F172A]">
            No campus events match those filters
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
            Try clearing one of your active filters or search terms to explore more events.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyOpenSpots(false);
              setOnlyThisWeek(false);
              setOnlyRefreshments(false);
            }}
            className="cv-btn-subtle mt-5 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </section>
      )}

      {/* Active Student Organizations Preview Directory */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-[24px] leading-[32px] font-semibold tracking-[-0.015em] text-[#0F172A]">
              Active Student Organizations
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Clubs and societies hosting workshops, showcases, and weekly meetups this term.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('organizations')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6546E8] hover:text-[#4C25CF] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View directory</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="cv-card overflow-hidden divide-y divide-[#F1F5F9]">
          {organizations.slice(0, 4).map((org) => {
            const isJoined = joinedOrgIds.has(org.id);
            return (
              <div
                key={org.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelectOrg(org)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#EDE9FE] font-display text-sm font-bold text-[#4C25CF] cursor-pointer"
                  >
                    {org.initials}
                  </button>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectOrg(org)}
                      className="text-left font-display text-sm font-semibold text-[#0F172A] hover:text-[#6546E8] transition-colors truncate block cursor-pointer"
                    >
                      {org.name}
                    </button>
                    <p className="mt-0.5 text-xs text-[#64748B] truncate">
                      <span>{org.category}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="tabular-nums">{org.memberCount} members</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>{org.meetingSchedule}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectOrg(org)}
                    className="cv-btn-outline rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleJoinOrg(org.id)}
                    aria-pressed={isJoined}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      isJoined ? 'cv-btn-subtle' : 'cv-btn-primary'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join Club'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
