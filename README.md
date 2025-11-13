# CarsServiceLog – Entwicklerhandbuch

CarsServiceLog bietet Haushalten eine zentrale App zum lokalen Verwalten von Fahrzeugakten, Serviceterminen und Prüfintervallen (HU/AU, Ölwechsel etc.). Die Anwendung erfasst Stammdaten, Kilometerstände, Werkstattinfos und individuelle Notizen pro Fahrzeug und visualisiert sie in klar gegliederten Panels, die auf Desktop, Tablet und Mobilgeräten identisch funktionieren. Dank PWA-Unterstützung funktioniert alles auch offline: Daten werden im Browser gespeichert, können als JSON gesichert oder wiederhergestellt werden und bleiben damit vollständig unter der Kontrolle der Nutzer.

Wesentliche Funktionen sind Servicehistorien inklusive Kostenaufstellung, frei definierbare Intervalle mit Statusampel (OK, bald fällig, überfällig), Filter- und Suchoptionen, eine Backup-Ansicht sowie Hilfeseiten für Workflows. Das Dashboard liefert auf einen Blick anstehende Prüfungen und kumulierte Wartungskosten, während Detailseiten pro Fahrzeug spezifische Einträge, Notizen und Intervalle bündeln. Dadurch lässt sich etwa nachvollziehen, wann zuletzt der Zahnriemen gewechselt wurde, welche Werkstatt was berechnet hat oder welche HU/AU demnächst erledigt werden muss.

Das Ziel ist eine zuverlässige, private und intuitiv bedienbare Dokumentation der Fahrzeugpflege in Familien und Fuhrparks ohne Cloud-Zwang. So behalten Nutzer Wartungsbudgets, Garantiebedingungen und gesetzliche Fristen im Blick, können Entscheidungen rund um Reparaturen fundierter treffen und die Dokumentation bei Fahrzeugverkauf transparent weitergeben. Diese README hilft dir (oder einem zukünftigen Codex-Agenten), schnell einzusteigen, Tests zu starten, neue Features umzusetzen und das Design konsistent zu halten.

---

