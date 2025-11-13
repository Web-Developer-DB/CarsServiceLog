/**
 * @file App.test.jsx
 * @description Verifiziert Routing und Layout der Haupt-App mit neuen Hooks.
 */

import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import App from "../src/App.jsx";

jest.mock("../src/hooks/useCarsServiceLogManager.js", () => jest.fn());
jest.mock("../src/hooks/useThemeManager.js", () => jest.fn());
jest.mock("../src/hooks/useInstallPrompt.js", () => jest.fn());

const useCarsServiceLogManager = jest.requireMock("../src/hooks/useCarsServiceLogManager.js");
const useThemeManager = jest.requireMock("../src/hooks/useThemeManager.js");
const useInstallPrompt = jest.requireMock("../src/hooks/useInstallPrompt.js");

const buildManager = () => ({
  vehicles: [
    {
      id: "veh-1",
      name: "Golf 7",
      category: "Pkw",
      licensePlate: "AB-CD 1234",
      currentMileage: 90000
    }
  ],
  serviceEntries: [
    {
      id: "srv-1",
      vehicleId: "veh-1",
      date: "2024-01-01",
      mileage: 90000,
      type: "HU/AU",
      organisationOrWorkshop: "TÜV",
      cost: 120
    }
  ],
  serviceIntervals: [
    {
      id: "int-1",
      vehicleId: "veh-1",
      name: "HU/AU",
      intervalMonths: 24,
      intervalMileage: null,
      lastServiceEntryId: "srv-1"
    }
  ],
  schemaVersion: 1,
  updateVehicle: jest.fn(),
  addServiceEntry: jest.fn(),
  deleteServiceEntry: jest.fn(),
  addServiceInterval: jest.fn(),
  updateServiceInterval: jest.fn(),
  deleteServiceInterval: jest.fn(),
  exportState: jest.fn(() => ({
    schemaVersion: 1,
    vehicles: [],
    serviceEntries: [],
    serviceIntervals: []
  })),
  applyImportedData: jest.fn()
});

beforeEach(() => {
  useCarsServiceLogManager.mockReturnValue(buildManager());
  useThemeManager.mockReturnValue({
    themeMode: "system",
    resolvedTheme: "light",
    cycleThemeMode: jest.fn()
  });
  useInstallPrompt.mockReturnValue({
    installPromptEvent: null,
    promptInstall: jest.fn()
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("App routing", () => {
  test("zeigt Dashboard mit Navigation", () => {
    const routerProps = {
      future: { v7_startTransition: true, v7_relativeSplatPath: true }
    };
    render(
      <MemoryRouter {...routerProps}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Services/i }).length).toBeGreaterThan(0);
  });

  test("zeigt Hilfeseite mit Footer", () => {
    const routerProps = {
      future: { v7_startTransition: true, v7_relativeSplatPath: true }
    };
    render(
      <MemoryRouter initialEntries={["/help"]} {...routerProps}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Hilfe & Einstieg/i })).toBeInTheDocument();
    expect(screen.getByText(/MIT License/)).toBeInTheDocument();
  });
});
