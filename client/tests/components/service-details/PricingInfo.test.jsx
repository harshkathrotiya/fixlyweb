import React from "react";
import { render, screen } from "@testing-library/react";
import PricingInfo from "../../../src/components/service-details/PricingInfo.jsx";

describe("PricingInfo", () => {
  test("shows base price", () => {
    render(<PricingInfo servicePrice={100} userRole="user" />);
    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.queryByText(/Your Earning/)).toBeNull();
  });

  test("shows provider earnings when userRole is provider", () => {
    render(
      <PricingInfo
        servicePrice={200}
        providerEarning={150}
        commissionAmount={50}
        userRole="provider"
      />
    );
    expect(screen.getByText("₹200")).toBeInTheDocument();
    expect(screen.getByText("Your Earning:")).toBeInTheDocument();
    expect(screen.getByText("₹150")).toBeInTheDocument();
    expect(screen.getByText("Platform Fee:")).toBeInTheDocument();
    expect(screen.getByText("₹50")).toBeInTheDocument();
  });
});
