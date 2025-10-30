import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Card from "../../../src/components/admin/shared/Card.jsx";

describe("Card Component", () => {
  test("renders card with title and value", () => {
    render(
      <Card title="Users" value="10" icon={<i className="fas fa-users" />} />
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("calls onClick handler", () => {
    const onClick = jest.fn();
    render(<Card title="Clickable" value="1" onClick={onClick} />);
    fireEvent.click(screen.getByText("Clickable"));
    expect(onClick).toHaveBeenCalled();
  });

  test("shows trend value", () => {
    render(<Card title="Growth" value="100" trend="up" trendValue="+10%" />);
    expect(screen.getByText("+10%")).toBeInTheDocument();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<Card title="Title" value="0" />);
    expect(container).toBeTruthy();
  });
});
