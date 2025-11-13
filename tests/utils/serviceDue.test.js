/**
 * @file serviceDue.test.js
 * @description Tests für die Fälligkeitsberechnungen von Serviceintervallen.
 */

import { ServiceStatus, collectIntervalDueItems, getIntervalDueData } from "../../src/utils/serviceDue.js";

const sharedEntries = [
  {
    id: "srv-hu-2022",
    vehicleId: "veh-1",
    date: "2022-02-01",
    mileage: 15000,
    type: "HU/AU"
  },
  {
    id: "srv-inspection-2023",
    vehicleId: "veh-1",
    date: "2023-02-05",
    mileage: 22000,
    type: "Inspektion"
  }
];

const baseVehicle = {
  id: "veh-1",
  currentMileage: 24000,
  year: 2020
};

describe("Service Due Helpers", () => {
  test("berechnet nächstes Datum und bleibt im OK-Zustand bei weitem Abstand", () => {
    const interval = {
      id: "int-hu",
      vehicleId: "veh-1",
      name: "HU/AU",
      intervalMonths: 24,
      intervalMileage: null,
      lastServiceEntryId: "srv-hu-2022"
    };
    const result = getIntervalDueData({
      interval,
      vehicle: baseVehicle,
      serviceEntries: sharedEntries,
      now: new Date("2023-01-01T00:00:00.000Z")
    });

    expect(result.nextDueDate).toBe("2024-02-01");
    expect(result.status).toBe(ServiceStatus.OK);
  });

  test("markiert bald fällige Services, wenn das Datum innerhalb von 60 Tagen liegt", () => {
    const interval = {
      id: "int-hu",
      vehicleId: "veh-1",
      name: "HU/AU",
      intervalMonths: 24,
      intervalMileage: null,
      lastServiceEntryId: "srv-hu-2022"
    };
    const result = getIntervalDueData({
      interval,
      vehicle: baseVehicle,
      serviceEntries: sharedEntries,
      now: new Date("2023-12-15T00:00:00.000Z")
    });

    expect(result.status).toBe(ServiceStatus.DUE_SOON);
  });

  test("endet im OVERDUE, wenn der Kilometerstand bereits überschritten ist", () => {
    const interval = {
      id: "int-oil",
      vehicleId: "veh-1",
      name: "Ölwechsel",
      intervalMonths: 12,
      intervalMileage: 8000,
      lastServiceEntryId: "srv-inspection-2023"
    };
    const result = getIntervalDueData({
      interval,
      vehicle: { ...baseVehicle, currentMileage: 36000 },
      serviceEntries: sharedEntries,
      now: new Date("2024-02-15T00:00:00.000Z")
    });

    expect(result.nextDueMileage).toBe(30000);
    expect(result.status).toBe(ServiceStatus.OVERDUE);
  });

  test("verwendet den neuesten Eintrag, wenn lastServiceEntryId fehlt", () => {
    const interval = {
      id: "int-inspection",
      vehicleId: "veh-1",
      name: "Inspektion",
      intervalMonths: 12,
      intervalMileage: 15000
    };
    const result = getIntervalDueData({
      interval,
      vehicle: baseVehicle,
      serviceEntries: sharedEntries,
      now: new Date("2023-03-01T00:00:00.000Z")
    });

    expect(result.lastServiceEntry.id).toBe("srv-inspection-2023");
    expect(result.nextDueDate).toBe("2024-02-05");
  });

  test("sammlt nur Intervalle mit vorhandenem Fahrzeug und rechnet Status", () => {
    const intervals = [
      {
        id: "int-hu",
        vehicleId: "veh-1",
        name: "HU/AU",
        intervalMonths: 24,
        intervalMileage: null,
        lastServiceEntryId: "srv-hu-2022"
      },
      {
        id: "int-missing",
        vehicleId: "non-existent",
        name: "Reifen",
        intervalMonths: 6,
        intervalMileage: 5000
      }
    ];
    const items = collectIntervalDueItems({
      intervals,
      serviceEntries: sharedEntries,
      vehicles: [baseVehicle],
      now: new Date("2023-01-01T00:00:00.000Z")
    });

    expect(items).toHaveLength(1);
    expect(items[0].dueData.status).toBe(ServiceStatus.OK);
    expect(items[0].dueData.nextDueDate).toBe("2024-02-01");
  });
});
