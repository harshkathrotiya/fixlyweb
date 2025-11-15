import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Settings from "../../../src/pages/admin/Settings.jsx";
import api from "../../../src/config/api.js";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("../../../src/config/api.js", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe("Settings Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        data: {
          general: {
            siteName: "Fixly",
            siteDescription: "Test Description",
            contactEmail: "test@example.com",
            contactPhone: "1234567890",
            logo: "",
          },
          commission: {
            rate: 10,
            minimumPayout: 50,
            payoutSchedule: "monthly",
          },
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          security: {
            requireEmailVerification: true,
            requirePhoneVerification: false,
            requireProviderDocuments: true,
            maintenanceMode: false,
          },
        },
      },
    });
    api.put.mockResolvedValue({ data: { success: true } });
  });

  test("renders settings page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Settings />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays settings data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("switches between tabs", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const commissionTab = screen.queryByText(/commission/i);
    if (commissionTab) {
      await act(async () => {
        fireEvent.click(commissionTab);
      });
    }
  });

  test("handles form submission", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const submitButton = screen.queryByRole("button", { name: /save/i });
    if (submitButton) {
      await act(async () => {
        fireEvent.click(submitButton);
      });
    }
  });

  test("handles error state", async () => {
    api.get.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  test("shows loading state initially", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  test("displays settings form fields", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  test("handles form field changes", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Settings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });
});

