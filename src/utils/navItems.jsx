/**
 * @file navItems.jsx
 * @description Navigationsdaten für Desktop- und Mobile-Teile der App.
 */

const DashboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M2 12a10 10 0 0120 0A10 10 0 012 12zm10-8v5m0 0c2.5 0 4.5 2 4.5 4.5M6.5 11a4.5 4.5 0 019 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ServicesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 6h16M4 12h16M4 18h16M4 6l1.5 1.5M4 12l1.5 1.5M4 18l1.5 1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BackupIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M6 17h12a3.5 3.5 0 002.8-5.7 4.5 4.5 0 00-4.2-2.8H14a4 4 0 00-4 4h-1.8A3 3 0 006 17zm5-5v5m0 0l-2-2m2 2l2-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HelpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 18h.01M11.1 9a1.9 1.9 0 113.8 0c0 1.9-1.9 1.9-1.9 3.8M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NAV_CONFIG = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/",
    Icon: DashboardIcon,
    end: true
  },
  {
    key: "services",
    label: "Services",
    to: "/services",
    Icon: ServicesIcon,
    end: true,
    badgeKey: "serviceAlerts"
  },
  {
    key: "backup",
    label: "Backup",
    to: "/backup",
    Icon: BackupIcon,
    end: true
  },
  {
    key: "help",
    label: "Hilfe",
    to: "/help",
    Icon: HelpIcon,
    end: true
  }
];

const resolveBadge = (badgeKey, stats = {}) => {
  if (!badgeKey) return null;
  const value = stats[badgeKey];
  if (typeof value !== "number" || value <= 0) {
    return null;
  }
  return value;
};

export const buildNavItems = (stats = {}) =>
  NAV_CONFIG.map(({ Icon, badgeKey, ...item }) => ({
    ...item,
    icon: <Icon />,
    badge: resolveBadge(badgeKey, stats)
  }));
