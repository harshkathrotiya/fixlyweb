import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Appointments from "../../../src/components/common/appointments.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

describe("Appointments", () => {
  test("renders title and empty state initially", async () => {
    render(
      <TestRouter>
        <Appointments />
      </TestRouter>
    );
    expect(screen.getByText("Your Appointments")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("No appointments found")).toBeInTheDocument();
    });
  });

  test("renders list items when API returns data", async () => {
    const api = (await import("../../../src/config/api")).default;
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            _id: "1",
            serviceDateTime: new Date().toISOString(),
            customerId: { firstName: "John", lastName: "Doe" },
            totalAmount: 100,
            serviceListingId: { serviceTitle: "Cleaning" },
          },
        ],
      },
    });
    render(
      <TestRouter>
        <Appointments />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Cleaning/)).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });
  });
});
