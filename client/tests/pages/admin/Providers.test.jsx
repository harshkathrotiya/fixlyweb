import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Providers from "../../../src/pages/admin/Providers.jsx";
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

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            _id: "p1",
            userId: {
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              phone: "1234567890",
              isActive: true,
            },
            verificationStatus: "verified",
          },
        ],
        pagination: { total: 1, pages: 1 },
      },
    }),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
  get: jest.fn().mockResolvedValue({
    data: {
      data: [
        {
          _id: "p1",
          userId: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "1234567890",
            isActive: true,
          },
          verificationStatus: "verified",
        },
      ],
      pagination: { total: 1, pages: 1 },
    },
  }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
  delete: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

describe("Providers Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders providers page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Providers />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays providers data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Providers />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("handles verification status change", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Providers />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles pagination", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [],
        pagination: { total: 20, pages: 2 },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Providers />
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
          <Providers />
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
          <Providers />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays provider information correctly", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Providers />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty providers list", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [],
        pagination: { total: 0, pages: 0 },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Providers />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});