## Inhaltsverzeichnis
1. [Überblick & Features](#überblick--features)
2. [Technischer Stack](#technischer-stack)
3. [Setup & Skripte](#setup--skripte)
4. [Projektstruktur](#projektstruktur)
5. [State & Datenmodell](#state--datenmodell)
6. [TDD-Workflow & Tests](#tdd-workflow--tests)
7. [Design-Richtlinien](#design-richtlinien)
8. [Arbeiten mit Codex-Agenten](#arbeiten-mit-codex-agenten)
9. [Erweiterungsideen / ToDo-Bereich](#erweiterungsideen--todo-bereich)

---

## Überblick & Features
- **Fahrzeugakte**: Stammdaten, Kilometerstand, Notizen.
- **Servicehistorie**: Chronologische Einträge mit Werkstatt, Kosten, Notizen.
- **Serviceintervalle**: HU/AU, Ölwechsel etc. inkl. Statusampel (OK, bald fällig, überfällig).
- **Serviceübersicht**: Filter nach Fahrzeug, Zeitraum und Serviceart; Summen der Kosten.
- **Backup & Wiederherstellung**: JSON-Export/Import mit `schemaVersion`.
- **Offlinefähig / PWA**: Manifest, Service Worker, Installationsaufforderung.
- **Modernes UI**: dunkle Glas-Optik, orange Akzente, responsives Layout.

---

## Technischer Stack
- **Frontend**: React 18 + Vite.
- **Routing**: React Router.
- **Tests**: Jest + React Testing Library.
- **Styling**: CSS mit Custom Properties (Dark-First Palette).
- **Persistenz**: LocalStorage via `useCarsServiceLogManager`.
- **Build/Dev**: Node.js + npm.

---

## Setup & Skripte
```bash
npm install      # Abhängigkeiten
npm run dev      # Dev-Server auf http://localhost:5173
npm run build    # Build in dist/
npm run preview  # Vorschau des Builds
npm test         # Jest-Tests einmalig
npm run test:watch
npm run test:ci  # mit Coverage
```

*Vor jedem Commit:* `npm test`. Nach größeren Styling-Änderungen einmal `npm run build`, um Vite-Warnungen abzufangen.

---

## Projektstruktur
```
src/
├─ App.jsx                # Routing + globale Hooks
├─ components/            # Navigation, Buttons, Karten
├─ constants/             # Kategorien, Service-Typen
├─ hooks/
│  ├─ useCarsServiceLogManager.js
│  ├─ useInstallPrompt.js
│  └─ useThemeManager.js
├─ pages/                 # Dashboard, Vehicle, Services, Backup, Help
├─ utils/                 # Fälligkeitsberechnung, Formatter
├─ styles.css             # globales Theme + Komponenten-Styles
└─ setupTests.js          # RTL/Jest-Bootstrap

public/
├─ icons/ + service-worker.js + manifest.webmanifest
```

Tests liegen spiegelnd in `/tests` (z. B. `tests/pages/...`, `tests/hooks/...`).

---

## State & Datenmodell
- `Vehicle`: `id, name, category, manufacturer?, model?, year?, licensePlate?, vin?, currentMileage, notes?, seasonFromMonth?, seasonToMonth?`
- `ServiceEntry`: `id, vehicleId, date, mileage, type, organisationOrWorkshop?, cost?, notes?`
- `ServiceInterval`: `id, vehicleId, name, intervalMonths?, intervalMileage?, lastServiceEntryId?`
- Hook `useCarsServiceLogManager` kapselt CRUD-Operationen, Persistenz (LocalStorage) und Export/Import.
- `utils/serviceDue.js`: berechnet Ampelstatus (OK / DUE_SOON / OVERDUE) für Intervalle.

---

## TDD-Workflow & Tests
1. **Feature beschreiben**: z. B. „Serviceübersicht filtern“.
2. **Tests schreiben** (Jest + RTL). Neue Datei in `tests/...` oder vorhandene erweitern.
3. **Tests ausführen** (`npm test -- <file>`). Erwartet roten Zustand.
4. **Implementieren** – nur so viel Änderung, bis Tests grün werden.
5. **Erneut Tests ausführen** (`npm test`). Alle grün halten.
6. **Optional**: `npm run build` zum finalen Check.

Hooks/Utilities: Unit-Tests.
Pages/Komponenten: RTL (DOM-Interaktionen, Texte, Filter etc.).

---

## Design-Richtlinien
1. **Farbwelt**: Dunkles Blau (#030814) + Orange (#f97316) + helles Blau für Text.
2. **Panels**: Radialer Verlauf, 22–32px Radius, weiche Schatten.
3. **Input-Styling**: transparente Hintergründe, orange Fokus, runde Kanten.
4. **Glas-Look**: Filter-, Form- und Listensektionen nutzen denselben neonartigen Look wie auf den Screenshots.
5. **Buttons**: Primärer CTA als Gradient (Orange/Gold), Ghost/Secondary mit zarten Rändern.
6. **Typografie**: Überschriften fett, Body Inter Regular, Labels 0.95–1rem.

`styles.css` enthält zentrale Variablen (`:root`) und Komponentenklassen. Bitte dort erweitern statt Inline-Styles.

---

## Arbeiten mit Codex-Agenten
Wenn du einen Codex-Agenten einsetzt (z. B. zur weiteren Automatisierung):

1. **prompt.md lesen** – dort stehen Kontext, ursprüngliche Anforderungen, TDD-Regeln, Branding.
2. **README.md** (diese Datei) als technische Referenz nutzen.
3. **Testlauf**: Vor Eingriff `npm test`.
4. **Kommunikation**: Kurze Beschreibung, was als Nächstes umgesetzt wird; Tests → Code → Tests. Ergebnisse dokumentieren.
5. **Design-Konsistenz**: Immer `styles.css` prüfen, ob Farben/Abstände zur restlichen App passen.
6. **Backup**: Änderungen an Persistenz (Import/Export) mit JSON-Beispielen testen, damit Datenmigration funktioniert.
7. **README/ prompt aktualisieren**, wenn neue Regeln, Workflows oder Feature Checks entstehen.

---

## Erweiterungsideen / ToDo-Bereich
- **UI**: Animationen für Statusampeln, eigene Icons für Service-Arten, Light-Theme-Kontrast verbessern.
- **Funktionen**: Erinnerungen (Notifications), PDF-Export pro Fahrzeug, Saisonkennzeichen-Logik.
- **Datenmodell**: Mehr Felder (z. B. Kraftstofftyp, Nutzung), Papierkorb auch für Fahrzeuge.
- **Tests**: Weitere Edge Cases für Import/Export, Filterkombinationen, Berechnungen.
- **Dokumentation**: Changelog wieder aktiv führen, falls Releases geplant sind.

> Hast du neue Workflows oder Erkenntnisse? Ergänze sie hier und im `prompt.md`, damit der nächste Entwickler nahtlos übernehmen kann.
