import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "tok" }),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest
      .fn()
      .mockResolvedValue({
        data: {
          success: true,
          data: [{ _id: "c1", categoryName: "Cleaning" }],
        },
      }),
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import AddService from "../../../src/pages/provider/AddService";

import TestRouter from "../../utils/testRouter.jsx";
describe("AddService page", () => {
  test("renders heading and loads categories", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <AddService />
        </TestRouter>
      );
    });
    expect(screen.getByText(/Add New Service/i)).toBeInTheDocument();
    // wait for the mocked categories to populate
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Cleaning/i })
      ).toBeInTheDocument()
    );
  });

  test("renders add service page without crashing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <AddService />
        </TestRouter>
      );
    });
    expect(screen.getByText(/Add New Service/i)).toBeInTheDocument();
  });

  test("displays category options after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <AddService />
        </TestRouter>
      );
    });
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /Cleaning/i })
      ).toBeInTheDocument()
    );
  });
});
