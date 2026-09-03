import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import LocationService from '@/lib/locationService';

const LocationContext = createContext(null);
const SESSION_KEY = 'ibarti_active_area';

/**
 * Single source of truth for the active area the UI is showing listings for.
 *
 * On mount it silently resolves the user's location (GPS → IP → default) via
 * LocationService and caches it per-session. `selectArea` overrides it (a manual
 * picker choice); `resetArea` re-detects from scratch ("Use my location").
 *
 * Both the homepage listings and any explore cards read this same context, so a
 * single area change re-filters everything consistently.
 */
export function LocationProvider({ children }) {
  const [activeArea, setActiveArea] = useState(null);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cached = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        if (cached && cached.latitude != null) {
          setActiveArea(cached);
          setResolving(false);
          return;
        }
      } catch { /* ignore malformed cache */ }
      const area = await LocationService.getCurrentLocation();
      setActiveArea(area);
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(area)); } catch { /* storage blocked */ }
      setResolving(false);
    })();
  }, []);

  const selectArea = useCallback((area) => {
    const next = {
      latitude: undefined,
      longitude: undefined,
      city: '',
      country: '',
      ...area,
      source: 'manual',
    };
    setActiveArea(next);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const resetArea = useCallback(async () => {
    setResolving(true);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    const area = await LocationService.getCurrentLocation();
    setActiveArea(area);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(area)); } catch { /* ignore */ }
    setResolving(false);
  }, []);

  return (
    <LocationContext.Provider value={{ activeArea, resolving, selectArea, resetArea }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) return { activeArea: null, resolving: false, selectArea: () => {}, resetArea: () => {} };
  return ctx;
}