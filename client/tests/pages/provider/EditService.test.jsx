import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest
      .fn()
      .mockResolvedValue({
        data: {
          data: {
            _id: "s1",
            serviceTitle: "Test Service",
            servicePrice: 100,
            serviceDetails: "Desc",
          },
        },
      }),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ serviceId: "s1" }),
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "t1" }),
}));

import EditService from "../../../src/pages/provider/EditService";

import TestRouter from "../../utils/testRouter.jsx";
describe("EditService page", () => {
  test("loads service details and displays title", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <EditService />
        </TestRouter>
      );
    });
    expect(screen.getByText(/Edit Service/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByDisplayValue("Test Service")).toBeInTheDocument()
    );
  });

  test("renders edit service page without crashing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <EditService />
        </TestRouter>
      );
    });
    expect(screen.getByText(/Edit Service/i)).toBeInTheDocument();
  });

  test("displays service information after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <EditService />
        </TestRouter>
      );
    });
    await waitFor(() =>
      expect(screen.getByDisplayValue("Test Service")).toBeInTheDocument()
    );
  });
});
