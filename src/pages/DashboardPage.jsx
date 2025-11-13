/**
 * @file DashboardPage.jsx
 * @description Überblick mit Fahrzeugen, kommenden Fälligkeiten und Ampeln.
 */

import ThemeToggle from "../components/ThemeToggle.jsx";
import { ServiceStatus } from "../utils/serviceDue.js";

const statusLabelMap = {
  [ServiceStatus.OK]: "OK",
  [ServiceStatus.DUE_SOON]: "Bald fällig",
  [ServiceStatus.OVERDUE]: "Fällig"
};

const renderDueItem = (item) => {
  const { dueData, vehicle } = item;
  const description = dueData.nextDueDate
    ? `nächster Termin: ${dueData.nextDueDate}`
    : dueData.nextDueMileage
    ? `nächster km: ${dueData.nextDueMileage.toLocaleString("de-DE")} km`
    : "Datum unbekannt";

  return (
    <li key={`${vehicle.id}-${item.dueData.interval?.name ?? "service"}`}>
      <p className="dashboard-page__due-label">
        {vehicle.name} · {dueData.interval?.name ?? "Service"}
      </p>
      <p className="dashboard-page__due-meta">{description}</p>
    </li>
  );
};

const DashboardPage = ({
  vehicleSummaries,
  dueSoon,
  overdue,
  onViewVehicle,
  onAddVehicle,
  themeMode,
  resolvedTheme,
  onToggleTheme,
  onInstallApp,
  canInstall
}) => (
  <div className="dashboard-page">
    <header className="dashboard-page__hero">
      <p className="dashboard-page__eyebrow">CarsServiceLog</p>
      <h1>Dashboard</h1>
      <p>
        Behalte deine Fahrzeuge im Blick: Kilometerstände, HU/AU-Zyklen und Services werden
        lokal im Browser gespeichert und visualisiert.
      </p>
      <div className="dashboard-page__hero-actions">
        <button type="button" className="primary" onClick={() => onAddVehicle?.()}>
          Fahrzeug anlegen
        </button>
        <ThemeToggle mode={themeMode} resolvedTheme={resolvedTheme} onToggle={onToggleTheme} />
        {canInstall ? (
          <button type="button" onClick={onInstallApp} className="ghost">
            App installieren
          </button>
        ) : null}
      </div>
    </header>

    <section className="panel">
      <header className="panel-heading">
        <h2 className="panel-title">Fahrzeuge</h2>
        <p className="panel-subtitle">
          Wähle ein Fahrzeug, um in dessen Servicehistorie einzutauchen.
        </p>
      </header>
      {vehicleSummaries.length ? (
        <ul className="dashboard-page__vehicle-list">
          {vehicleSummaries.map((summary) => (
            <li key={summary.vehicle.id} className="dashboard-page__vehicle-item">
              <button
                type="button"
                className="dashboard-page__vehicle-card"
                onClick={() => onViewVehicle(summary.vehicle.id)}
              >
                <div>
                  <p className="dashboard-page__vehicle-name">{summary.vehicle.name}</p>
                  <p className="dashboard-page__vehicle-meta">{summary.vehicle.category}</p>
                  <p className="dashboard-page__vehicle-meta">{summary.vehicle.licensePlate}</p>
                </div>
                <div className="dashboard-page__vehicle-status">
                  <span>{statusLabelMap[summary.status] ?? "OK"}</span>
                  <p>
                    {(Number.isFinite(summary.vehicle.currentMileage)
                      ? summary.vehicle.currentMileage.toLocaleString("de-DE")
                      : "0"
                    ).trim()}{" "}
                    km
                  </p>
                  {summary.nextDue ? (
                    <p className="dashboard-page__vehicle-next">
                      {summary.nextDue.interval?.name ?? "Service"} ·{" "}
                      {summary.nextDue.nextDueDate ?? `${summary.nextDue.nextDueMileage ?? "–"} km`}
                    </p>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Keine Fahrzeuge vorhanden.</p>
      )}
    </section>

    <section className="panel">
      <header className="panel-heading">
        <h2 className="panel-title">Demnächst fällig</h2>
      </header>
      {dueSoon.length ? <ul>{dueSoon.map(renderDueItem)}</ul> : <p>Keine fälligen Services.</p>}
    </section>

    <section className="panel">
      <header className="panel-heading">
        <h2 className="panel-title">Überfällig</h2>
      </header>
      {overdue.length ? <ul>{overdue.map(renderDueItem)}</ul> : <p>Alles im grünen Bereich.</p>}
    </section>
  </div>
);

export default DashboardPage;
