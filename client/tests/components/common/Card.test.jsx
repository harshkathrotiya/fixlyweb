import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "../../../src/components/common/Card.jsx";

describe("Card Component", () => {
  test("renders children", () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  test("applies default card classes", () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    const card = container.firstChild;
    expect(card.className).toMatch(/bg-white/);
    expect(card.className).toMatch(/rounded-xl/);
    expect(card.className).toMatch(/shadow-md/);
  });

  test("applies custom className", () => {
    const { container } = render(
      <Card className="custom-card">
        <div>Content</div>
      </Card>
    );
    const card = container.firstChild;
    expect(card.className).toMatch(/custom-card/);
  });

  test("passes through additional props", () => {
    const { container } = render(
      <Card data-testid="card" id="test-card">
        <div>Content</div>
      </Card>
    );
    const card = container.firstChild;
    expect(card).toHaveAttribute("data-testid", "card");
    expect(card).toHaveAttribute("id", "test-card");
  });

  test("renders without crashing with default props", () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    expect(container).toBeTruthy();
  });
});

