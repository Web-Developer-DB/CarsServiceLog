/**
 * @file NewVehiclePage.test.jsx
 * @description Sicherstellt, dass die Fahrzeug-Erstellung korrekt funktioniert.
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewVehiclePage from "../../src/pages/NewVehiclePage.jsx";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

describe("NewVehiclePage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  test("erstellt ein Fahrzeug und navigiert zur Akte", async () => {
    const user = userEvent.setup();
    const handleCreate = jest.fn(() => ({ id: "veh-new" }));
    render(<NewVehiclePage onCreate={handleCreate} />);

    await act(async () => {
      await user.type(screen.getByLabelText(/Fahrzeugname/i), "Test Auto");
      await user.selectOptions(screen.getByLabelText(/Kategorie/i), "Motorrad");
      await user.clear(screen.getByLabelText(/Aktueller Kilometerstand/i));
      await user.type(screen.getByLabelText(/Aktueller Kilometerstand/i), "12345");
      await user.click(screen.getByRole("button", { name: /Fahrzeug speichern/i }));
    });

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Auto",
        category: "Motorrad",
        currentMileage: 12345
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/vehicle/veh-new");
  });

  test("verwendet Standardnamen, wenn keiner eingegeben wird", async () => {
    const user = userEvent.setup();
    const handleCreate = jest.fn(() => ({ id: "veh-blank" }));
    render(<NewVehiclePage onCreate={handleCreate} />);

    await act(async () => {
      await user.clear(screen.getByLabelText(/Fahrzeugname/i));
      await user.type(screen.getByLabelText(/Aktueller Kilometerstand/i), "0");
      await user.click(screen.getByRole("button", { name: /Fahrzeug speichern/i }));
    });

    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Neues Fahrzeug",
        currentMileage: 0
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/vehicle/veh-blank");
  });
});
