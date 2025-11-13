/**
 * @file ServicesPage.jsx
 * @description Serviceübersicht mit Filtern und Summen für alle Fahrzeuge.
 */

import { useMemo, useState } from "react";
import { SERVICE_TYPES } from "../constants/serviceTypes.js";

const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getYearRange = (year) => ({
  start: new Date(year, 0, 1),
  end: new Date(year, 11, 31, 23, 59, 59, 999)
});

const formatCurrency = (value) =>
  value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ServicesPage = ({ serviceEntries = [], vehicles = [], currentDate = new Date() }) => {
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });

  const vehicleMap = useMemo(() => {
    const map = new Map();
    (vehicles ?? []).forEach((vehicle) => {
      map.set(vehicle.id, vehicle);
    });
    return map;
  }, [vehicles]);

  const buildDateRange = () => {
    if (periodFilter === "current-year") {
      return getYearRange(currentDate.getFullYear());
    }
    if (periodFilter === "last-year") {
      return getYearRange(currentDate.getFullYear() - 1);
    }
    if (periodFilter === "custom" && customRange.from && customRange.to) {
      const fromDate = parseDateValue(customRange.from);
      const toDate = parseDateValue(customRange.to);
      if (fromDate && toDate && fromDate <= toDate) {
        return { start: fromDate, end: toDate };
      }
    }
    return null;
  };

  const filteredEntries = useMemo(() => {
    const range = buildDateRange();
    return (serviceEntries ?? [])
      .filter((entry) => {
        if (vehicleFilter !== "all" && entry.vehicleId !== vehicleFilter) return false;
        if (typeFilter !== "all" && entry.type !== typeFilter) return false;
        if (range) {
          const entryDate = parseDateValue(entry.date);
          if (!entryDate) return false;
          if (entryDate < range.start || entryDate > range.end) return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceEntries, vehicleFilter, typeFilter, periodFilter, customRange, currentDate]);

  const totalCost = filteredEntries.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.cost) ? entry.cost : 0),
    0
  );

  const handlePeriodChange = (value) => {
    setPeriodFilter(value);
    if (value !== "custom") {
      setCustomRange({ from: "", to: "" });
    }
  };

  return (
    <div className="services-page">
      <header className="services-page__hero">
        <p className="services-page__eyebrow">Serviceübersicht</p>
        <h1>Alle Services</h1>
        <p>Filter für Fahrzeug, Zeitraum und Serviceart inklusive einfacher Kostenübersicht.</p>
      </header>

      <section className="panel">
        <header className="panel-heading">
          <h2 className="panel-title">Filter</h2>
          <p className="panel-subtitle">Definiere den Betrachtungszeitraum und die Prüfbereiche.</p>
        </header>
        <div className="services-page__filters">
          <label>
            Fahrzeug
            <select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
              <option value="all">Alle Fahrzeuge</option>
              {(vehicles ?? []).map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Serviceart
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">Alle Servicearten</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Zeitraum
            <select
              value={periodFilter}
              onChange={(event) => handlePeriodChange(event.target.value)}
            >
              <option value="all">Gesamter Zeitraum</option>
              <option value="current-year">Aktuelles Jahr</option>
              <option value="last-year">Letztes Jahr</option>
              <option value="custom">Benutzerdefiniert</option>
            </select>
          </label>
        </div>
        {periodFilter === "custom" ? (
          <div className="services-page__custom-range">
            <label>
              Von
              <input
                name="from"
                type="date"
                value={customRange.from}
                onChange={(event) =>
                  setCustomRange((prev) => ({ ...prev, from: event.target.value }))
                }
              />
            </label>
            <label>
              Bis
              <input
                name="to"
                type="date"
                value={customRange.to}
                onChange={(event) =>
                  setCustomRange((prev) => ({ ...prev, to: event.target.value }))
                }
              />
            </label>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <header className="panel-heading">
          <h2 className="panel-title">Ergebnisse</h2>
          <p className="panel-subtitle">Anzahl, Kosten und Details der gefilterten Einträge.</p>
        </header>
        <div className="services-page__summary">
          <p>Services gesamt: {filteredEntries.length}</p>
          <p>Gesamtkosten: {formatCurrency(totalCost)} €</p>
        </div>
        {filteredEntries.length ? (
          <div className="services-page__list">
            {filteredEntries.map((entry) => (
              <article key={entry.id} className="services-page__entry">
                <p className="services-page__entry-date">{entry.date}</p>
                <p className="services-page__entry-title">
                  {entry.type} · {vehicleMap.get(entry.vehicleId)?.name ?? entry.vehicleId}
                </p>
                <p className="services-page__entry-meta">
                  {entry.mileage.toLocaleString("de-DE")} km ·{" "}
                  {entry.organisationOrWorkshop ?? "keine Werkstatt"}
                </p>
                <p className="services-page__entry-cost">
                  {entry.cost ? `${formatCurrency(entry.cost)} €` : "Kosten nicht angegeben"}
                </p>
                {entry.notes ? <p className="services-page__entry-notes">{entry.notes}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p>Keine Services für den aktuellen Filter.</p>
        )}
      </section>
    </div>
  );
};

export default ServicesPage;
