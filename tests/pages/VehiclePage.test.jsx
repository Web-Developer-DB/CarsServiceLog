/**
 * @file VehiclePage.test.jsx
 * @description Verifiziert die Formularbahnen und die Darstellung einzelner Fahrzeugakte.
 */

import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VehiclePage from "../../src/pages/VehiclePage.jsx";

const vehicle = {
  id: "veh-1",
  name: "Golf 7",
  category: "Pkw",
  licensePlate: "AB-CD 1234",
  currentMileage: 98000,
  manufacturer: "Volkswagen",
  model: "Golf 7",
  year: 2016,
  vin: "WVWZZZ1KZGW000001",
  notes: "Familienauto"
};

const serviceEntry = {
  id: "srv-1",
  vehicleId: "veh-1",
  date: "2024-01-01",
  mileage: 95000,
  type: "HU/AU",
  organisationOrWorkshop: "TÜV"
};

const serviceInterval = {
  id: "int-1",
  vehicleId: "veh-1",
  name: "HU/AU",
  intervalMonths: 24,
  intervalMileage: null
};

const renderPage = (props) =>
  render(
    <VehiclePage
      vehicle={props.vehicle}
      serviceEntries={props.serviceEntries}
      serviceIntervals={props.serviceIntervals}
      onUpdateVehicle={props.onUpdateVehicle}
      onAddServiceEntry={props.onAddServiceEntry}
      onDeleteServiceEntry={props.onDeleteServiceEntry}
      onAddServiceInterval={props.onAddServiceInterval}
      onUpdateServiceInterval={props.onUpdateServiceInterval}
      onDeleteServiceInterval={props.onDeleteServiceInterval}
    />
  );

describe("VehiclePage", () => {
  test("aktualisiert den Kilometerstand", async () => {
    const user = userEvent.setup();
    const handleUpdate = jest.fn();
    renderPage({
      vehicle,
      serviceEntries: [],
      serviceIntervals: [],
      onUpdateVehicle: handleUpdate,
      onAddServiceEntry: () => {},
      onDeleteServiceEntry: () => {},
      onAddServiceInterval: () => {},
      onUpdateServiceInterval: () => {},
      onDeleteServiceInterval: () => {}
    });

    const mileageInput = screen.getByLabelText(/Aktueller Kilometerstand/i);
    await user.clear(mileageInput);
    await user.type(mileageInput, "100500");
    await user.click(screen.getByRole("button", { name: /^Speichern$/i }));

    expect(handleUpdate).toHaveBeenCalledWith({
      currentMileage: 100500,
      notes: "Familienauto"
    });
  });

  test("erstellt einen neuen Serviceeintrag über das Formular", async () => {
    const user = userEvent.setup();
    const handleAddEntry = jest.fn();
    renderPage({
      vehicle,
      serviceEntries: [],
      serviceIntervals: [],
      onUpdateVehicle: () => {},
      onAddServiceEntry: handleAddEntry,
      onDeleteServiceEntry: () => {},
      onAddServiceInterval: () => {},
      onUpdateServiceInterval: () => {},
      onDeleteServiceInterval: () => {}
    });

    await user.type(screen.getByLabelText(/Datum/i), "2024-04-01");
    await user.clear(screen.getByLabelText(/Service-Kilometerstand/i));
    await user.type(screen.getByLabelText(/Service-Kilometerstand/i), "110000");
    await user.selectOptions(screen.getByLabelText(/Serviceart/i), "HU/AU");
    await user.type(screen.getByLabelText(/Werkstatt \/ Organisation/i), "DEKRA");
    await user.type(screen.getByLabelText(/Kosten/i), "120");
    await user.type(screen.getByLabelText(/Service-Notiz/i), "Neue HU");
    await user.click(screen.getByRole("button", { name: /Service hinzufügen/i }));

    expect(handleAddEntry).toHaveBeenCalledWith({
      vehicleId: "veh-1",
      date: "2024-04-01",
      mileage: 110000,
      type: "HU/AU",
      organisationOrWorkshop: "DEKRA",
      cost: 120,
      notes: "Neue HU"
    });
  });

  test("löscht einen Serviceeintrag", async () => {
    const user = userEvent.setup();
    const handleDelete = jest.fn();
    renderPage({
      vehicle,
      serviceEntries: [serviceEntry],
      serviceIntervals: [],
      onUpdateVehicle: () => {},
      onAddServiceEntry: () => {},
      onDeleteServiceEntry: handleDelete,
      onAddServiceInterval: () => {},
      onUpdateServiceInterval: () => {},
      onDeleteServiceInterval: () => {}
    });

    await user.click(screen.getByRole("button", { name: /Lösche Service/i }));
    expect(handleDelete).toHaveBeenCalledWith("srv-1");
  });

  test("legt ein Serviceintervall an und bearbeitet es", async () => {
    const user = userEvent.setup();
    const handleAddInterval = jest.fn();
    const handleUpdateInterval = jest.fn();
    renderPage({
      vehicle,
      serviceEntries: [],
      serviceIntervals: [serviceInterval],
      onUpdateVehicle: () => {},
      onAddServiceEntry: () => {},
      onDeleteServiceEntry: () => {},
      onAddServiceInterval: handleAddInterval,
      onUpdateServiceInterval: handleUpdateInterval,
      onDeleteServiceInterval: () => {}
    });

    await user.type(screen.getByLabelText(/Name des Intervalls/i), "Ölwechsel");
    await user.type(screen.getByLabelText(/Intervall \(Monate\)/i), "12");
    await user.type(screen.getByLabelText(/Intervall \(km\)/i), "15000");
    await user.click(screen.getByRole("button", { name: /Intervall speichern/i }));

    expect(handleAddInterval).toHaveBeenCalledWith({
      vehicleId: "veh-1",
      name: "Ölwechsel",
      intervalMonths: 12,
      intervalMileage: 15000
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Bearbeiten/i }));
    });
    await user.clear(screen.getByLabelText(/^Name$/i));
    await user.type(screen.getByLabelText(/^Name$/i), "HU/AU");
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Aktualisieren/i }));
    });

    expect(handleUpdateInterval).toHaveBeenCalledWith("int-1", {
      name: "HU/AU",
      intervalMonths: 24,
      intervalMileage: undefined
    });
  });
});
