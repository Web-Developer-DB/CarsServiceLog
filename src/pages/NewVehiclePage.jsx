/**
 * @file NewVehiclePage.jsx
 * @description Formular für das Anlegen einer neuen Fahrzeugakte.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VEHICLE_CATEGORIES } from "../constants/vehicleCategories.js";

const numberOrUndefined = (value) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const NewVehiclePage = ({ onCreate }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: "",
    category: VEHICLE_CATEGORIES[0],
    manufacturer: "",
    model: "",
    year: "",
    licensePlate: "",
    vin: "",
    currentMileage: "",
    notes: ""
  });

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const payload = {
        name: formState.name.trim() || "Neues Fahrzeug",
        category: formState.category,
        manufacturer: formState.manufacturer.trim() || undefined,
        model: formState.model.trim() || undefined,
        year: numberOrUndefined(formState.year),
        licensePlate: formState.licensePlate.trim() || undefined,
        vin: formState.vin.trim() || undefined,
        currentMileage: numberOrUndefined(formState.currentMileage) ?? 0,
        notes: formState.notes.trim() || undefined
      };
      const created = onCreate?.(payload);
      if (created?.id) {
        navigate(`/vehicle/${created.id}`);
      }
    },
    [formState, navigate, onCreate]
  );

  return (
    <div className="panel new-vehicle-page">
      <header className="panel-heading">
        <h2 className="panel-title">Neues Fahrzeug anlegen</h2>
        <p className="panel-subtitle">
          Erstelle eine Fahrzeugakte mit Stammdaten und aktuellem Kilometerstand.
        </p>
      </header>
      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-name">
            Fahrzeugname
          </label>
          <input
            id="vehicle-name"
            className="vehicle-form__input"
            name="name"
            type="text"
            value={formState.name}
            onChange={handleChange}
            placeholder="z. B. Golf 7"
          />
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-category">
            Kategorie
          </label>
          <select
            id="vehicle-category"
            className="vehicle-form__input"
            name="category"
            value={formState.category}
            onChange={handleChange}
            required
          >
            {VEHICLE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-manufacturer">
            Hersteller
          </label>
          <input
            id="vehicle-manufacturer"
            className="vehicle-form__input"
            name="manufacturer"
            type="text"
            value={formState.manufacturer}
            onChange={handleChange}
            placeholder="z. B. Volkswagen"
          />
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-model">
            Modell
          </label>
          <input
            id="vehicle-model"
            className="vehicle-form__input"
            name="model"
            type="text"
            value={formState.model}
            onChange={handleChange}
          />
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-year">
            Baujahr
          </label>
          <input
            id="vehicle-year"
            className="vehicle-form__input"
            name="year"
            type="number"
            min="1900"
            max="2100"
            value={formState.year}
            onChange={handleChange}
          />
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-plate">
            Kennzeichen
          </label>
          <input
            id="vehicle-plate"
            className="vehicle-form__input"
            name="licensePlate"
            type="text"
            placeholder="AB-CD 1234"
            value={formState.licensePlate}
            onChange={handleChange}
          />
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-vin">
            VIN (optional)
          </label>
          <input
            id="vehicle-vin"
            className="vehicle-form__input"
            name="vin"
            type="text"
            value={formState.vin}
            onChange={handleChange}
          />
        </div>
        <div className="vehicle-form__field">
          <label className="vehicle-form__label" htmlFor="vehicle-mileage">
            Aktueller Kilometerstand
          </label>
          <input
            id="vehicle-mileage"
            className="vehicle-form__input"
            name="currentMileage"
            type="number"
            min="0"
            value={formState.currentMileage}
            onChange={handleChange}
            required
          />
        </div>
        <div className="vehicle-form__field vehicle-form__field--full">
          <label className="vehicle-form__label" htmlFor="vehicle-notes">
            Notizen
          </label>
          <textarea
            id="vehicle-notes"
            className="vehicle-form__input"
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            placeholder="Besonderheiten, Saisonzeiten, Werkstatt-Infos..."
          />
        </div>
        <div className="vehicle-form__actions">
          <button type="submit" className="vehicle-form__submit">
            Fahrzeug speichern
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVehiclePage;
