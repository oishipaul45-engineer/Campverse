import { Plus } from 'lucide-react';
import { ScreenView } from '../types';

interface TopNavProps {
  activeScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  onOpenPostEvent: () => void;
  rsvpCount: number;
}

const NAV_ITEMS: { id: ScreenView; label: string }[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'map', label: 'Campus Map' },
];

export function TopNav({ activeScreen, onNavigate, onOpenPostEvent, rsvpCount }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-[#FAF9F6]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('discover')}
          className="font-display text-xl font-bold tracking-[-0.03em] text-[#0F172A] hover:text-[#6546E8] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6546E8] rounded-sm cursor-pointer"
        >
          CampVerse
        </button>

        {/* Zone 2: 4 single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6546E8] rounded-sm ${
                  isActive
                    ? 'text-[#6546E8] font-semibold'
                    : 'text-[#334155] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
                {item.id === 'schedule' && rsvpCount > 0 ? (
                  <span className="ml-1.5 tabular-nums text-xs text-[#64748B]">
                    ({rsvpCount})
                  </span>
                ) : null}
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-[2px] bg-[#6546E8]"
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenPostEvent}
            className="cv-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6546E8]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Post Event</span>
          </button>
        </div>
      </div>

      {/* Compact mobile switcher kept minimal to respect 15% mobile sticky cap */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-between border-t border-[#F1F5F9] px-4 py-1.5 overflow-x-auto gap-4"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive ? 'text-[#6546E8]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {item.label}
              {item.id === 'schedule' && rsvpCount > 0 ? ` (${rsvpCount})` : ''}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
