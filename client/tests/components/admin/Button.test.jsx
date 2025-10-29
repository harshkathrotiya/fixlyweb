import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../../src/components/admin/shared/Button.jsx";
import TestRouter from "../../utils/testRouter.jsx";

describe("Button Component", () => {
  test("renders button with variant and icon", () => {
    const onClick = jest.fn();
    render(
      <Button variant="success" icon="check" onClick={onClick}>
        Save
      </Button>
    );
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn.className).toMatch(/admin-btn/);
    expect(btn.className).toMatch(/admin-btn-success/);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  test("renders link button", () => {
    render(
      <TestRouter>
        <Button to="/foo">Go</Button>
      </TestRouter>
    );
    const link = screen.getByText("Go").closest("a");
    expect(link).toHaveAttribute("href", "/foo");
  });

  test("shows spinner when loading", () => {
    render(<Button isLoading>Load</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector("svg")).toBeTruthy();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<Button>Click</Button>);
    expect(container).toBeTruthy();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("disables button when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });
});
