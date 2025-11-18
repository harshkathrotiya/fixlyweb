import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
  get: jest.fn(),
  put: jest.fn(),
  },
}));

const api = require("../../../src/config/api");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const { useParams, useNavigate } = require("react-router-dom");

import BookingDetails from "../../../src/pages/user/BookingDetails";

import TestRouter from "../../utils/testRouter.jsx";
describe("BookingDetails page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useParams.mockReturnValue({ id: "b1" });
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("loads booking and navigates back", async () => {
    const booking = {
      _id: "booking1234567890",
      serviceDateTime: new Date().toISOString(),
      bookingStatus: "Pending",
      totalAmount: 500,
      serviceListingId: {
        serviceTitle: "Cleaning",
        categoryId: { categoryName: "Home" },
        serviceLocation: "City",
      },
      customerId: {
        firstName: "Jane",
        lastName: "Smith",
        phone: "999",
        email: "jane@example.com",
      },
    };

    api.default.get.mockResolvedValue({ data: { data: booking } });

    await act(async () => {
      render(
        <TestRouter>
          <BookingDetails />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/Booking Details/i)).toBeInTheDocument()
    );

    // Booking ID shown (last 8 chars)
    expect(screen.getByText(/Booking ID:/i)).toBeInTheDocument();

    await act(async () => {
    const backButton = screen.getByText(/Back to Bookings/i);
    fireEvent.click(backButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/bookings");
  });

  test("renders booking details page without crashing", async () => {
    const booking = {
      _id: "booking1234567890",
      serviceDateTime: new Date().toISOString(),
      bookingStatus: "Pending",
      totalAmount: 500,
      serviceListingId: {
        serviceTitle: "Cleaning",
        categoryId: { categoryName: "Home" },
        serviceLocation: "City",
      },
      customerId: {
        firstName: "Jane",
        lastName: "Smith",
        phone: "999",
        email: "jane@example.com",
      },
    };

    api.default.get.mockResolvedValue({ data: { data: booking } });

    await act(async () => {
      render(
        <TestRouter>
          <BookingDetails />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/Booking Details/i)).toBeInTheDocument()
    );
  });
});
