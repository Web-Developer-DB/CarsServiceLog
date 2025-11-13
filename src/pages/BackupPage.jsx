/**
 * @file BackupPage.jsx
 * @description Route zur Datensicherung. Reicht die Handler unverändert an das
 * `DataSafetyPanel` weiter, damit sich die Seite auf das Layout konzentriert.
 */

import DataSafetyPanel from "../components/DataSafetyPanel.jsx";

/**
 * Präsentationsseite für Backups. Die JSON-Aktionen werden aus der App
 * durchgereicht, damit sich die Seite auf das UI konzentriert.
 *
 * @param {Object} props React-Props.
 * @param {() => void} props.onExport Exportiert die aktuelle Eintragsliste.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onImportFile
 *        Liest eine hochgeladene JSON-Datei.
 * @param {boolean} props.disableExport Sperrt den Download, wenn keine Einträge existieren.
 * @returns {JSX.Element} Panel mit Backup-Aktionen.
 */
const BackupPage = ({ schemaVersion, onExport, onImportFile, disableExport }) => (
  <section className="panel backup-page" aria-labelledby="backup-title">
    <header className="panel-heading">
      <h2 id="backup-title" className="panel-title">
        Backup &amp; Wiederherstellung
      </h2>
      <p className="panel-subtitle">
        Exportiere Vehicles, ServiceEntries und ServiceIntervals als JSON oder spiele eine Datei wieder ein.
      </p>
    </header>
    <p>
      Das Backup speichert die lokale Datenbank inklusive <strong>schemaVersion</strong>, Fahrzeuge,
      Serviceeinträge und Intervalle im Gutachtenformat von CarsServiceLog.
    </p>
    <p>
      Aktuelle Schema-Version: <strong>{schemaVersion}</strong>
    </p>
    <DataSafetyPanel onExport={onExport} onImportFile={onImportFile} disableExport={disableExport} />
  </section>
);

export default BackupPage;
