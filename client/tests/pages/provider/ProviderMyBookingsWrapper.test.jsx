import React from "react";
import { render, screen, act } from "@testing-library/react";

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ user: { role: "service_provider" } }),
}));
jest.mock("../../../src/pages/user/MyBookings", () => () => (
  <div data-testid="mybookings">MyBookings</div>
));
jest.mock(
  "../../../src/pages/provider/ProviderLayout",
  () =>
    ({ children }) =>
      <div data-testid="provider-layout">{children}</div>
);

import ProviderMyBookingsWrapper from "../../../src/pages/provider/ProviderMyBookingsWrapper";

describe("ProviderMyBookingsWrapper", () => {
  test("wraps MyBookings with ProviderLayout when user is a service_provider", async () => {
    await act(async () => {
      render(<ProviderMyBookingsWrapper />);
    });
    expect(screen.getByTestId("provider-layout")).toBeInTheDocument();
    expect(screen.getByTestId("mybookings")).toBeInTheDocument();
  });

  test("renders wrapper without crashing", async () => {
    await act(async () => {
      render(<ProviderMyBookingsWrapper />);
    });
    expect(screen.getByTestId("provider-layout")).toBeInTheDocument();
  });
});
