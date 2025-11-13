import { useCallback } from "react";

/**
 * @file HelpPage.jsx
 * @description Leitfaden für CarsServiceLog mit Schnellnavigation zu den Kernbereichen.
 */
const HelpPage = () => {
  const tocItems = [
    { id: "overview", label: "Schnellüberblick" },
    { id: "vehicles", label: "Fahrzeuge & Stammdaten" },
    { id: "history", label: "Servicehistorie" },
    { id: "services", label: "Serviceübersicht" },
    { id: "backup", label: "Backup & Wiederherstellung" },
    { id: "faq", label: "FAQs" }
  ];

  const handleInlineNavigation = useCallback((sectionId) => {
    if (typeof document === "undefined") {
      return;
    }
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });

    const focusTarget =
      section.querySelector("h3, h2, h1, [tabindex]") ?? section;
    if (focusTarget && typeof focusTarget.setAttribute === "function") {
      focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
      focusTarget.addEventListener(
        "blur",
        () => focusTarget.removeAttribute("tabindex"),
        { once: true }
      );
    }
  }, []);

  return (
    <section className="panel help-panel" aria-labelledby="help-title">
      <header className="panel-heading">
        <h2 id="help-title" className="panel-title">
          Hilfe &amp; Einstieg
        </h2>
        <p className="panel-subtitle">
          So nutzt du CarsServiceLog: von Fahrzeugen über Services bis zu Sicherungen.
        </p>
      </header>

      <nav aria-label="Schnellnavigation" className="help-content__toc">
        <h3 className="help-content__toc-title">Springe zu</h3>
        <ul>
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="help-content__toc-button"
                onClick={() => handleInlineNavigation(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="help-content">
        <section id="overview" aria-labelledby="overview-heading">
          <h3 id="overview-heading">Schnellüberblick</h3>
          <p>
            Auf dem Dashboard findest du eine Übersicht aller Fahrzeuge, eine Statusampel für
            fällige Services sowie die Bereiche <strong>Demnächst fällig</strong> und{" "}
            <strong>Überfällig</strong>. Die Seitennavigation nutzt du, um schnell zwischen
            Dashboard, Serviceübersicht, Backup und Hilfe zu wechseln.
          </p>
        </section>

        <section id="vehicles" aria-labelledby="vehicles-heading">
          <h3 id="vehicles-heading">Fahrzeuge &amp; Stammdaten</h3>
          <p>
            Jedes Fahrzeug besitzt einen eigenen Datensatz mit Stammdaten, Notizen und Kilometerstand.
            Du aktualisierst den Kilometerstand direkt im Formular; der Wert wird nur gesetzt, wenn er höher
            als der vorherige Stand ist.
          </p>
          <ul>
            <li>
              <strong>Stammdaten:</strong> Name, Kategorie, Kennzeichen, VIN und Saisonzeiten sind jederzeit bearbeitbar.
            </li>
            <li>
              <strong>Notizen:</strong> Nutze das Textfeld für Fahrzeug-Kommentare, z. B. Reifenwechsel oder Besitzer.
            </li>
            <li>
              <strong>Navigation:</strong> Über den Button in der Fahrzeugliste gelangst du direkt in die jeweilige Akte.
            </li>
          </ul>
        </section>

        <section id="history" aria-labelledby="history-heading">
          <h3 id="history-heading">Servicehistorie</h3>
          <p>
            Die Historie zeigt alle Einträge eines Fahrzeugs in chronologischer Reihenfolge. Du kannst neue Services hinzufügen,
            bestehende löschen und auf Beliebiges filtern.
          </p>
          <ul>
            <li>
              <strong>Addieren:</strong> Sammle HU/AU, Inspektionen, Ölwechsel oder Reparaturen in einem Formular.
            </li>
            <li>
              <strong>Details:</strong> Datum, Kilometerstand, Werkstatt, Kosten und Notizen helfen beim Nachverfolgen.
            </li>
            <li>
              <strong>Löschen:</strong> Einträge werden sofort entfernt (ohne Papierkorb, da Services für die Historie dauerhaft sind).
            </li>
          </ul>
        </section>

        <section id="services" aria-labelledby="services-heading">
          <h3 id="services-heading">Serviceübersicht</h3>
          <p>
            Sämtliche Serviceeinträge aller Fahrzeuge erscheinen hier als Liste. Filter nach Fahrzeug,
            Serviceart oder Zeitraum – einschließlich eines benutzerdefinierten Datumsbereichs.
          </p>
          <ul>
            <li>
              <strong>Zeitraumfilter:</strong> Wähle aktuelles oder letztes Jahr oder definiere eigene Grenzen.
            </li>
            <li>
              <strong>Kostenbilanz:</strong> Die Seite zeigt Summe und Anzahl der angezeigten Services.
            </li>
          </ul>
        </section>

        <section id="backup" aria-labelledby="backup-heading">
          <h3 id="backup-heading">Backup &amp; Wiederherstellung</h3>
          <p>
            Exportiere deine lokale Datenbank (Fahrzeuge, Services, Intervalle) als JSON-Datei.
            Beim Import wird das Schema überprüft und überschreibt oder verlängert den aktuellen Zustand.
          </p>
          <ul>
            <li>
              <strong>Export:</strong> Lade das JSON-Backup herunter; es enthält `schemaVersion`, `vehicles`, `serviceEntries` und `serviceIntervals`.
            </li>
            <li>
              <strong>Import:</strong> Wähle eine JSON-Datei – der bestehende Zustand wird ersetzt, wenn das Format stimmt.
            </li>
          </ul>
        </section>

        <section id="faq" aria-labelledby="faq-heading">
          <h3 id="faq-heading">FAQs</h3>
          <ul>
            <li>
              <strong>Offline:</strong> Alle Daten bleiben im Browser und werden lokal via LocalStorage gesichert.
            </li>
            <li>
              <strong>Saisonkennzeichen:</strong> Hinterlege von/bis-Monate, damit die App nur im relevanten Zeitraum erinnert.
            </li>
            <li>
              <strong>HU/AU-Intervall:</strong> Standardmäßig 24 Monate – der Status berücksichtigt letzte Prüfungen oder die Erstzulassung, falls keine Einträge vorhanden sind.
            </li>
          </ul>
        </section>
      </div>
    </section>
  );
};

export default HelpPage;
