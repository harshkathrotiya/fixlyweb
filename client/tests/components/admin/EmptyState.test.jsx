import React from "react";
import { render, screen } from "@testing-library/react";
import EmptyState from "../../../src/components/admin/shared/EmptyState.jsx";

describe("EmptyState Component", () => {
  test("renders title and description", () => {
    render(<EmptyState title="No items" description="Add items" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Add items")).toBeInTheDocument();
  });

  test("renders action element", () => {
    render(<EmptyState title="t" action={<button>Act</button>} />);
    expect(screen.getByText("Act")).toBeInTheDocument();
  });

  test("applies icon color classes", () => {
    render(<EmptyState title="t" iconColor="danger" />);
    const colored = document.querySelector(".bg-red-100");
    expect(colored).toBeTruthy();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container).toBeTruthy();
  });
});
