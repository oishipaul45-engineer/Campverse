import { useMemo, useState } from 'react';
import { Bookmark, Check, Search } from 'lucide-react';
import { CampusEvent, OrganizationCategory, StudentOrganization } from '../types';

interface OrganizationsViewProps {
  organizations: StudentOrganization[];
  events: CampusEvent[];
  joinedOrgIds: Set<string>;
  bookmarkedOrgIds: Set<string>;
  onToggleJoinOrg: (orgId: string) => void;
  onToggleBookmarkOrg: (orgId: string) => void;
  onSelectOrg: (org: StudentOrganization) => void;
}

const ORG_CATEGORIES: ('All' | OrganizationCategory)[] = [
  'All',
  'Engineering',
  'Arts & Media',
  'Music & Culture',
  'Academic',
  'Sports & Outdoors',
];

const CREST_TONES: Record<StudentOrganization['accentTone'], string> = {
  violet: 'bg-[#EDE9FE] text-[#4C25CF]',
  blue: 'bg-[#C4E7FF]/70 text-[#004C69]',
  slate: 'bg-[#F1F5F9] text-[#0F172A]',
  emerald: 'bg-[#EAEDFF] text-[#131B2E]',
};

export function OrganizationsView({
  organizations,
  events,
  joinedOrgIds,
  bookmarkedOrgIds,
  onToggleJoinOrg,
  onToggleBookmarkOrg,
  onSelectOrg,
}: OrganizationsViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | OrganizationCategory>('All');
  const [onlyJoined, setOnlyJoined] = useState(false);

  const eventCountByOrg = useMemo(() => {
    const map = new Map<string, number>();
    for (const evt of events) {
      map.set(evt.organizationId, (map.get(evt.organizationId) ?? 0) + 1);
    }
    return map;
  }, [events]);

  const filteredOrgs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return organizations.filter((org) => {
      if (selectedCategory !== 'All' && org.category !== selectedCategory) return false;
      if (onlyJoined && !joinedOrgIds.has(org.id)) return false;
      if (q) {
        const hay = `${org.name} ${org.category} ${org.mission} ${org.room}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [organizations, query, selectedCategory, onlyJoined, joinedOrgIds]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.04em] uppercase text-[#6546E8] mb-2">
            Student Organizations Directory
          </p>
          <h1 className="font-display text-[32px] leading-[40px] font-bold tracking-[-0.02em] text-[#0F172A] [text-wrap:balance]">
            Clubs, societies, and research collectives.
          </h1>
          <p className="mt-2 text-sm leading-[22px] text-[#334155]">
            Explore recognized student organizations, weekly meeting rooms, and upcoming hosted events.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm border-t md:border-t-0 pt-4 md:pt-0 border-[#E2E8F0] shrink-0">
          <div>
            <p className="text-xs text-[#64748B]">Recognized Clubs</p>
            <p className="font-display text-xl font-bold text-[#0F172A] tabular-nums">
              {organizations.length}
            </p>
          </div>
          <div className="h-8 w-px bg-[#E2E8F0]" aria-hidden="true" />
          <div>
            <p className="text-xs text-[#64748B]">Your Memberships</p>
            <p className="font-display text-xl font-bold text-[#6546E8] tabular-nums">
              {joinedOrgIds.size}
            </p>
          </div>
        </div>
      </div>

      {/* Directory Controls */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search organizations by name or interest..."
              aria-label="Search organizations"
              className="cv-input h-10 w-full pl-9 pr-3 text-sm"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyJoined}
              onChange={(e) => setOnlyJoined(e.target.checked)}
              className="peer sr-only"
            />
            <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] border-[#CBD5E1] bg-white peer-checked:border-[#6546E8] peer-checked:bg-[#6546E8] transition-colors">
              {onlyJoined ? <Check className="h-3 w-3 text-white stroke-[3]" /> : null}
            </span>
            <span>Joined clubs only</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Organization categories">
          {ORG_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EDE9FE] text-[#4C25CF]'
                    : 'text-[#334155] hover:bg-[#F2F3FF] hover:text-[#0F172A]'
                }`}
              >
                {category === 'All' ? 'All Organizations' : category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory List (Borderless rows separated by 1px solid #F1F5F9 per spec) */}
      {filteredOrgs.length > 0 ? (
        <div className="cv-card overflow-hidden divide-y divide-[#F1F5F9]">
          {filteredOrgs.map((org) => {
            const isJoined = joinedOrgIds.has(org.id);
            const isBookmarked = bookmarkedOrgIds.has(org.id);
            const hostedCount = eventCountByOrg.get(org.id) ?? 0;

            return (
              <div
                key={org.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 hover:bg-[#FAF9F6]/70 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onSelectOrg(org)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold cursor-pointer ${CREST_TONES[org.accentTone]}`}
                    aria-label={`Open ${org.name} profile`}
                  >
                    {org.initials}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onSelectOrg(org)}
                        className="font-display text-base font-semibold text-[#0F172A] hover:text-[#6546E8] transition-colors text-left cursor-pointer"
                      >
                        {org.name}
                      </button>
                      <span className="text-xs font-medium text-[#4C25CF]">
                        {org.category}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-[22px] text-[#334155] max-w-3xl">
                      {org.mission}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#64748B]">
                      <span className="tabular-nums font-medium text-[#334155]">
                        {org.memberCount + (isJoined ? 1 : 0)} members
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Meets {org.meetingSchedule}</span>
                      <span aria-hidden="true">·</span>
                      <span>{org.room}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {hostedCount} upcoming {hostedCount === 1 ? 'event' : 'events'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pl-14 lg:pl-0">
                  <button
                    type="button"
                    onClick={() => onToggleBookmarkOrg(org.id)}
                    aria-label={isBookmarked ? `Remove ${org.name} bookmark` : `Bookmark ${org.name}`}
                    aria-pressed={isBookmarked}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'border-[#DDD6FE] bg-[#EDE9FE] text-[#6546E8]'
                        : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A]'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-[#6546E8]' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectOrg(org)}
                    className="cv-btn-outline h-9 rounded-lg px-3.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    View Events
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleJoinOrg(org.id)}
                    aria-pressed={isJoined}
                    className={`h-9 rounded-lg px-4 text-xs font-semibold whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                      isJoined ? 'cv-btn-subtle' : 'cv-btn-primary'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <span>Join Club</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="cv-card p-12 text-center">
          <h3 className="font-display text-lg font-semibold text-[#0F172A]">
            No organizations found
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
            Adjust your search or category filter to view more student organizations.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
              setOnlyJoined(false);
            }}
            className="cv-btn-subtle mt-5 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            Show All Clubs
          </button>
        </div>
      )}
    </div>
  );
}
