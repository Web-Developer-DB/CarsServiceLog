/**
 * @file DashboardPage.test.jsx
 * @description Prüft die Visualisierung der Fahrzeugstatus-Übersicht.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../../src/pages/DashboardPage.jsx";
import { ServiceStatus } from "../../src/utils/serviceDue.js";

const baseVehicle = {
  id: "veh-1",
  name: "Golf 7",
  category: "Pkw",
  licensePlate: "AB-CD 1234",
  currentMileage: 98000
};

const dueSoonItem = {
  vehicle: baseVehicle,
  dueData: {
    interval: { name: "HU/AU" },
    nextDueDate: "2025-02-01",
    status: ServiceStatus.DUE_SOON
  }
};

const overdueItem = {
  vehicle: baseVehicle,
  dueData: {
    interval: { name: "Ölwechsel" },
    nextDueMileage: 99500,
    status: ServiceStatus.OVERDUE
  }
};

const renderDashboard = (props) =>
  render(
    <DashboardPage
      vehicleSummaries={props.vehicleSummaries}
      dueSoon={props.dueSoon}
      overdue={props.overdue}
      onViewVehicle={props.onViewVehicle}
      themeMode={props.themeMode ?? "system"}
      resolvedTheme={props.resolvedTheme ?? "light"}
      onToggleTheme={props.onToggleTheme ?? (() => {})}
      onInstallApp={props.onInstallApp ?? (() => {})}
      canInstall={props.canInstall ?? false}
      onAddVehicle={props.onAddVehicle ?? (() => {})}
    />
  );

describe("DashboardPage", () => {
  test("zeigt Fahrzeugliste und Statussektionen", async () => {
    const handleView = jest.fn();
    renderDashboard({
      vehicleSummaries: [
        {
          vehicle: baseVehicle,
          nextDue: dueSoonItem.dueData,
          status: ServiceStatus.DUE_SOON
        }
      ],
      dueSoon: [dueSoonItem],
      overdue: [overdueItem],
      onViewVehicle: handleView
    });

    expect(screen.getByRole("heading", { name: /Fahrzeuge/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Golf 7/ })[0]).toBeInTheDocument();
    expect(screen.getByText(/Demnächst fällig/i)).toBeInTheDocument();
    expect(screen.getByText(/Überfällig/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Golf 7/ }));
    expect(handleView).toHaveBeenCalledWith("veh-1");
  });

  test("zeigt Platzhalter, wenn keine fälligen Services vorhanden sind", () => {
    renderDashboard({
      vehicleSummaries: [],
      dueSoon: [],
      overdue: [],
      onViewVehicle: () => {}
    });

    expect(screen.getByText(/Keine fälligen Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Alles im grünen Bereich/i)).toBeInTheDocument();
  });

  test("zeigt Installationsbutton und reagiert auf Klick", async () => {
    const user = userEvent.setup();
    const handleInstall = jest.fn();
    renderDashboard({
      vehicleSummaries: [],
      dueSoon: [],
      overdue: [],
      onViewVehicle: () => {},
      canInstall: true,
      onInstallApp: handleInstall
    });

    const installButton = screen.getByRole("button", { name: /App installieren/i });
    expect(installButton).toBeInTheDocument();
    await user.click(installButton);
    expect(handleInstall).toHaveBeenCalled();
  });

  test("öffnet das Fahrzeug-anlegen-Formular", async () => {
    const user = userEvent.setup();
    const handleAddVehicle = jest.fn();
    renderDashboard({
      vehicleSummaries: [],
      dueSoon: [],
      overdue: [],
      onViewVehicle: () => {},
      onAddVehicle: handleAddVehicle
    });

    const addButton = screen.getByRole("button", { name: /Fahrzeug anlegen/i });
    await user.click(addButton);
    expect(handleAddVehicle).toHaveBeenCalled();
  });
});
