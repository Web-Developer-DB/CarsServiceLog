/**
 * @file App.jsx
 * @description Shell der CarsServiceLog-PWA mit Routing, Navigation und Backup-Flow.
 */

import { useCallback, useMemo } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import DesktopNav from "./components/DesktopNav.jsx";
import MobileNav from "./components/MobileNav.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import VehiclePage from "./pages/VehiclePage.jsx";
import BackupPage from "./pages/BackupPage.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import useCarsServiceLogManager from "./hooks/useCarsServiceLogManager.js";
import useInstallPrompt from "./hooks/useInstallPrompt.js";
import useThemeManager from "./hooks/useThemeManager.js";
import NewVehiclePage from "./pages/NewVehiclePage.jsx";
import { collectIntervalDueItems, ServiceStatus } from "./utils/serviceDue.js";

const STATUS_PRIORITY = {
  [ServiceStatus.OVERDUE]: 0,
  [ServiceStatus.DUE_SOON]: 1,
  [ServiceStatus.OK]: 2
};

const App = () => {
  const { themeMode, resolvedTheme, cycleThemeMode } = useThemeManager();
  const {
    vehicles,
    serviceEntries,
    serviceIntervals,
    schemaVersion,
    updateVehicle,
    addVehicle,
    addServiceEntry,
    deleteServiceEntry,
    addServiceInterval,
    updateServiceInterval,
    deleteServiceInterval,
    exportState,
    applyImportedData
  } = useCarsServiceLogManager();
  const { installPromptEvent, promptInstall } = useInstallPrompt();
  const location = useLocation();
  const navigate = useNavigate();

  const intervalDueItems = useMemo(
    () =>
      collectIntervalDueItems({
        intervals: serviceIntervals,
        serviceEntries,
        vehicles
      }),
    [vehicles, serviceEntries, serviceIntervals]
  );

  const dueSoonItems = useMemo(
    () => intervalDueItems.filter((item) => item.dueData?.status === ServiceStatus.DUE_SOON),
    [intervalDueItems]
  );
  const overdueItems = useMemo(
    () => intervalDueItems.filter((item) => item.dueData?.status === ServiceStatus.OVERDUE),
    [intervalDueItems]
  );

  const vehicleSummaries = useMemo(
    () =>
      vehicles.map((vehicle) => {
        const related = intervalDueItems.filter((item) => item.vehicle.id === vehicle.id);
        if (!related.length) {
          return {
            vehicle,
            status: ServiceStatus.OK,
            nextDue: null
          };
        }
        const nextDue = [...related].sort((a, b) => {
          const orderA = STATUS_PRIORITY[a.dueData?.status ?? ServiceStatus.OK];
          const orderB = STATUS_PRIORITY[b.dueData?.status ?? ServiceStatus.OK];
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          const dateA = a.dueData?.nextDueDate
            ? new Date(a.dueData.nextDueDate).getTime()
            : Number.POSITIVE_INFINITY;
          const dateB = b.dueData?.nextDueDate
            ? new Date(b.dueData.nextDueDate).getTime()
            : Number.POSITIVE_INFINITY;
          return dateA - dateB;
        })[0];
        return {
          vehicle,
          status: nextDue.dueData?.status ?? ServiceStatus.OK,
          nextDue: nextDue.dueData
        };
      }),
    [vehicles, intervalDueItems]
  );

  const hasStoredData =
    vehicles.length + serviceEntries.length + serviceIntervals.length > 0;

  const handleViewVehicle = useCallback(
    (vehicleId) => {
      navigate(`/vehicle/${vehicleId}`);
    },
    [navigate]
  );

  const handleCreateVehicle = useCallback(() => {
    navigate("/vehicle/new");
  }, [navigate]);

  const handleExport = useCallback(() => {
    if (typeof document === "undefined") return;
    const payload = exportState();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const fileName = `cars-service-log-backup-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [exportState]);

  const handleImportFile = useCallback(
    async (event) => {
      const input = event.target;
      const file = input?.files?.[0];
      if (!file) {
        return;
      }
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        applyImportedData(payload);
      } catch (error) {
        console.error("Import fehlgeschlagen:", error);
      } finally {
        input.value = "";
      }
    },
    [applyImportedData]
  );

  const navStats = {
    vehicleCount: vehicles.length,
    serviceAlerts: dueSoonItems.length + overdueItems.length
  };

  const isHelpRoute = location.pathname === "/help";

  const VehicleDetailsRoute = () => {
    const { id } = useParams();
    const vehicle = vehicles.find((item) => item.id === id);
    if (!vehicle) {
      return <Navigate to="/" replace />;
    }
    const entries = serviceEntries.filter((entry) => entry.vehicleId === vehicle.id);
    const intervals = serviceIntervals.filter((interval) => interval.vehicleId === vehicle.id);
    return (
      <VehiclePage
        vehicle={vehicle}
        serviceEntries={entries}
        serviceIntervals={intervals}
        onUpdateVehicle={updateVehicle}
        onAddServiceEntry={addServiceEntry}
        onDeleteServiceEntry={deleteServiceEntry}
        onAddServiceInterval={addServiceInterval}
        onUpdateServiceInterval={updateServiceInterval}
        onDeleteServiceInterval={deleteServiceInterval}
      />
    );
  };

  return (
    <>
      <main className={`app-shell${isHelpRoute ? " app-shell--has-footer" : ""}`}>
        <DesktopNav stats={navStats} />
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                vehicleSummaries={vehicleSummaries}
                dueSoon={dueSoonItems}
                overdue={overdueItems}
                onViewVehicle={handleViewVehicle}
                onAddVehicle={handleCreateVehicle}
                themeMode={themeMode}
                resolvedTheme={resolvedTheme}
                onToggleTheme={cycleThemeMode}
                onInstallApp={promptInstall}
                canInstall={Boolean(installPromptEvent)}
              />
            }
          />
          <Route path="/vehicle/new" element={<NewVehiclePage onCreate={addVehicle} />} />
          <Route path="/vehicle/:id" element={<VehicleDetailsRoute />} />
          <Route
            path="/services"
            element={<ServicesPage serviceEntries={serviceEntries} vehicles={vehicles} />}
          />
          <Route
            path="/backup"
            element={
              <BackupPage
                schemaVersion={schemaVersion}
                onExport={handleExport}
                onImportFile={handleImportFile}
                disableExport={!hasStoredData}
              />
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isHelpRoute ? (
        <>
          <footer className="app-footer">
            <div className="app-footer__inner">
              <span>MIT License · Created by CarsServiceLog</span>
              <a href="https://github.com/Web-Developer-DB/Logorama" target="_blank" rel="noopener noreferrer">
                Source Code auf GitHub
              </a>
            </div>
          </footer>
          <div className="app-footer__spacer" />
        </>
      ) : null}
      <MobileNav stats={navStats} />
    </>
  );
};

export default App;
