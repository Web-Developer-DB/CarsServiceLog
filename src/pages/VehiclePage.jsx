/**
 * @file VehiclePage.jsx
 * @description Detailseite für ein einzelnes Fahrzeug mit Stammdaten, Historie und Intervallen.
 */

import { useMemo, useState } from "react";
import { SERVICE_TYPES } from "../constants/serviceTypes.js";

const parseNumberInput = (value) =>
  value && value.trim().length ? Number(value) : undefined;

const ServiceEntryRow = ({ entry, onDelete }) => (
  <article className="vehicle-page__entry">
    <div>
      <p className="vehicle-page__entry-date">{entry.date}</p>
      <p className="vehicle-page__entry-type">{entry.type}</p>
    </div>
    <div className="vehicle-page__entry-meta">
      <span>{entry.mileage.toLocaleString("de-DE")} km</span>
      {entry.organisationOrWorkshop ? <span>{entry.organisationOrWorkshop}</span> : null}
    </div>
    <div className="vehicle-page__entry-actions">
      <button type="button" onClick={() => onDelete(entry.id)} aria-label={`Lösche Service ${entry.type}`}>
        Entfernen
      </button>
    </div>
  </article>
);

const intervalLabel = (interval) => {
  if (!interval) return "";
  const parts = [];
  if (Number.isFinite(interval.intervalMonths)) {
    parts.push(`${interval.intervalMonths} Monate`);
  }
  if (Number.isFinite(interval.intervalMileage)) {
    parts.push(`${interval.intervalMileage.toLocaleString("de-DE")} km`);
  }
  return parts.join(" · ") || "Keine Angaben";
};

