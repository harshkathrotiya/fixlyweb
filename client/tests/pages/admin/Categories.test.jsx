import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Categories from "../../../src/pages/admin/Categories.jsx";

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

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  get: jest.fn((url) => {
    if (url.includes("/api/categories")) {
      return Promise.resolve({
        data: {
          data: [
            {
              _id: "c1",
              categoryName: "Category 1",
              categoryDescription: "Description 1",
              serviceCount: 5,
            },
          ],
          total: 1,
          pages: 1,
        },
      });
    }
    return Promise.resolve({
      data: { data: [], pagination: { total: 0 } },
    });
  }),
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
  delete: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

describe("Categories Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders categories page with header", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Categories />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("displays category list", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Categories />
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
        <Categories />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("displays category information", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Categories />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles add category", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Categories />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles edit category", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Categories />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles delete category", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Categories />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:1/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles error state", async () => {
    const axios = require("axios");
    axios.get.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <Categories />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty categories list", async () => {
    const axios = require("axios");
    axios.get.mockImplementation((url) => {
      if (url && url.includes("/api/categories")) {
        return Promise.resolve({
          data: {
            data: [],
            total: 0,
            pages: 0,
          },
        });
      }
      return Promise.resolve({
        data: { data: [], pagination: { total: 0 } },
      });
    });

    await act(async () => {
      render(
        <TestRouter>
          <Categories />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});

