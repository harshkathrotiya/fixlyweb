import React from "react";
import { render, screen } from "@testing-library/react";
import ServiceDetailsInfo from "../../../src/components/service-details/ServiceDetailsInfo.jsx";

describe("ServiceDetailsInfo Component", () => {
  test("renders service details with all information", () => {
    render(
      <ServiceDetailsInfo
        location="Mumbai, Maharashtra"
        isActive={true}
        estimatedHours="2-3"
        serviceType="Home Service"
      />
    );
    expect(screen.getByText("Service Details")).toBeInTheDocument();
    expect(screen.getByText("Service Area")).toBeInTheDocument();
    expect(screen.getByText("Mumbai, Maharashtra")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Currently Available")).toBeInTheDocument();
    expect(screen.getByText("Estimated Duration")).toBeInTheDocument();
    expect(screen.getByText("2-3 hours")).toBeInTheDocument();
    expect(screen.getByText("Service Guarantee")).toBeInTheDocument();
  });

  test("shows unavailable status when isActive is false", () => {
    render(
      <ServiceDetailsInfo
        location="Delhi"
        isActive={false}
        estimatedHours="1"
      />
    );
    expect(screen.getByText("Currently Unavailable")).toBeInTheDocument();
  });

  test("shows default location when not provided", () => {
    render(
      <ServiceDetailsInfo
        isActive={true}
        estimatedHours="1-2"
      />
    );
    expect(screen.getByText("Service area not specified")).toBeInTheDocument();
  });

  test("shows default estimated hours when not provided", () => {
    render(
      <ServiceDetailsInfo
        location="Test Location"
        isActive={true}
      />
    );
    expect(screen.getByText("1-2 hours")).toBeInTheDocument();
  });

  test("renders without crashing with minimal props", () => {
    const { container } = render(
      <ServiceDetailsInfo
        isActive={true}
      />
    );
    expect(container).toBeTruthy();
  });
});

