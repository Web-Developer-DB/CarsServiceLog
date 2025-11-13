/**
 * @file ServicesPage.test.jsx
 * @description Stellt sicher, dass Filter, Listung und Summen funktionieren.
 */

import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServicesPage from "../../src/pages/ServicesPage.jsx";

const vehicles = [
  { id: "veh-1", name: "Golf 7" },
  { id: "veh-2", name: "Yamaha MT-07" }
];

const serviceEntries = [
  {
    id: "srv-1",
    vehicleId: "veh-1",
    date: "2024-03-01",
    mileage: 95000,
    type: "HU/AU",
    organisationOrWorkshop: "TÜV",
    cost: 150,
    notes: "HU bestanden"
  },
  {
    id: "srv-2",
    vehicleId: "veh-2",
    date: "2023-05-05",
    mileage: 12000,
    type: "Ölwechsel",
    organisationOrWorkshop: "Motorradwerkstatt",
    cost: 200
  },
  {
    id: "srv-3",
    vehicleId: "veh-1",
    date: "2023-10-10",
    mileage: 90000,
    type: "Reifenwechsel",
    organisationOrWorkshop: "Reifen Müller",
    cost: 120
  }
];

describe("ServicesPage", () => {
  test("filtert nach Fahrzeug und zeigt korrekte Anzahl", async () => {
    const user = userEvent.setup();
    render(
      <ServicesPage serviceEntries={serviceEntries} vehicles={vehicles} currentDate={new Date("2024-04-01")} />
    );

    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Fahrzeug/i), "veh-1");
    });

    expect(screen.getByText(/Services gesamt: 2/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Yamaha MT-07/i, { selector: ".services-page__entry-title" })
    ).not.toBeInTheDocument();
  });

  test("filtert im benutzerdefinierten Zeitraum", async () => {
    const user = userEvent.setup();
    render(
      <ServicesPage serviceEntries={serviceEntries} vehicles={vehicles} currentDate={new Date("2024-04-01")} />
    );

    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Zeitraum/i), "custom");
      await user.type(screen.getByLabelText(/^Von$/i), "2024-02-01");
      await user.type(screen.getByLabelText(/^Bis$/i), "2024-03-31");
    });

    expect(screen.getByText(/Services gesamt: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Gesamtkosten: 150,00 €/i)).toBeInTheDocument();
  });
});
