import React from "react";
import { render, screen } from "@testing-library/react";
import Breadcrumbs from "../../../src/components/admin/shared/Breadcrumbs.jsx";
import TestRouter from "../../utils/testRouter.jsx";

describe("Breadcrumbs Component", () => {
  test("renders breadcrumbs from location", () => {
    render(
      <TestRouter initialEntries={["/admin/providers/listings"]}>
        <Breadcrumbs />
      </TestRouter>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Providers")).toBeInTheDocument();
    expect(screen.getByText("Listings")).toBeInTheDocument();
  });

  test("renders custom items when provided", () => {
    const items = [
      { label: "Home", path: "/", icon: "home" },
      { label: "Page", path: "/page", icon: "circle" },
    ];
    render(
      <TestRouter>
        <Breadcrumbs items={items} />
      </TestRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Page")).toBeInTheDocument();
  });

  test("renders without crashing", () => {
    const { container } = render(
      <TestRouter>
        <Breadcrumbs />
      </TestRouter>
    );
    expect(container).toBeTruthy();
  });
});
