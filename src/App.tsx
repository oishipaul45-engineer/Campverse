/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import FirebaseAuth from './components/FirebaseAuth';
import { CampusMapView } from './components/CampusMapView';
import { auth } from './firebase';
import { DiscoverView } from './components/DiscoverView';
import { EventDetailModal } from './components/EventDetailModal';
import { OrgDetailModal } from './components/OrgDetailModal';
import { OrganizationsView } from './components/OrganizationsView';
import { PostEventModal } from './components/PostEventModal';
import { ProfileView } from './components/ProfileView';
import { ScheduleView } from './components/ScheduleView';
import { TopNav } from './components/TopNav';
import {
  CAMPUS_BUILDINGS,
  INITIAL_EVENTS,
  STUDENT_ORGANIZATIONS,
} from './data/campusData';
import {
  CampusEvent,
  EventCategory,
  ScreenView,
  StudentOrganization,
} from './types';

type AppScreenView = ScreenView | 'profile';

const STORAGE_KEYS = {
  interests: 'campverse_interests_v1',
  events: 'campverse_custom_events_v1',
  rsvps: 'campverse_rsvps_v1',
  saved: 'campverse_saved_v1',
  joinedOrgs: 'campverse_joined_orgs_v1',
  bookmarkedOrgs: 'campverse_bookmarked_orgs_v1',
};

function readStoredIds(key: string, fallback: string[]): Set<string> {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return new Set(fallback);
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? new Set(parsed)
      : new Set(fallback);
  } catch {
    return new Set(fallback);
  }
}

