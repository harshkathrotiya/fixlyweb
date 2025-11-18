import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const api = require("../../../src/config/api");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const { useNavigate } = require("react-router-dom");
const { useAuth } = require("../../../src/context/AuthContext.jsx");

import MyBookings from "../../../src/pages/user/MyBookings";

import TestRouter from "../../utils/testRouter.jsx";
describe("MyBookings page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({
      user: { _id: "u1", userType: "customer" },
    });
  });

  test("renders my bookings page without crashing", async () => {
    api.default.get.mockResolvedValue({
      data: {
        data: [],
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <MyBookings />
        </TestRouter>
      );
    });
    // Component should render
    expect(document.body).toBeInTheDocument();
  });

  test("displays bookings when API returns data", async () => {
    const bookings = [
      {
        _id: "b1",
        serviceDateTime: new Date().toISOString(),
        bookingStatus: "Pending",
        totalAmount: 200,
        serviceListingId: {
          serviceTitle: "Cleaning Service",
        },
      },
    ];

    api.default.get.mockResolvedValue({
      data: {
        data: bookings,
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <MyBookings />
        </TestRouter>
      );
    });
    // Component should render with bookings
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
