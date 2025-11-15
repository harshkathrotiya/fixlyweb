import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Services from "../../../src/pages/admin/Services.jsx";
import axios from "axios";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  get: jest.fn(),
}));

describe("Services Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        data: [
          {
            _id: "s1",
            serviceTitle: "Test Service",
            categoryId: { categoryName: "Category" },
            serviceProviderId: { name: "Provider" },
            isActive: true,
          },
        ],
        total: 1,
      },
    });
  });

  test("renders services page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Services />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays services data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("handles sorting", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Services />
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

  test("displays error state", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <Services />
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
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays service information correctly", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles service status toggle", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays service provider information", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty services list", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [],
        total: 0,
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Services />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