function readStoredEvents(): CampusEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.events);

    if (!raw) {
      return INITIAL_EVENTS;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_EVENTS;
    }

    return parsed;
  } catch {
    return INITIAL_EVENTS;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('campverse_auth')
  );

  const [activeScreen, setActiveScreen] =
    useState<AppScreenView>('discover');
  const navigateToScreen = (screen: ScreenView) => {
    setActiveScreen(screen);
  };

  const navigateToProfile = () => {
    setActiveScreen('profile');
  };

  const [events, setEvents] =
    useState<CampusEvent[]>(readStoredEvents);

  const [rsvpedIds, setRsvpedIds] = useState<Set<string>>(() =>
    readStoredIds(STORAGE_KEYS.rsvps, [
      'evt-hackathon',
      'evt-quad-acoustic',
    ])
  );

  const [savedIds, setSavedIds] = useState<Set<string>>(() =>
    readStoredIds(STORAGE_KEYS.saved, [
      'evt-design-showcase',
    ])
  );

  const [joinedOrgIds, setJoinedOrgIds] = useState<Set<string>>(() =>
    readStoredIds(STORAGE_KEYS.joinedOrgs, [
      'org-acm',
      'org-design',
    ])
  );

  const [bookmarkedOrgIds, setBookmarkedOrgIds] =
    useState<Set<string>>(() =>
      readStoredIds(STORAGE_KEYS.bookmarkedOrgs, [
        'org-cinema',
      ])
    );

  const [interests, setInterests] = useState<EventCategory[]>(() => {
    try {
      const raw = localStorage.getItem(
        STORAGE_KEYS.interests
      );

      const parsed = raw ? JSON.parse(raw) : null;

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        return parsed as EventCategory[];
      }
    } catch {
      // Ignore malformed local preferences.
    }

    return ['Tech & Hackathons', 'Academic'];
  });

  const [selectedEvent, setSelectedEvent] =
    useState<CampusEvent | null>(null);

  const [selectedOrg, setSelectedOrg] =
    useState<StudentOrganization | null>(null);

  const [isPostModalOpen, setIsPostModalOpen] =
    useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.events,
        JSON.stringify(events)
      );
    } catch {
      // Ignore storage quota errors.
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.rsvps,
        JSON.stringify(Array.from(rsvpedIds))
      );
    } catch {
      // Ignore storage errors.
    }
  }, [rsvpedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.saved,
        JSON.stringify(Array.from(savedIds))
      );
    } catch {
      // Ignore storage errors.
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.joinedOrgs,
        JSON.stringify(Array.from(joinedOrgIds))
      );
    } catch {
      // Ignore storage errors.
    }
  }, [joinedOrgIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.bookmarkedOrgs,
        JSON.stringify(
          Array.from(bookmarkedOrgIds)
        )
      );
    } catch {
      // Ignore storage errors.
    }
  }, [bookmarkedOrgIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.interests,
        JSON.stringify(interests)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [interests]);

  const toggleSetMember = (
    setter: React.Dispatch<
      React.SetStateAction<Set<string>>
    >,
    id: string
  ) => {
    setter((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleInterest = (
    interest: EventCategory
  ) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter(
            (item) => item !== interest
          )
        : [...prev, interest]
    );
  };

  const handleCreateEvent = (
    newEvent: CampusEvent
  ) => {
    setEvents((prev) => [
      newEvent,
      ...prev,
    ]);

    setRsvpedIds((prev) => {
      const next = new Set(prev);
      next.add(newEvent.id);
      return next;
    });

    setActiveScreen('discover');
  };

  const selectedEventOrg = useMemo(
    () =>
      selectedEvent
        ? STUDENT_ORGANIZATIONS.find(
            (organization) =>
              organization.id ===
              selectedEvent.organizationId
          )
        : undefined,
    [selectedEvent]
  );

  const FirebaseAuthWithProps =
    FirebaseAuth as React.ComponentType<{
      onAuthenticated?: () => void;
    }>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <FirebaseAuthWithProps
          onAuthenticated={() => {
            localStorage.setItem('campverse_auth', 'true');
            setIsAuthenticated(true);
          }}
        />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <FirebaseAuth
          onAuthenticated={() => {
            localStorage.setItem(
              'campverse_auth',
              'true'
            );

            setIsAuthenticated(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#0F172A]">

      <TopNav
        activeScreen={
          activeScreen === 'profile'
            ? 'discover'
            : activeScreen
        }
        onNavigate={navigateToScreen}
        onOpenPostEvent={() =>
          setIsPostModalOpen(true)
        }
        rsvpCount={rsvpedIds.size}
      />

      <main className="flex-1">

        {activeScreen === 'discover' ? (
          <DiscoverView
            events={events}
            organizations={
              STUDENT_ORGANIZATIONS
            }
            rsvpedIds={rsvpedIds}
            savedIds={savedIds}
            joinedOrgIds={joinedOrgIds}
            onToggleRsvp={(id) =>
              toggleSetMember(
                setRsvpedIds,
                id
              )
            }
            onToggleSave={(id) =>
              toggleSetMember(
                setSavedIds,
                id
              )
            }
            onToggleJoinOrg={(id) =>
              toggleSetMember(
                setJoinedOrgIds,
                id
              )
            }
            onSelectEvent={setSelectedEvent}
            onSelectOrg={setSelectedOrg}
            onNavigate={navigateToScreen}
          />
        ) : null}

        {activeScreen === 'organizations' ? (
          <OrganizationsView
            organizations={
              STUDENT_ORGANIZATIONS
            }
            events={events}
            joinedOrgIds={joinedOrgIds}
            bookmarkedOrgIds={
              bookmarkedOrgIds
            }
            onToggleJoinOrg={(id) =>
              toggleSetMember(
                setJoinedOrgIds,
                id
              )
            }
            onToggleBookmarkOrg={(id) =>
              toggleSetMember(
                setBookmarkedOrgIds,
                id
              )
            }
            onSelectOrg={setSelectedOrg}
          />
        ) : null}

        {activeScreen === 'schedule' ? (
          <ScheduleView
            events={events}
            organizations={
              STUDENT_ORGANIZATIONS
            }
            rsvpedIds={rsvpedIds}
            savedIds={savedIds}
            joinedOrgIds={joinedOrgIds}
            onToggleRsvp={(id) =>
              toggleSetMember(
                setRsvpedIds,
                id
              )
            }
            onToggleSave={(id) =>
              toggleSetMember(
                setSavedIds,
                id
              )
            }
            onSelectEvent={setSelectedEvent}
            onSelectOrg={setSelectedOrg}
            onNavigate={navigateToScreen}
          />
        ) : null}

        {activeScreen === 'map' ? (
          <CampusMapView
            buildings={CAMPUS_BUILDINGS}
            events={events}
            rsvpedIds={rsvpedIds}
            onToggleRsvp={(id) =>
              toggleSetMember(
                setRsvpedIds,
                id
              )
            }
            onSelectEvent={setSelectedEvent}
          />
        ) : null}

        {activeScreen === 'profile' ? (
          <ProfileView
            events={events}
            organizations={
              STUDENT_ORGANIZATIONS
            }
            rsvpedIds={rsvpedIds}
            savedIds={savedIds}
            joinedOrgIds={joinedOrgIds}
            interests={interests}
            onToggleInterest={toggleInterest}
            onSelectEvent={setSelectedEvent}
            onNavigate={navigateToScreen}
          />
        ) : null}

      </main>

      <footer className="mt-16 border-t border-[#E2E8F0] bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-[1280px] flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8 text-xs text-[#64748B]">

          <p className="font-medium text-[#334155]">
            CampVerse · Student Campus Discovery
          </p>

          <div className="flex items-center gap-6">

            <button
              type="button"
              onClick={() =>
                setActiveScreen('discover')
              }
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Discover
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveScreen(
                  'organizations'
                )
              }
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Organizations
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveScreen('schedule')
              }
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              My Schedule
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveScreen('map')
              }
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Campus Map
            </button>

            <button
              type="button"
              onClick={navigateToProfile}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              My Profile
            </button>

          </div>
        </div>
      </footer>

      <EventDetailModal
        event={selectedEvent}
        organization={selectedEventOrg}
        isRsvped={
          selectedEvent
            ? rsvpedIds.has(
                selectedEvent.id
              )
            : false
        }
        isSaved={
          selectedEvent
            ? savedIds.has(
                selectedEvent.id
              )
            : false
        }
        onClose={() =>
          setSelectedEvent(null)
        }
        onToggleRsvp={(id) =>
          toggleSetMember(
            setRsvpedIds,
            id
          )
        }
        onToggleSave={(id) =>
          toggleSetMember(
            setSavedIds,
            id
          )
        }
        onSelectOrg={(org) =>
          setSelectedOrg(org)
        }
      />

      <OrgDetailModal
        organization={selectedOrg}
        events={events}
        isJoined={
          selectedOrg
            ? joinedOrgIds.has(
                selectedOrg.id
              )
            : false
        }
        rsvpedIds={rsvpedIds}
        onClose={() =>
          setSelectedOrg(null)
        }
        onToggleJoin={(id) =>
          toggleSetMember(
            setJoinedOrgIds,
            id
          )
        }
        onToggleRsvp={(id) =>
          toggleSetMember(
            setRsvpedIds,
            id
          )
        }
        onSelectEvent={(evt) =>
          setSelectedEvent(evt)
        }
      />

      <PostEventModal
        isOpen={isPostModalOpen}
        buildings={CAMPUS_BUILDINGS}
        organizations={
          STUDENT_ORGANIZATIONS
        }
        onClose={() =>
          setIsPostModalOpen(false)
        }
        onCreateEvent={
          handleCreateEvent
        }
      />

    </div>
  );
}