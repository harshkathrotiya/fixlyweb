import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const { useParams, useNavigate } = require("react-router-dom");

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ user: null, token: null }),
}));

Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
});

import ServiceDetails from "../../../src/pages/user/ServiceDetails";

import TestRouter from "../../utils/testRouter.jsx";
describe("ServiceDetails page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useParams.mockReturnValue({ id: "listing123" });
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders service title and navigates to login when not authenticated", async () => {
    api.default.get.mockResolvedValue({
      data: {
        data: {
          _id: "listing123",
          serviceTitle: "Test Service",
          categoryId: { _id: "c1", categoryName: "Plumbing" },
          serviceImage: "",
          images: [],
          createdAt: new Date().toISOString(),
          averageRating: 4.5,
          reviewCount: 2,
          isActive: true,
        },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <ServiceDetails />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getAllByText(/Test Service/i).length).toBeGreaterThan(0)
    );

    const bookButton = screen.getByText(/Book Now/i);
    expect(bookButton).toBeInTheDocument();

    // clicking when not logged in should navigate to /login
    await act(async () => {
      fireEvent.click(bookButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login", expect.any(Object));
  });

  test("renders service details page without crashing", async () => {
    api.default.get.mockResolvedValue({
      data: {
        data: {
          _id: "listing123",
          serviceTitle: "Test Service",
          categoryId: { _id: "c1", categoryName: "Plumbing" },
          serviceImage: "",
          images: [],
          createdAt: new Date().toISOString(),
          averageRating: 4.5,
          reviewCount: 2,
          isActive: true,
        },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <ServiceDetails />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getAllByText(/Test Service/i).length).toBeGreaterThan(0)
    );
  });
});
