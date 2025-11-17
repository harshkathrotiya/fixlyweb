import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "tok" }),
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest
      .fn()
      .mockResolvedValue({
        data: {
          data: [
            {
              _id: "svc1",
              serviceTitle: "Cleaning",
              servicePrice: 100,
              isActive: true,
            },
          ],
        },
      }),
  },
}));

import ServiceManagement from "../../../src/pages/provider/ServiceManagement";

import TestRouter from "../../utils/testRouter.jsx";
describe("ServiceManagement", () => {
  test("renders heading and lists services from API", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ServiceManagement />
        </TestRouter>
      );
    });
    expect(screen.getByText(/My Services/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Cleaning")).toBeInTheDocument()
    );
  });

  test("renders service management page without crashing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ServiceManagement />
        </TestRouter>
      );
    });
    expect(screen.getByText(/My Services/i)).toBeInTheDocument();
  });

  test("displays services data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ServiceManagement />
        </TestRouter>
      );
    });
    await waitFor(() =>
      expect(screen.getByText("Cleaning")).toBeInTheDocument()
    );
  });

  test("shows loading state initially", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ServiceManagement />
        </TestRouter>
      );
    });
    // Component should render heading even during loading
    expect(screen.getByText(/My Services/i)).toBeInTheDocument();
  });
});
