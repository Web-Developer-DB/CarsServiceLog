/**
 * @file navItems.test.jsx
 * @description Validiert Badgelogik und Icon-Vergabe der Navigationshilfe.
 */

import { buildNavItems } from "../../src/utils/navItems.jsx";

describe("buildNavItems", () => {
  test("liefert für jede Route ein Icon und optionales Badge", () => {
    const items = buildNavItems({ vehicleCount: 3, serviceAlerts: 2 });
    const dashboard = items.find((item) => item.key === "dashboard");
    const services = items.find((item) => item.key === "services");
    const backup = items.find((item) => item.key === "backup");

    expect(dashboard.icon).toBeTruthy();
    expect(services.badge).toBe(2);
    expect(backup.badge).toBeNull();
  });

  test("unterdrückt Badges mit Nullwerten", () => {
    const items = buildNavItems({ vehicleCount: 0, serviceAlerts: 0 });
    const services = items.find((item) => item.key === "services");
    expect(services.badge).toBeNull();
  });
});
