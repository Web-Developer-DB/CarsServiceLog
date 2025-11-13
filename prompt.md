# CarsServiceLog – Prompt für nachfolgende Codex-Agenten

## Projektüberblick

CarsServiceLog ist eine offlinefähige React/Vite-PWA, die private Haushalte in Deutschland bei der Verwaltung ihrer Fahrzeugakte, Servicehistorie und Wartungsintervalle unterstützt. Daten bleiben lokal (LocalStorage + JSON-Backup/Restore) und lassen sich über dedizierte Hooks steuern. Die App ist deutschsprachig und berücksichtigt typische Features wie Saisonkennzeichen, HU/AU-Intervalle und Kostenübersichten.

## Wichtige Komponenten & Hooks

- `src/hooks/useCarsServiceLogManager.js`: zentraler Store inklusive Persistenz, Papierkorb, Export/Import, CRUD für Vehicles/ServiceEntries/ServiceIntervals.
- `src/utils/serviceDue.js`: Utility zur Berechnung von Statusampeln (OK / DUE_SOON / OVERDUE) und Aggregation für Dashboard/Vehicle.
- Seiten:
  - `DashboardPage` (`src/pages/DashboardPage.jsx`): Fahrzeugübersicht, Statuslisten, CTA für neuen Wagen.
  - `VehiclePage`: Detailseite mit Servicehistorie und Intervallen.
  - `ServicesPage`: Liste aller Serviceeinträge mit Filter- und Kosten-Balance.
  - `NewVehiclePage`: Formular für neue Fahrzeuge.
  - `BackupPage`: JSON-Export/Import inklusive Schema-Version-Anzeige.
  - `HelpPage`: deutschsprachige Hilfe & Inline-Navigation.
- Navigation: `src/utils/navItems.jsx` liefert Dashboard/Services/Backup/Hilfe plus Badge-Logik; Desktop- und Mobile-Nav referenzieren das Modell.
- Theme/Install: `useThemeManager` + `useInstallPrompt` (bestehend) werden weiterhin genutzt, damit Dashboard Theme- und Install-Buttons erhält.

## Projektstruktur & Assets

- `public/manifest.webmanifest`, Icon + Service Worker (`public/icons` & `public/service-worker.js`) wurden auf CarsServiceLog umgestellt; manifest enthält neue Icons inkl. maskable SVG.
- `index.html`, `README.md`, `package.json` reflektieren neuen Namen/Branding.
- Tests liegen in `tests/` und folgen TDD: neue Hooks/Utils/Seiten werden jeweils durch eigene `.test.*`-Dateien abgedeckt.

## Workflow & Befehle

1. **Setup** (einmalig): `npm install`
2. **Tests ausführen**: `npm test` (Jest startet alle Tests – TDD beachten!)
3. **Build**: `npm run build`
4. **TDD-Vorgehen**: Immer erst Tests anlegen (Hooks/Utils/Seiten), dann Implementierung; Änderungen mit kleinen Schritten nachverfolgen.
5. **Projekt fertigstellen**:
   - UI: Dashboard, VehiclePage, ServicesPage, Backup/Super-help mit deutschen Texten prüfen.
   - Data Model: Vehicles, ServiceEntries, ServiceIntervals mit `useCarsServiceLogManager` vollständig abgedeckt und getestet.
   - PWA/Branding: manifest, icons, index.html, service worker und README konsistent aktualisieren.
   - Backup/Import: JSON-Schema Version testen, `useCarsServiceLogManager` Export/Import-APIs verifizieren.
   - TDD: Für jede Veränderung Tests schreiben, `npm test`, `npm run build`.
   - Dokumentation: README aktualisieren, ggf. changelog oder prompt aktualisieren.

## Hinweise für Unterbrechungen

Wenn du nach einer Pause wieder einsteigst:

1. Lies `prompt.md` + `README.md`, um Kontext und Anforderungen zu verstehen.
2. Starte mit `npm test`, um aktuellen Status zu prüfen (Tests bereits grün).
3. Nutze `src/hooks/useCarsServiceLogManager.js` als Einstiegspunkt in Persistenzlogik; alle UI-Features hängen an ihm.
4. Halte dich an deutsche UI-Texte und TDD-Prinzipien; neue Komponenten benötigen begleitende RTL-Tests.

## Typische Aufgaben

- Neue Features -> Hook/Utility testen, dann implementieren.
- UI-Änderungen -> Neue Seite oder Komponente mit `React Testing Library`.
- Backup/Import -> `src/hooks/useCarsServiceLogManager` + `BackupPage`.
- Branding/PWA -> `public/manifest.webmanifest`, `index.html`, `README.md`, Icons, Service Worker.

Dieses Prompt speichert den Stand, damit ein neuer Codex-Agent schneller anknüpfen kann. Bitte bei jeder Änderung die Tests und das Build-Skript ausführen und dokumentieren.

## Zurück zu den Ausgangsanforderungen
Damit Codex die Qualitätsarbeit fortsetzen kann, hier die vollständige To-do-Checkliste aus der ersten Nachricht:

1. **Analyse & Umbau** von Logorama zu CarsServiceLog: Struktur verstehen, Hooks und Routing prüfen.
2. **TDD-first-Entwicklung**: Für jede neue Hook/Utility/Seite priorisiert Tests schreiben und dann umsetzen.
3. **Datenmodell**: Vehicles, ServiceEntries und ServiceIntervals als Typen/Interfaces definieren, Hook `useCarsServiceLogManager` für CRUD/Persistenz/Papierkorb bauen.
4. **UI-Funktionen**:
   - Dashboard (`/`) mit Fahrzeugliste, Statusfarben, „Demnächst fällig“ & „Überfällig“.
   - Fahrzeugakte (`/vehicle/:id`) mit Stammdaten, Historie & Intervallen.
   - Serviceübersicht (`/services`) mit Filter und Kostenübersicht.
   - Backup/Einstellungen (`/backup` oder `/settings`) mit JSON-Export/-Import.
5. **Statuslogik & Utilities**: Statusampeln für Fälligkeiten, HU/AU-Intervall (24 Monate) inkl. Tests.
6. **Branding & PWA**: Manifest, Icons, Service Worker, `index.html`, App-Name ändern; UI-Texte auf Deutsch. Icons inkl. Auto+Werkzeug SB-Icon ergänzen.
7. **Backup/Restore**: Schema-Version, Export/Import via JSON testen.
8. **Dokumentation**: README anpassen (neuer Name, Beschreibung, Features, Setup, Hinweis auf Logorama-Herkunft).

Alle Schritte sind TDD-basiert und erfordern Tests vor der Implementierung plus Hinweis auf fortlaufende Tests/Builds.

## Design-Überblick
- Farbwelt: Türkis-Gradienten, warme Orange-Akzente für Warnungen, viel Weißraum mit abgerundeten Cards.
- Layout: Hero-Panels mit radialem Hintergrund, strategisch platzierte CTAs (Fahrzeug anlegen + Theme/Install), weiche Schatten.
- Komponenten: `.panel` mit 22px Border-Radius, `.dashboard-page__vehicle-card` hovert mit Accent-Border, `.primary`/`.ghost` Buttons folgen dem neuen Stil.
- Typografie: „Inter“ bleibt, Buttons und Titel leicht größer, Controls mit hoher Leserlichkeit.

Nutze diese Design-Tipps bei neuen Komponenten, damit das komplette Projekt optisch zusammenbleibt.
