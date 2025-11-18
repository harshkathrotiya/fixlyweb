import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const api = require("../../../src/config/api");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: () => ({ search: "", pathname: "/services" }),
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ user: null, token: null }),
}));

import Services from "../../../src/pages/user/Services";

import TestRouter from "../../utils/testRouter.jsx";
describe("Services page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("renders listings when API returns data", async () => {
    const listings = [
      { _id: "l1", serviceTitle: "Fix Faucet", servicePrice: 200 },
    ];
    api.default.get.mockImplementation((url) => {
      if (url.includes("/api/categories")) {
        return Promise.resolve({
          data: { data: [{ _id: "c1", categoryName: "Plumbing" }] },
        });
      }
      if (url.includes("/api/listings")) {
        return Promise.resolve({
          data: { data: listings, pagination: { pages: 1 } },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/Fix Faucet/i)).toBeInTheDocument()
    );
  });

  test("renders services page without crashing", async () => {
    api.default.get.mockImplementation((url) => {
      if (url.includes("/api/categories")) {
        return Promise.resolve({
          data: { data: [{ _id: "c1", categoryName: "Plumbing" }] },
        });
      }
      if (url.includes("/api/listings")) {
        return Promise.resolve({
          data: { data: [], pagination: { pages: 1 } },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });
    // Component should render even with empty listings
    expect(document.body).toBeInTheDocument();
  });
});
