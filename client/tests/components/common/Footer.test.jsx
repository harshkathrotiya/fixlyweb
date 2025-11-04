import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../../../src/components/common/Footer.jsx";

import TestRouter from "../../utils/testRouter.jsx";
// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

describe("Footer", () => {
  test("renders brand and links", () => {
    render(
      <TestRouter>
        <Footer />
      </TestRouter>
    );
    expect(screen.getByText("Fixly")).toBeInTheDocument();
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getAllByText("Services").length).toBeGreaterThan(0);
  });

  test("renders without crashing", () => {
    const { container } = render(
      <TestRouter>
        <Footer />
      </TestRouter>
    );
    expect(container).toBeTruthy();
  });
});
