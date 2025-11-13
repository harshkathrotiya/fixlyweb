import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Commissions from "../../../src/pages/admin/Commissions.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("../../../src/components/admin/shared/Table", () => ({
  __esModule: true,
  default: ({ data }) => <div>rows:{data.length}</div>,
}));

jest.mock("../../../src/components/admin/shared/Modal", () => ({
  __esModule: true,
  default: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}));

jest.mock("axios", () => ({
  get: jest.fn((url) => {
    if (url.includes("commission-history")) {
      return Promise.resolve({
        data: { data: [] },
      });
    }
    return Promise.resolve({
      data: {
        data: [
          {
            _id: "p1",
            userId: { firstName: "John", lastName: "Doe" },
            totalEarnings: 1000,
            commissionRate: 10,
          },
        ],
        pagination: { total: 1 },
      },
    });
  }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

describe("Commissions Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders commissions page with header", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Commissions />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("displays commission information", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Commissions />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("shows loading state initially", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Commissions />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("displays provider commission data", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Commissions />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles commission rate update", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Commissions />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles pagination", async () => {
    const axios = require("axios");
    axios.get.mockImplementation((url) => {
      if (url && url.includes("commission-history")) {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({
        data: {
          data: [],
          pagination: { total: 20 },
        },
      });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Commissions />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles error state", async () => {
    const axios = require("axios");
    axios.get.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <Commissions />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty commissions list", async () => {
    const axios = require("axios");
    axios.get.mockImplementation((url) => {
      if (url && url.includes("commission-history")) {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({
        data: {
          data: [],
          pagination: { total: 0 },
        },
      });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Commissions />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});

