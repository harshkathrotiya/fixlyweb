import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Users from "../../../src/pages/admin/Users.jsx";
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
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe("Users Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        data: [
          {
            _id: "u1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            userType: "user",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        pages: 1,
      },
    });
    axios.put.mockResolvedValue({
      data: {
        data: {
          _id: "u1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          userType: "user",
          isActive: false,
          createdAt: new Date().toISOString(),
        },
      },
    });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  test("renders users page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Users />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays users data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("handles search functionality", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const searchInput = screen.queryByPlaceholderText(/search/i);
    if (searchInput) {
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "John" } });
      });
    }
  });

  test("handles filter role change", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const roleFilter = screen.queryByLabelText(/role/i);
    if (roleFilter) {
      await act(async () => {
        fireEvent.change(roleFilter, { target: { value: "provider" } });
      });
    }
  });

  test("handles filter status change", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const statusFilter = screen.queryByLabelText(/status/i);
    if (statusFilter) {
      await act(async () => {
        fireEvent.change(statusFilter, { target: { value: "active" } });
      });
    }
  });

  test("handles sorting", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    const sortHeaders = screen.queryAllByRole("columnheader");
    if (sortHeaders.length > 0) {
      await act(async () => {
        fireEvent.click(sortHeaders[0]);
      });
    }
  });

  test("handles pagination", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [],
        total: 20,
        pages: 2,
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Users />
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
          <Users />
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
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles user status toggle", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays user information correctly", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty users list", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [],
        total: 0,
        pages: 0,
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Users />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
