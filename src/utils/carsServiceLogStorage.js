/**
 * @fileoverview Persistenz-Utilities für CarsServiceLog.
 * Kapselt LocalStorage-Zugriff und Schema-Initialisierung.
 */

export const STORAGE_KEY = "cars-service-log-state";
export const TRASH_SERVICE_STORAGE_KEY = "cars-service-log-trash";
export const DEFAULT_SCHEMA_VERSION = 1;

const safeParse = (value) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("CarsServiceLog: konnte JSON nicht parsen", error);
    return null;
  }
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

export const loadState = () => {
  if (typeof window === "undefined") {
    return {
      schemaVersion: DEFAULT_SCHEMA_VERSION,
      vehicles: [],
      serviceEntries: [],
      serviceIntervals: []
    };
  }

  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) {
    return {
      schemaVersion: DEFAULT_SCHEMA_VERSION,
      vehicles: [],
      serviceEntries: [],
      serviceIntervals: []
    };
  }
  return {
    schemaVersion: stored.schemaVersion ?? DEFAULT_SCHEMA_VERSION,
    vehicles: ensureArray(stored.vehicles),
    serviceEntries: ensureArray(stored.serviceEntries),
    serviceIntervals: ensureArray(stored.serviceIntervals)
  };
};

export const persistState = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("CarsServiceLog: konnte Zustand nicht speichern", error);
  }
};

export const loadTrashState = () => {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = safeParse(window.localStorage.getItem(TRASH_SERVICE_STORAGE_KEY));
  return ensureArray(stored);
};

export const persistTrashState = (value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRASH_SERVICE_STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error("CarsServiceLog: konnte Papierkorb nicht speichern", error);
  }
};
