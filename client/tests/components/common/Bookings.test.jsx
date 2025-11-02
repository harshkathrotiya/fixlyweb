import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Bookings from "../../../src/components/common/Bookings.jsx";
import api from "../../../src/config/api";
import TestRouter from "../../utils/testRouter.jsx";

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "t", user: { id: "u" } }),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    put: jest.fn().mockResolvedValue({}),
  },
}));

describe("Bookings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [] } });
    api.put.mockResolvedValue({});
  });

  test("shows tabs and empty state", async () => {
    await act(async () => {
      render(
      <TestRouter>
        <Bookings />
      </TestRouter>
      );
    });
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No upcoming bookings/)).toBeInTheDocument();
    });
  });

  test("switches to past tab", async () => {
    await act(async () => {
      render(
      <TestRouter>
        <Bookings />
      </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/No upcoming bookings/)).toBeInTheDocument();
    });
    const pastTab = screen.getByText("Past");
    await act(async () => {
      fireEvent.click(pastTab);
    });
    await waitFor(() => {
      expect(screen.getByText(/No past bookings/)).toBeInTheDocument();
    });
  });

  test("displays loading state", async () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    await act(async () => {
      render(
      <TestRouter>
        <Bookings />
      </TestRouter>
      );
    });
    expect(screen.getByText("Loading bookings...")).toBeInTheDocument();
  });

  test("displays error message on API failure", async () => {
    api.get.mockRejectedValue(new Error("API Error"));
    await act(async () => {
      render(
      <TestRouter>
        <Bookings />
      </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load bookings/)).toBeInTheDocument();
    });
  });

  test("displays bookings with data", async () => {
    const mockBookings = [
      {
        _id: "b1",
        serviceListingId: { serviceTitle: "Test Service" },
        serviceProviderId: { userId: { firstName: "John", lastName: "Doe" } },
        bookingStatus: "Pending",
        serviceDateTime: new Date(Date.now() + 86400000).toISOString(),
        serviceLocation: "Test Location",
        totalAmount: 100,
      },
    ];
    api.get.mockResolvedValue({ data: { data: mockBookings } });
    await act(async () => {
      render(
      <TestRouter>
        <Bookings />
      </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Test Service")).toBeInTheDocument();
    });
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  test("cancels booking successfully", async () => {
    window.confirm = jest.fn(() => true);
    const mockBookings = [
      {
        _id: "b1",
        serviceListingId: { serviceTitle: "Test Service" },
        serviceProviderId: { userId: { firstName: "John", lastName: "Doe" } },
        bookingStatus: "Pending",
        serviceDateTime: new Date(Date.now() + 86400000).toISOString(),
        serviceLocation: "Test Location",
        totalAmount: 100,
      },
    ];
    api.get.mockResolvedValue({ data: { data: mockBookings } });
    await act(async () => {
      render(
      <TestRouter>
        <Bookings />
      </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Test Service")).toBeInTheDocument();
    });
    const cancelButton = screen.getByText("Cancel Booking");
    await act(async () => {
      fireEvent.click(cancelButton);
    });
    expect(window.confirm).toHaveBeenCalled();
    expect(api.put).toHaveBeenCalledWith("/api/bookings/b1/cancel");
  });
});