const VehiclePage = ({
  vehicle,
  serviceEntries,
  serviceIntervals,
  onUpdateVehicle,
  onAddServiceEntry,
  onDeleteServiceEntry,
  onAddServiceInterval,
  onUpdateServiceInterval,
  onDeleteServiceInterval
}) => {
  const [editingInterval, setEditingInterval] = useState(null);

  const sortedEntries = useMemo(
    () =>
      (serviceEntries ?? [])
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [serviceEntries]
  );

  const handleMileageSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    if (typeof onUpdateVehicle !== "function") return;
    onUpdateVehicle({
      currentMileage: parseNumberInput(form.elements.mileage.value) ?? vehicle.currentMileage,
      notes: form.elements.notes.value
    });
  };

  const handleAddEntry = (event) => {
    event.preventDefault();
    if (typeof onAddServiceEntry !== "function") return;
    const form = event.target;
    onAddServiceEntry({
      vehicleId: vehicle.id,
      date: form.elements.date.value,
      mileage: parseNumberInput(form.elements.mileage.value) ?? vehicle.currentMileage,
      type: form.elements.type.value,
      organisationOrWorkshop: form.elements.organisation.value,
      cost: parseNumberInput(form.elements.cost.value),
      notes: form.elements.notes.value
    });
    form.reset();
  };

  const handleAddInterval = (event) => {
    event.preventDefault();
    if (typeof onAddServiceInterval !== "function") return;
    const form = event.target;
    onAddServiceInterval({
      vehicleId: vehicle.id,
      name: form.elements.name.value,
      intervalMonths: parseNumberInput(form.elements.intervalMonths.value),
      intervalMileage: parseNumberInput(form.elements.intervalMileage.value)
    });
    form.reset();
  };

  const handleEditInterval = (event) => {
    event.preventDefault();
    if (!editingInterval || typeof onUpdateServiceInterval !== "function") return;
    const form = event.target;
    onUpdateServiceInterval(editingInterval.id, {
      name: form.elements.name.value,
      intervalMonths: parseNumberInput(form.elements.intervalMonths.value),
      intervalMileage: parseNumberInput(form.elements.intervalMileage.value)
    });
    setEditingInterval(null);
  };

  return (
    <div className="vehicle-page">
      <header className="vehicle-page__hero">
        <p className="vehicle-page__eyebrow">Fahrzeugakte</p>
        <h1>{vehicle?.name ?? "Fahrzeug"}</h1>
        <p>
          Kategorie: {vehicle?.category ?? "nicht angegeben"} · {vehicle?.licensePlate ?? "Kein Kennzeichen"}
        </p>
      </header>

      <section className="panel">
        <header className="panel-heading">
          <h2 className="panel-title">Stammdaten</h2>
          <p className="panel-subtitle">Aktualisiere Nutzen-relevante Infos wie Kilometerstand oder Notizen.</p>
        </header>
        <div className="vehicle-page__details">
          <p>Hersteller: {vehicle?.manufacturer ?? "–"}</p>
          <p>Modell: {vehicle?.model ?? "–"}</p>
          <p>Baujahr: {vehicle?.year ?? "–"}</p>
          <p>FIN: {vehicle?.vin ?? "–"}</p>
          <p>Saisonal: {vehicle?.seasonFromMonth ?? "–"} – {vehicle?.seasonToMonth ?? "–"}</p>
        </div>
        <form className="vehicle-page__form" onSubmit={handleMileageSubmit}>
          <label>
            Aktueller Kilometerstand
            <input
              name="mileage"
              type="number"
              min="0"
              defaultValue={vehicle?.currentMileage ?? 0}
              required
            />
          </label>
          <label>
            Notizen
            <textarea name="notes" defaultValue={vehicle?.notes ?? ""} />
          </label>
          <button type="submit">Speichern</button>
        </form>
      </section>

      <section className="panel">
        <header className="panel-heading">
          <h2 className="panel-title">Servicehistorie</h2>
          <p className="panel-subtitle">Dokumentiere Werkstattbesuche, HU/AU oder Reparaturen.</p>
        </header>
        {sortedEntries.length ? (
          <div className="vehicle-page__entries">
            {sortedEntries.map((entry) => (
              <ServiceEntryRow key={entry.id} entry={entry} onDelete={onDeleteServiceEntry} />
            ))}
          </div>
        ) : (
          <p>Noch keine Services verzeichnet.</p>
        )}
        <form className="vehicle-page__form" onSubmit={handleAddEntry}>
          <label>
            Datum
            <input name="date" type="date" required />
          </label>
          <label>
            Service-Kilometerstand
            <input
              name="mileage"
              type="number"
              min="0"
              defaultValue={vehicle?.currentMileage ?? 0}
              required
            />
          </label>
          <label>
            Serviceart
            <select name="type" defaultValue={SERVICE_TYPES[0]}>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Werkstatt / Organisation
            <input name="organisation" type="text" />
          </label>
          <label>
            Kosten (€)
            <input name="cost" type="number" min="0" step="0.5" />
          </label>
          <label>
            Service-Notiz
            <textarea name="notes" />
          </label>
          <button type="submit">Service hinzufügen</button>
        </form>
      </section>

      <section className="panel">
        <header className="panel-heading">
          <h2 className="panel-title">Serviceintervalle</h2>
          <p className="panel-subtitle">Wartezyklen definieren und mit Statusampel versehen.</p>
        </header>
        {serviceIntervals.length ? (
          <ul className="vehicle-page__intervals">
            {serviceIntervals.map((interval) => (
              <li key={interval.id}>
                <p className="vehicle-page__interval-name">{interval.name}</p>
                <p className="vehicle-page__interval-meta">{intervalLabel(interval)}</p>
                <div className="vehicle-page__interval-actions">
                  <button type="button" onClick={() => setEditingInterval(interval)}>
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteServiceInterval?.(interval.id)}
                    aria-label={`Entferne Intervall ${interval.name}`}
                  >
                    Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Keine Intervalle vorhanden.</p>
        )}
        <form className="vehicle-page__form" onSubmit={handleAddInterval}>
          <label>
            Name des Intervalls
            <input name="name" type="text" required />
          </label>
          <label>
            Intervall (Monate)
            <input name="intervalMonths" type="number" min="0" />
          </label>
          <label>
            Intervall (km)
            <input name="intervalMileage" type="number" min="0" />
          </label>
          <button type="submit">Intervall speichern</button>
        </form>

        {editingInterval ? (
          <form className="vehicle-page__form" onSubmit={handleEditInterval}>
            <h3>Intervall bearbeiten ({editingInterval.name})</h3>
            <label>
              Name
              <input name="name" defaultValue={editingInterval.name} required />
            </label>
            <label>
              Monate
              <input
                name="intervalMonths"
                type="number"
                min="0"
                defaultValue={editingInterval.intervalMonths ?? ""}
              />
            </label>
            <label>
              Kilometer
              <input
                name="intervalMileage"
                type="number"
                min="0"
                defaultValue={editingInterval.intervalMileage ?? ""}
              />
            </label>
            <div>
              <button type="submit">Aktualisieren</button>
              <button type="button" onClick={() => setEditingInterval(null)}>
                Abbrechen
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
};

export default VehiclePage;
