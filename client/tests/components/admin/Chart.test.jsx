import React from "react";
import { render, screen } from "@testing-library/react";
import Chart from "../../../src/components/admin/shared/Chart.jsx";

describe("Chart Component", () => {
  test("renders empty state", () => {
    render(<Chart data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  test("renders bar chart labels", () => {
    const data = [
      { label: "A", value: 5 },
      { label: "B", value: 10 },
    ];
    render(<Chart type="bar" data={data} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  test("renders line chart points", () => {
    const data = [
      { label: "A", value: 5 },
      { label: "B", value: 7 },
    ];
    render(<Chart type="line" data={data} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<Chart data={[]} />);
    expect(container).toBeTruthy();
  });
});
