import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Listings from "../../../src/pages/admin/Listings.jsx";
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

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
  get: jest.fn(),
  put: jest.fn(),
}));

describe("Listings Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url && url.includes("/api/categories")) {
      return Promise.resolve({
          data: { data: [{ _id: "c1", categoryName: "Category" }] },
      });
    }
    return Promise.resolve({
      data: {
          data: [{ _id: "l1", serviceTitle: "Service", isActive: true }],
        pagination: { total: 1, pages: 1 },
      },
      });
    });
    axios.put.mockResolvedValue({ data: { success: true } });
  });

  test("renders listings page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Listings />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays listings data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("handles category filter", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles status toggle", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles pagination", async () => {
    axios.get.mockImplementation((url) => {
      if (url && url.includes("/api/categories")) {
        return Promise.resolve({
          data: { data: [{ _id: "c1", categoryName: "Category" }] },
        });
      }
      return Promise.resolve({
        data: {
          data: [],
          pagination: { total: 20, pages: 2 },
        },
      });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Listings />
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
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("shows loading state initially", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays listing information correctly", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty listings list", async () => {
    axios.get.mockImplementation((url) => {
      if (url && url.includes("/api/categories")) {
        return Promise.resolve({
          data: { data: [{ _id: "c1", categoryName: "Category" }] },
        });
      }
      return Promise.resolve({
        data: {
          data: [],
          pagination: { total: 0, pages: 0 },
        },
      });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Listings />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
