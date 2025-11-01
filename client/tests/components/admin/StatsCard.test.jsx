import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StatsCard from "../../../src/components/admin/shared/StatsCard.jsx";

describe("StatsCard Component", () => {
  test("renders value and change", () => {
    render(
      <StatsCard
        title="Revenue"
        value="1000"
        change="+5%"
        changeType="increase"
        icon="money-bill"
        color="info"
      />
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  test("calls onClick handler", () => {
    const onClick = jest.fn();
    render(<StatsCard title="Click" value="1" onClick={onClick} />);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalled();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<StatsCard title="Title" value="0" />);
    expect(container).toBeTruthy();
  });
});
