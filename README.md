# 🌌 CarsServiceLog · Projekt-README

<div align="center" style="padding:1.5rem;border-radius:1rem;background:linear-gradient(135deg,#03050d 0%,#0f172a 60%,#312e81 100%);color:#f8fafc;">
  <p style="font-size:1.15rem;margin:0;">Offline-fähiges Fahrzeug-Cockpit für Familien & Fuhrparks</p>
  <p style="margin:0.35rem 0 0;">React · Vite · Jest · Dark Neon UI</p>
</div>

<br/>

<div align="center">
  <img alt="Tech badge" src="https://img.shields.io/badge/Frontend-React%2018-61dafb?style=flat-square&logo=react&logoColor=20232a"/>
  <img alt="Build" src="https://img.shields.io/badge/Build-Vite%20%2B%20npm-facc15?style=flat-square&logo=vite&logoColor=8034ff"/>
  <img alt="Tests" src="https://img.shields.io/badge/Tests-Jest%20%2B%20RTL-ef4444?style=flat-square&logo=jest&logoColor=fff"/>
  <img alt="PWA" src="https://img.shields.io/badge/PWA-Ready-10b981?style=flat-square&logo=pwa&logoColor=fff"/>
</div>

---

## Inhaltsverzeichnis
1. [Produktüberblick](#-produktüberblick)
2. [Tech Stack & Architektur](#-tech-stack--architektur)
3. [Setup & CLI-Shortcuts](#-setup--cli-shortcuts)
4. [Projektstruktur](#-projektstruktur)
5. [State & Datenmodell](#-state--datenmodell)
6. [TDD & Test-Playbook](#-tdd--test-playbook)
7. [Designsystem](#-designsystem)
8. [Arbeiten mit Codex-Agenten](#-arbeiten-mit-codex-agenten)
9. [Roadmap & Ideen](#-roadmap--ideen)

---

## 🚗 Produktüberblick

> **Mission:** Haushalte behalten Wartungskosten, Termine und Dokumentation ihrer Fahrzeuge komplett lokal – kein Cloud-Lock-in, volle Kontrolle.

| Panel | Highlights |
| --- | --- |
| **Fahrzeugakte** | Stammdaten, Kilometerstand, Notizen, saisonale Nutzung |
| **Servicehistorie** | Chronologische Einträge, Werkstattinfos, Kosten, freie Kommentare |
| **Intervalle** | HU/AU, Ölwechsel & Co. mit Ampelstatus: `OK · Bald fällig · Überfällig` |
| **Dashboard** | Anstehende Prüfungen, Kosten-Heatmap, Filter nach Fahrzeug/Zeitraum |
| **Backup** | JSON-Export/-Import mit `schemaVersion`, offline-first persistiert |

🔒 **PWA & Offline**  
Der `useCarsServiceLogManager` persistiert alle Daten via LocalStorage. Backups und Wiederherstellung funktionieren komplett lokal; so bleiben Wartungsnachweise auch für Fahrzeugverkauf oder Garantie transparent.

---

## 🧱 Tech Stack & Architektur

| Layer | Stack |
| --- | --- |
| UI | React 18 + React Router + Vite |
| Styling | CSS Custom Properties, Dark-First Palette, Glas-Optik |
| State/Persistenz | Custom Hooks, LocalStorage, JSON Import/Export |
| Tests | Jest, React Testing Library, Coverage via `npm run test:ci` |

**Build Targets**
- `node >= 18`
- Dev-Server via Vite (`npm run dev`)
- PWA Assets im `public/` Ordner, inklusive `service-worker.js` & `manifest.webmanifest`

---

## ⚡ Setup & CLI-Shortcuts

```bash
npm install         # Dependencies
npm run dev         # http://localhost:5173
npm run build       # Prod build -> dist/
npm run preview     # Preview des Build-Outputs
npm test            # Jest einmalig
npm run test:watch  # Watch-Mode
npm run test:ci     # CI + Coverage
```

> 💡 **Workflow-Tipp:** Vor jedem Commit `npm test` laufen lassen und nach größeren UI-Änderungen `npm run build`, um PWA-Warnungen früh zu sehen.

---

## 🗂 Projektstruktur

```text
src/
├─ App.jsx                   # Routing & globale Provider
├─ components/               # Cards, Navigation, Primary Buttons
├─ constants/                # Kategorien, Intervaltypen
├─ hooks/
│  ├─ useCarsServiceLogManager.js
│  ├─ useEntriesManager.js
│  ├─ useInstallPrompt.js
│  └─ useThemeManager.js
├─ pages/                    # Dashboard, Vehicle, Services, Backup, Help
├─ utils/                    # Fälligkeitslogik, Formatter
├─ styles.css                # Theme, Glas-/Panel-Styles
└─ setupTests.js             # Jest + RTL bootstrap

tests/
└─ …                         # Spiegeln Seiten/Hooks/Utils

public/
└─ icons/ · images/ · manifest · service-worker.js
```

---

## 🧬 State & Datenmodell

```ts
Vehicle {
  id: string
  name: string
  category: string
  manufacturer?: string
  model?: string
  year?: number
  licensePlate?: string
  vin?: string
  currentMileage: number
  notes?: string
  seasonFromMonth?: number
  seasonToMonth?: number
}

ServiceEntry {
  id: string
  vehicleId: string
  date: string
  mileage: number
  type: string
  organisationOrWorkshop?: string
  cost?: number
  notes?: string
}

ServiceInterval {
  id: string
  vehicleId: string
  name: string
  intervalMonths?: number
  intervalMileage?: number
  lastServiceEntryId?: string
}
```

`useCarsServiceLogManager` kapselt CRUD, Persistenz, Backup und Import-Validierung.  
`utils/serviceDue.js` berechnet das Ampelsystem (`OK`, `DUE_SOON`, `OVERDUE`).

---

## 🧪 TDD & Test-Playbook

1. **Feature definieren** – z. B. Filterlogik, neue Hooks oder UI-Flows.
2. **Tests zuerst schreiben** (Dateien unter `tests/...` spiegeln die Struktur von `src/...`).
3. **Red → Green → Refactor** fahren und zielgerichtet `npm test -- <file>` laufen lassen.
4. **Abschluss**: Gesamtsuite (`npm test`) + optional `npm run build`.

| Bereich | Erwartete Tests |
| --- | --- |
| Hooks/Utils | Unit-Tests für Import, Persistenz, Fälligkeiten |
| Pages/Komponenten | RTL-Tests: DOM, Filter, Notizen, Backup-Flows |
| PWA/Backup | JSON-Roundtrips, Schema-Versionen, Edge Cases |

---

## 🎨 Designsystem

> **Moodboard:** Dunkles Blau (#030814) + Neon-Orange (#f97316) + helles Blau für Lesbarkeit.

| Element | Regel |
| --- | --- |
| Panels & Cards | Radiale/lineare Verläufe, 22–32px Radius, Glas-Schatten |
| Inputs | Transparente Hintergründe, orange Fokus-Linie, weiche Kanten |
| Buttons | Primary = Orange/Gold Gradient; Secondary = Ghost/Outline |
| Typografie | Überschriften fett, Body Inter Regular, Labels 0.95–1rem |
| Status | Ampelchips (`OK`, `Soon`, `Overdue`) mit Mini-Animation erlaubt |

👉 `src/styles.css` beherbergt alle Custom Properties – neue Komponenten dort andocken, nicht Inline.

---

## 🤖 Arbeiten mit Codex-Agenten

1. `prompt.md` lesen (Branding, Anforderungen, Testregeln).
2. Diese README als technische Referenz nutzen.
3. Vor Änderungen Statusbericht posten und `npm test` laufen lassen.
4. Kommunikation knapp halten: Roadmap → Tests → Code → Tests.
5. Persistenzänderungen immer mit Beispiel-JSON prüfen (Export + Import).
6. Neue Erkenntnisse sofort in `prompt.md` sowie im Kapitel **Roadmap & Ideen** notieren.

---

## 🛰 Roadmap & Ideen

> 🚀 Offene Slots für das nächste Sprint-Planning

- UI: animierte Statuschips, individuelle Icons je Serviceart, Light-Theme-Kontrast schärfen.
- Funktionen: Notifications/Reminders, PDF-Export pro Fahrzeug, Saisonkennzeichen-Intelligenz.
- Datenmodell: Kraftstofftyp, Nutzungsprofil, Soft-Delete („Papierkorb“) für Fahrzeuge.
- Tests: Edge Cases für Import/Export, Filter-Kombinationen, Kostenaggregation.
- Dokumentation: Changelog regelmäßiger pflegen, wenn Releases geplant sind.

> **Call to Action:** Neue Workflows oder Learnings? Direkt hier und im `prompt.md` notieren – spart Zeit für den nächsten Agenten.
