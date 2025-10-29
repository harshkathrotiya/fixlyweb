import React from "react";
import { render, screen } from "@testing-library/react";
import Badge from "../../../src/components/admin/shared/Badge.jsx";

describe("Badge Component", () => {
  test("renders badge with text and type classes", () => {
    render(<Badge type="pending" text="Pending" icon="clock" />);
    const el = screen.getByText("Pending");
    expect(el).toBeInTheDocument();
    expect(el.className).toMatch(/bg-yellow-100/);
    expect(el.querySelector("i")).toHaveClass("fa-clock");
  });

  test("renders provider badge variant", () => {
    render(<Badge type="provider" text="Provider" />);
    expect(screen.getByText("Provider")).toBeInTheDocument();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<Badge text="Default" />);
    expect(container).toBeTruthy();
  });
});
