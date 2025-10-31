import React from "react";
import { render, screen } from "@testing-library/react";
import PieChart from "../../../src/components/admin/shared/PieChart.jsx";

describe("PieChart Component", () => {
  test("shows empty state when no data", () => {
    render(<PieChart data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  test("renders segments and total", () => {
    const data = [
      { label: "A", value: 10, color: "#f00" },
      { label: "B", value: 20, color: "#0f0" },
    ];
    render(<PieChart data={data} title="Pie" />);
    expect(screen.getByText("Pie")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("33.3%")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<PieChart data={[]} />);
    expect(container).toBeTruthy();
  });
});
