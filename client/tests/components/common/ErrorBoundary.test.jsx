import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../../../src/components/common/ErrorBoundary.jsx";

function Boom() {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  test("renders fallback on error", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  test("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });
});
