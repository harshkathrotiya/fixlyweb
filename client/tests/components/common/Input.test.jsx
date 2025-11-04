import React from "react";
import { render, screen } from "@testing-library/react";
import Input from "../../../src/components/common/Input.jsx";

describe("Input", () => {
  test("renders label and error", () => {
    render(<Input id="x" label="Name" error="Required" />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  test("renders input without label", () => {
    render(<Input id="x" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  test("applies error styling when error is present", () => {
    render(<Input id="x" label="Test" error="Error message" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<Input id="test" />);
    expect(container).toBeTruthy();
  });
});
