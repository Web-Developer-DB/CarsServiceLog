/**
 * @file serviceDue.js
 * @description Dient der Berechnung von Servicefälligkeiten und Status-Ampeln.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_SOON_THRESHOLD = 60;
const KM_SOON_THRESHOLD = 5000;

export const ServiceStatus = {
  OK: "OK",
  DUE_SOON: "DUE_SOON",
  OVERDUE: "OVERDUE"
};

const formatIsoDate = (value) => value.toISOString().slice(0, 10);

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isHuInterval = (name) => typeof name === "string" && name.toLowerCase().includes("hu");

const buildFallbackDate = (vehicle) => {
  if (!vehicle?.year) return null;
  const year = Number(vehicle.year);
  if (!Number.isFinite(year)) return null;
  return new Date(Date.UTC(year, 0, 1));
};

const addMonthsToDate = (date, months) => {
  if (!(date instanceof Date) || !Number.isFinite(months)) {
    return null;
  }
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
};

const computeNextDueDate = (months, lastDateString, fallbackDate) => {
  if (!Number.isFinite(months)) return null;
  const baseDate = parseDate(lastDateString) ?? fallbackDate;
  if (!baseDate) return null;
  const next = addMonthsToDate(baseDate, months);
  return next ? formatIsoDate(next) : null;
};

const differenceInDays = (targetDate, now = new Date()) => {
  const target = parseDate(targetDate);
  if (!target) return null;
  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  return (target.getTime() - nowTime) / MS_PER_DAY;
};

const findByLastEntryId = (entries, id) => (entries ?? []).find((entry) => entry.id === id);

const getEntryTimestamp = (entry) => {
  if (!entry?.date) return 0;
  const value = new Date(entry.date).getTime();
  return Number.isNaN(value) ? 0 : value;
};

const findFallbackEntry = (interval, entries) => {
  if (!interval?.vehicleId) {
    return null;
  }
  const vehicleEntries = entries
    .filter((entry) => entry.vehicleId === interval.vehicleId)
    .slice()
    .sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
  if (!vehicleEntries.length) return null;
  if (interval.name) {
    const targetName = interval.name.toLowerCase();
    const typed = vehicleEntries.find((entry) => (entry.type ?? "").toLowerCase() === targetName);
    if (typed) {
      return typed;
    }
  }
  return vehicleEntries[0];
};

const calculateServiceStatus = ({ nextDueDate, nextDueMileage, currentMileage, now = new Date() }) => {
  const dayDiff = differenceInDays(nextDueDate, now);
  const mileageDiff =
    typeof nextDueMileage === "number" && typeof currentMileage === "number"
      ? nextDueMileage - currentMileage
      : null;

  const dateOverdue = typeof dayDiff === "number" && dayDiff < 0;
  const dateDueSoon =
    typeof dayDiff === "number" && dayDiff >= 0 && dayDiff <= DAYS_SOON_THRESHOLD;
  const mileageOverdue = typeof mileageDiff === "number" && mileageDiff <= 0;
  const mileageDueSoon = typeof mileageDiff === "number" && mileageDiff > 0 && mileageDiff <= KM_SOON_THRESHOLD;

  if (dateOverdue || mileageOverdue) {
    return ServiceStatus.OVERDUE;
  }
  if (dateDueSoon || mileageDueSoon) {
    return ServiceStatus.DUE_SOON;
  }
  return ServiceStatus.OK;
};

export const getIntervalDueData = ({
  interval,
  serviceEntries = [],
  vehicle,
  now = new Date()
}) => {
  const lastEntry = interval?.lastServiceEntryId
    ? findByLastEntryId(serviceEntries, interval.lastServiceEntryId)
    : null;
  const fallbackEntry = lastEntry ?? findFallbackEntry(interval, serviceEntries);

  const intervalMonths = Number.isFinite(interval?.intervalMonths) ? interval.intervalMonths : null;
  const intervalMileage = Number.isFinite(interval?.intervalMileage) ? interval.intervalMileage : null;

  const fallbackDate = !lastEntry && isHuInterval(interval?.name) ? buildFallbackDate(vehicle) : null;
  const nextDueDate = computeNextDueDate(
    intervalMonths,
    fallbackEntry?.date,
    fallbackEntry ? null : fallbackDate
  );
  const lastMileage = typeof fallbackEntry?.mileage === "number" ? fallbackEntry.mileage : null;
  const nextDueMileage =
    intervalMileage !== null && lastMileage !== null ? lastMileage + intervalMileage : null;

  return {
    interval,
    lastServiceEntry: fallbackEntry,
    nextDueDate,
    nextDueMileage,
    status: calculateServiceStatus({
      nextDueDate,
      nextDueMileage,
      currentMileage: vehicle?.currentMileage,
      now
    })
  };
};

export const collectIntervalDueItems = ({
  intervals = [],
  serviceEntries = [],
  vehicles = [],
  now = new Date()
}) =>
  intervals
    .map((interval) => {
      const vehicle = vehicles.find((veh) => veh.id === interval.vehicleId);
      if (!vehicle) return null;
      return {
        vehicle,
        dueData: getIntervalDueData({ interval, serviceEntries, vehicle, now })
      };
    })
    .filter(Boolean);
