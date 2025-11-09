import React from "react";
import { render, screen } from "@testing-library/react";
import ServiceDescription from "../../../src/components/service-details/ServiceDescription.jsx";

describe("ServiceDescription Component", () => {
  test("renders description", () => {
    render(
      <ServiceDescription
        description="This is a test service description"
      />
    );
    expect(screen.getByText("About This Service")).toBeInTheDocument();
    expect(screen.getByText("This is a test service description")).toBeInTheDocument();
  });

  test("renders tags when provided", () => {
    const tags = ["plumbing", "emergency", "24/7"];
    render(
      <ServiceDescription
        description="Test description"
        tags={tags}
      />
    );
    expect(screen.getByText("Service Tags")).toBeInTheDocument();
    expect(screen.getByText("plumbing")).toBeInTheDocument();
    expect(screen.getByText("emergency")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
  });

  test("does not render tags section when tags are empty", () => {
    render(
      <ServiceDescription
        description="Test description"
        tags={[]}
      />
    );
    expect(screen.getByText("About This Service")).toBeInTheDocument();
    expect(screen.queryByText("Service Tags")).not.toBeInTheDocument();
  });

  test("does not render tags section when tags are not provided", () => {
    render(
      <ServiceDescription
        description="Test description"
      />
    );
    expect(screen.getByText("About This Service")).toBeInTheDocument();
    expect(screen.queryByText("Service Tags")).not.toBeInTheDocument();
  });

  test("renders without crashing with minimal props", () => {
    const { container } = render(
      <ServiceDescription
        description="Test"
      />
    );
    expect(container).toBeTruthy();
  });
});

