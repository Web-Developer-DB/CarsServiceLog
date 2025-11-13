/**
 * @file useCarsServiceLogManager.test.js
 * @description TDD-Tests für den neuen CarsServiceLog-Store.
 */

import React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import useCarsServiceLogManager from "../../src/hooks/useCarsServiceLogManager.js";
import {
  DEFAULT_SCHEMA_VERSION,
  STORAGE_KEY,
  TRASH_SERVICE_STORAGE_KEY
} from "../../src/utils/carsServiceLogStorage.js";

const createVehicle = (overrides = {}) => ({
  id: overrides.id ?? "veh-test",
  name: overrides.name ?? "Testfahrzeug",
  category: overrides.category ?? "Pkw",
  currentMileage: overrides.currentMileage ?? 12000,
  manufacturer: overrides.manufacturer ?? "Testwerk",
  ...overrides
});

const createServiceEntry = (overrides = {}) => ({
  id: overrides.id ?? "srv-test",
  vehicleId: overrides.vehicleId ?? "veh-test",
  date: overrides.date ?? "2024-01-15",
  mileage: overrides.mileage ?? 12000,
  type: overrides.type ?? "Inspektion",
  organisationOrWorkshop: overrides.organisationOrWorkshop ?? "Werkstatt",
  cost: overrides.cost ?? 0,
  notes: overrides.notes ?? "Service durchgeführt",
  ...overrides
});

const createServiceInterval = (overrides = {}) => ({
  id: overrides.id ?? "int-test",
  vehicleId: overrides.vehicleId ?? "veh-test",
  name: overrides.name ?? "HU/AU",
  intervalMonths: overrides.intervalMonths ?? 24,
  intervalMileage: overrides.intervalMileage ?? null,
  lastServiceEntryId: overrides.lastServiceEntryId ?? null,
  ...overrides
});

describe("useCarsServiceLogManager", () => {
  let manager;

  const Harness = () => {
    manager = useCarsServiceLogManager();
    return null;
  };

  const renderManager = () => render(<Harness />);

  const getPersistedState = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  };

  const getTrashState = () => {
    const stored = localStorage.getItem(TRASH_SERVICE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    manager = null;
  });

  test("initialisiert einen leeren Zustand", () => {
    renderManager();
    expect(manager.vehicles).toEqual([]);
    expect(manager.serviceEntries).toEqual([]);
    expect(manager.serviceIntervals).toEqual([]);
    expect(manager.trashServiceEntries).toEqual([]);
    expect(manager.schemaVersion).toBe(DEFAULT_SCHEMA_VERSION);
  });

  test("lädt persistierte Daten", () => {
    const persisted = {
      schemaVersion: 3,
      vehicles: [createVehicle({ id: "veh-from-storage" })],
      serviceEntries: [createServiceEntry({ id: "srv-from-storage", vehicleId: "veh-from-storage" })],
      serviceIntervals: [createServiceInterval({ id: "int-from-storage", vehicleId: "veh-from-storage" })]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

    renderManager();

    expect(manager.schemaVersion).toBe(3);
    expect(manager.vehicles).toHaveLength(1);
    expect(manager.serviceEntries).toHaveLength(1);
    expect(manager.serviceIntervals).toHaveLength(1);
  });

  test("exportiert aktuellen Zustand", () => {
    renderManager();
    act(() => {
      manager.addVehicle(createVehicle({ id: "veh-export" }));
    });
    const snapshot = manager.exportState();
    expect(snapshot.schemaVersion).toBe(DEFAULT_SCHEMA_VERSION);
    expect(snapshot.vehicles[0].id).toBe("veh-export");
  });

  test("applyImportedData überschreibt Zustand und persistiert", () => {
    renderManager();
    const importedPayload = {
      schemaVersion: 5,
      vehicles: [createVehicle({ id: "veh-imported" })],
      serviceEntries: [createServiceEntry({ id: "srv-imported", vehicleId: "veh-imported" })],
      serviceIntervals: [createServiceInterval({ id: "int-imported", vehicleId: "veh-imported" })]
    };

    act(() => {
      manager.applyImportedData(importedPayload);
    });

    expect(manager.schemaVersion).toBe(5);
    expect(manager.vehicles).toHaveLength(1);
    expect(getPersistedState()).toMatchObject({ schemaVersion: 5 });
  });

  test("fügt Fahrzeuge hinzu und respektiert Maskierung der Laufleistung", () => {
    renderManager();

    act(() => {
      manager.addVehicle(createVehicle({ id: "veh-cruise", currentMileage: 5000 }));
    });
    expect(manager.vehicles).toHaveLength(1);

    act(() => {
      manager.updateVehicle("veh-cruise", { currentMileage: 4500, name: "cruise" });
    });

    expect(manager.vehicles[0].currentMileage).toBe(5000);
    expect(manager.vehicles[0].name).toBe("cruise");
  });

  test("löscht Fahrzeuge inklusive verknüpfter Einträge und Intervalle", () => {
    renderManager();
    act(() => {
      manager.addVehicle(createVehicle({ id: "veh-delete", currentMileage: 1000 }));
      manager.addServiceEntry(createServiceEntry({ id: "srv-delete", vehicleId: "veh-delete" }));
      manager.addServiceInterval(createServiceInterval({ id: "int-delete", vehicleId: "veh-delete" }));
    });

    act(() => {
      manager.deleteVehicle("veh-delete");
    });

    expect(manager.vehicles).toHaveLength(0);
    expect(manager.serviceEntries).toHaveLength(0);
    expect(manager.serviceIntervals).toHaveLength(0);
  });

  test("Service-Einträge können in den Papierkorb wandern und wiederhergestellt werden", async () => {
    renderManager();
    act(() => {
      manager.addServiceEntry(createServiceEntry({ id: "srv-trash" }));
    });

    act(() => {
      manager.deleteServiceEntry("srv-trash");
    });

    expect(manager.serviceEntries).toHaveLength(0);
    expect(manager.trashServiceEntries).toHaveLength(1);
    expect(getTrashState()).toHaveLength(1);

    act(() => {
      manager.restoreServiceEntry("srv-trash");
    });
    await waitFor(() => expect(manager.trashServiceEntries).toHaveLength(0));
    expect(manager.serviceEntries).toHaveLength(1);

    act(() => {
      manager.deleteServiceEntry("srv-trash");
    });
    await waitFor(() => expect(manager.trashServiceEntries).toHaveLength(1));

    act(() => {
      manager.deleteServiceEntryForever("srv-trash");
    });
    await waitFor(() => expect(manager.trashServiceEntries).toHaveLength(0));
  });

  test("Service-Intervalle haben den kompletten Lebenszyklus", () => {
    renderManager();

    act(() => {
      manager.addServiceInterval(createServiceInterval({ id: "int-life" }));
    });

    act(() => {
      manager.updateServiceInterval("int-life", { name: "HU/AU 24 Monate", intervalMileage: 20000 });
    });

    expect(manager.serviceIntervals[0].intervalMileage).toBe(20000);

    act(() => {
      manager.deleteServiceInterval("int-life");
    });

    expect(manager.serviceIntervals).toHaveLength(0);
  });

  test("Papierkorb kann geleert werden", () => {
    renderManager();
    act(() => {
      manager.addServiceEntry(createServiceEntry({ id: "srv-trash2" }));
      manager.deleteServiceEntry("srv-trash2");
    });

    act(() => {
      manager.clearTrashServiceEntries();
    });

    expect(manager.trashServiceEntries).toEqual([]);
    expect(getTrashState()).toEqual([]);
  });
});
