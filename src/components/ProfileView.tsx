import { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Bookmark,
  Check,
  Compass,
  Heart,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import {
  CampusEvent,
  EventCategory,
  StudentOrganization,
} from '../types';

interface ProfileViewProps {
  events: CampusEvent[];
  organizations: StudentOrganization[];
  rsvpedIds: Set<string>;
  savedIds: Set<string>;
  joinedOrgIds: Set<string>;
  interests: EventCategory[];
  onToggleInterest: (interest: EventCategory) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onNavigate: (screen: 'discover' | 'organizations' | 'schedule' | 'map') => void;
}

const INTERESTS: EventCategory[] = [
  'Tech & Hackathons',
  'Arts & Design',
  'Music & Social',
  'Academic',
  'Athletics',
];

const INTEREST_ICONS: Record<EventCategory, string> = {
  'Tech & Hackathons': '⌘',
  'Arts & Design': '✦',
  'Music & Social': '♫',
  Academic: '∑',
  Athletics: '↗',
};

export function ProfileView({
  events,
  organizations,
  rsvpedIds,
  savedIds,
  joinedOrgIds,
  interests,
  onToggleInterest,
  onSelectEvent,
  onNavigate,
}: ProfileViewProps) {
  const [showAllInterests, setShowAllInterests] = useState(false);

  const recommended = useMemo(() => {
    return [...events]
      .filter((event) => !rsvpedIds.has(event.id))
      .map((event) => {
        let score = 35;
        if (interests.includes(event.category)) score += 45;
        if (savedIds.has(event.id)) score += 10;
        if (event.isFeatured) score += 5;
        if (event.hasFreeRefreshments) score += 2;
        if (event.dayBucket === 'Today') score += 3;
        return { event, score: Math.min(99, score) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [events, interests, rsvpedIds, savedIds]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<EventCategory, number>();
    for (const event of events) {
      if (rsvpedIds.has(event.id)) {
        counts.set(event.category, (counts.get(event.category) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [events, rsvpedIds]);

  const activityScore = Math.min(
    100,
    rsvpedIds.size * 12 + savedIds.size * 5 + joinedOrgIds.size * 8
  );

  const joinedOrganizations = organizations.filter((org) => joinedOrgIds.has(org.id));
  const visibleInterests = showAllInterests ? INTERESTS : INTERESTS.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="cv-profile-hero overflow-hidden rounded-3xl border border-[#DDD6FE] bg-[#F4F1FF]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#4C25CF]">
              <Sparkles className="h-3.5 w-3.5" />
              Your Campus Identity
            </div>

            <h1 className="mt-5 max-w-2xl font-display text-[34px] leading-[42px] font-bold tracking-[-0.03em] text-[#0F172A] sm:text-[46px] sm:leading-[54px]">
              A campus experience shaped around what you actually care about.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#475569]">
              CampVerse learns only from your on-device activity and chosen interests.
              No account is required for this demo.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {visibleInterests.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => onToggleInterest(interest)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? 'border-[#6546E8] bg-[#6546E8] text-white shadow-sm'
                        : 'border-[#DDD6FE] bg-white text-[#475569] hover:border-[#B8A9F5] hover:text-[#4C25CF]'
                    }`}
                  >
                    <span aria-hidden="true">{INTEREST_ICONS[interest]}</span>
                    {interest}
                    {active ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowAllInterests((value) => !value)}
                className="rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#6546E8] hover:bg-white/70"
              >
                {showAllInterests ? 'Show less' : 'More interests'}
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                    Campus activity
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-[#0F172A]">
                    {activityScore}
                    <span className="text-base text-[#94A3B8]">/100</span>
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#6546E8]">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EDE9FE]">
                <div
                  className="h-full rounded-full bg-[#6546E8] transition-all"
                  style={{ width: `${activityScore}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#64748B]">
                Build your campus footprint by discovering events, joining clubs,
                and saving things you do not want to miss.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'RSVPs', value: rsvpedIds.size, icon: CalendarIcon },
          { label: 'Saved', value: savedIds.size, icon: Bookmark },
          { label: 'Clubs', value: joinedOrgIds.size, icon: Users },
          { label: 'Interests', value: interests.length, icon: Heart },
        ].map((stat) => (
          <div key={stat.label} className="cv-card p-5">
            <stat.icon className="h-4 w-4 text-[#6546E8]" />
            <p className="mt-3 font-display text-2xl font-bold text-[#0F172A]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium text-[#64748B]">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#6546E8]">
                Smart matching
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-[#0F172A]">
                Events picked for you
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('discover')}
              className="text-xs font-semibold text-[#6546E8] hover:text-[#4C25CF]"
            >
              Explore all →
            </button>
          </div>

          <div className="space-y-3">
            {recommended.map(({ event, score }) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="cv-card cv-card-interactive flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F4F1FF] font-display text-sm font-bold text-[#6546E8]">
                  {score}%
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6546E8]">
                      {event.category}
                    </span>
                    {event.isLiveNow ? (
                      <span className="text-[11px] font-semibold text-[#00668A]">
                        Live now
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1 truncate font-display text-sm font-bold text-[#0F172A]">
                    {event.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-[#64748B]">
                    {event.dateLabel} · {event.startTime} · {event.buildingName}
                  </p>
                </div>
                <Compass className="h-4 w-4 shrink-0 text-[#94A3B8]" />
              </button>
            ))}

            {recommended.length === 0 ? (
              <div className="cv-card p-8 text-center">
                <p className="font-display text-base font-semibold text-[#0F172A]">
                  You are all caught up.
                </p>
                <p className="mt-1 text-sm text-[#64748B]">
                  Explore Discover to find more campus experiences.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="cv-card p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#6546E8]" />
              <h2 className="font-display text-base font-bold text-[#0F172A]">
                Your activity mix
              </h2>
            </div>

            {categoryCounts.length > 0 ? (
              <div className="mt-5 space-y-3">
                {categoryCounts.map(([category, count]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#334155]">{category}</span>
                      <span className="font-semibold text-[#0F172A]">{count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div
                        className="h-full rounded-full bg-[#6546E8]"
                        style={{
                          width: `${Math.min(
                            100,
                            (count / Math.max(...categoryCounts.map(([, value]) => value))) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[#64748B]">
                RSVP to a few events and your activity mix will appear here.
              </p>
            )}
          </section>

          <section className="cv-card p-6">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#6546E8]" />
              <h2 className="font-display text-base font-bold text-[#0F172A]">
                Your clubs
              </h2>
            </div>

            {joinedOrganizations.length > 0 ? (
              <div className="mt-4 space-y-3">
                {joinedOrganizations.slice(0, 4).map((org) => (
                  <div key={org.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE] text-xs font-bold text-[#4C25CF]">
                      {org.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {org.name}
                      </p>
                      <p className="text-xs text-[#64748B]">{org.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('organizations')}
                className="mt-4 text-left text-sm leading-6 text-[#6546E8]"
              >
                Discover clubs that match your interests →
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function CalendarIcon(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>;
}
