/**
 * @file useCarsServiceLogManager.js
 * @description Zentraler Store für CarsServiceLog (Fahrzeuge, Services, Intervalle, Papierkorb).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateId } from "../utils/entries.js";
import {
  DEFAULT_SCHEMA_VERSION,
  loadState,
  loadTrashState,
  persistState,
  persistTrashState
} from "../utils/carsServiceLogStorage.js";

const ensureUniqueId = (value) => value?.id ?? generateId();

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const buildStateSnapshot = (schemaVersion, vehicles, serviceEntries, serviceIntervals) => ({
  schemaVersion,
  vehicles,
  serviceEntries,
  serviceIntervals
});

const useCarsServiceLogManager = () => {
  const initialState = useMemo(() => loadState(), []);
  const [vehicles, setVehicles] = useState(initialState.vehicles);
  const [serviceEntries, setServiceEntries] = useState(initialState.serviceEntries);
  const [serviceIntervals, setServiceIntervals] = useState(initialState.serviceIntervals);
  const [trashServiceEntries, setTrashServiceEntries] = useState(() => loadTrashState());
  const [schemaVersion, setSchemaVersion] = useState(initialState.schemaVersion);

  useEffect(() => {
    persistState(buildStateSnapshot(schemaVersion, vehicles, serviceEntries, serviceIntervals));
  }, [schemaVersion, vehicles, serviceEntries, serviceIntervals]);

  useEffect(() => {
    persistTrashState(trashServiceEntries);
  }, [trashServiceEntries]);

  const addVehicle = useCallback((vehicle) => {
    const newVehicle = {
      ...vehicle,
      id: ensureUniqueId(vehicle),
      currentMileage: typeof vehicle.currentMileage === "number" ? vehicle.currentMileage : 0
    };
    setVehicles((prev) => [...prev, newVehicle]);
    return newVehicle;
  }, []);

  const updateVehicle = useCallback((id, updates) => {
    setVehicles((prev) =>
      prev.map((vehicle) => {
        if (vehicle.id !== id) return vehicle;
        const requestedMileage =
          typeof updates.currentMileage === "number"
            ? updates.currentMileage
            : vehicle.currentMileage;
        const nextMileage = Math.max(vehicle.currentMileage, requestedMileage);
        return {
          ...vehicle,
          ...updates,
          currentMileage: nextMileage
        };
      })
    );
  }, []);

  const deleteVehicle = useCallback((id) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    setServiceEntries((prev) => prev.filter((entry) => entry.vehicleId !== id));
    setServiceIntervals((prev) => prev.filter((interval) => interval.vehicleId !== id));
  }, []);

  const setServiceEntriesSafely = useCallback((updater) => {
    setServiceEntries((prev) => {
      const upcoming = typeof updater === "function" ? updater(prev) : updater;
      return normalizeArray(upcoming);
    });
  }, []);

  const addServiceEntry = useCallback((entry) => {
    setServiceEntriesSafely((prev) => [
      ...prev,
      {
        ...entry,
        id: ensureUniqueId(entry)
      }
    ]);
  }, [setServiceEntriesSafely]);

  const updateServiceEntry = useCallback((id, updates) => {
    setServiceEntriesSafely((prev) =>
      prev.map((entry) => (entry.id !== id ? entry : { ...entry, ...updates }))
    );
  }, [setServiceEntriesSafely]);

  const deleteServiceEntry = useCallback((id) => {
    setServiceEntriesSafely((prev) => {
      let deleted = null;
      const next = prev.filter((entry) => {
        if (entry.id === id) {
          deleted = entry;
          return false;
        }
        return true;
      });
      if (deleted) {
        setTrashServiceEntries((trashPrev) => [
          ...trashPrev.filter((trash) => trash.id !== id),
          {
            ...deleted,
            deletedAt: deleted.deletedAt ?? new Date().toISOString()
          }
        ]);
      }
      return next;
    });
  }, [setServiceEntriesSafely]);

  const restoreServiceEntry = useCallback((id) => {
    setTrashServiceEntries((prev) => {
      const restored = prev.find((entry) => entry.id === id);
      if (restored) {
        setServiceEntries((entriesPrev) => [...entriesPrev, { ...restored }]);
      }
      return prev.filter((entry) => entry.id !== id);
    });
  }, []);

  const deleteServiceEntryForever = useCallback((id) => {
    setTrashServiceEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearTrashServiceEntries = useCallback(() => {
    setTrashServiceEntries([]);
  }, []);

  const addServiceInterval = useCallback((interval) => {
    setServiceIntervals((prev) => [
      ...prev,
      {
        ...interval,
        id: ensureUniqueId(interval)
      }
    ]);
  }, []);

  const updateServiceInterval = useCallback((id, updates) => {
    setServiceIntervals((prev) =>
      prev.map((interval) => (interval.id !== id ? interval : { ...interval, ...updates }))
    );
  }, []);

  const deleteServiceInterval = useCallback((id) => {
    setServiceIntervals((prev) => prev.filter((interval) => interval.id !== id));
  }, []);

  const exportState = useCallback(() => buildStateSnapshot(schemaVersion, vehicles, serviceEntries, serviceIntervals), [
    schemaVersion,
    vehicles,
    serviceEntries,
    serviceIntervals
  ]);

  const applyImportedData = useCallback((payload) => {
    setSchemaVersion(payload.schemaVersion ?? DEFAULT_SCHEMA_VERSION);
    setVehicles(normalizeArray(payload.vehicles));
    setServiceEntries(normalizeArray(payload.serviceEntries));
    setServiceIntervals(normalizeArray(payload.serviceIntervals));
  }, []);

  return {
    vehicles,
    serviceEntries,
    serviceIntervals,
    trashServiceEntries,
    schemaVersion,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addServiceEntry,
    updateServiceEntry,
    deleteServiceEntry,
    restoreServiceEntry,
    deleteServiceEntryForever,
    clearTrashServiceEntries,
    addServiceInterval,
    updateServiceInterval,
    deleteServiceInterval,
    exportState,
    applyImportedData
  };
};

export default useCarsServiceLogManager;
