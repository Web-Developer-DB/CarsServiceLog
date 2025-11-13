/**
 * @file DesktopNav.test.jsx
 * @description Snapshot-freier Test für Desktop- und Mobilnavigation – prüft, ob Badges und
 * aktive Links korrekt gerendert werden.
 */

import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import DesktopNav from "../../src/components/DesktopNav.jsx";
import MobileNav from "../../src/components/MobileNav.jsx";

const stats = {
  vehicleCount: 3,
  serviceAlerts: 2
};

describe("Navigation", () => {
  test("DesktopNav zeigt Badges und aktive Route", () => {
    render(
      <MemoryRouter
        initialEntries={["/services"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <DesktopNav stats={stats} />
      </MemoryRouter>
    );

    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(
      screen.getByText("2", { selector: ".desktop-nav__badge" })
    ).toBeInTheDocument();
    const serviceLinks = screen.getAllByRole("link", { name: /Services/i });
    expect(serviceLinks.length).toBeGreaterThan(0);
    expect(serviceLinks[0]).toHaveClass("desktop-nav__link--active");
  });

  test("MobileNav rendert identische Datenbasis", () => {
    render(
      <MemoryRouter
        initialEntries={["/help"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <MobileNav stats={stats} />
      </MemoryRouter>
    );

    expect(screen.getByText("Hilfe")).toBeInTheDocument();
    const helpLinks = screen.getAllByRole("link", { name: /Hilfe/i });
    expect(helpLinks[0]).toHaveClass("mobile-nav__link--active");
  });
});
