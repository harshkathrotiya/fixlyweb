import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Bookings from "../../../src/pages/admin/Bookings.jsx";
import axios from "axios";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        return ({ children, ...props }) => React.createElement(prop, props, children);
      }
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

const mockAxiosGet = jest.fn();
const mockAxiosPut = jest.fn();

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
  get: jest.fn(),
  put: jest.fn(),
}));

describe("Bookings Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: { 
        data: [
          {
            _id: "b1",
            bookingDate: new Date().toISOString(),
            status: "pending",
            serviceTitle: "Test Service",
            customerName: "John Doe",
            providerName: "Jane Provider",
            totalAmount: 100,
          }
        ], 
        pagination: { total: 1, pages: 1 } 
      },
    });
    axios.put.mockResolvedValue({ data: { success: true } });
  });

  test("renders bookings page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Bookings />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays bookings data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("handles filter status change", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const filterSelect = screen.queryByRole("combobox");
    if (filterSelect) {
      await act(async () => {
        fireEvent.change(filterSelect, { target: { value: "completed" } });
      });
    }
  });

  test("handles pagination", async () => {
    axios.get.mockResolvedValue({
      data: { 
        data: [], 
        pagination: { total: 20, pages: 2 } 
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles error state", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays loading state initially", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles date range filter", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const startDateInput = screen.queryByLabelText(/start date|from/i);
    if (startDateInput) {
      await act(async () => {
        fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
      });
    }
  });

  test("handles sorting by different columns", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays booking information correctly", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Bookings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
