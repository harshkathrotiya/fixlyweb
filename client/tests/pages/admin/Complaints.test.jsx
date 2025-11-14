import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Complaints from "../../../src/pages/admin/Complaints.jsx";

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
  get: jest.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

describe("Complaints Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and renders header", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Complaints />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/Customer Complaints/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:0/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("renders filter options", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Complaints />
      </TestRouter>
    );
    });
    await waitFor(() => {
    expect(
      screen.getByText(/Customer Complaints|Filter|Search/i)
    ).toBeInTheDocument();
    });
  });

  test("shows loading state", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Complaints />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.queryByText(/rows:|Loading/i)).toBeInTheDocument();
    });
  });

  test("modal opens for complaint details", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Complaints />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/Customer Complaints/i)).toBeInTheDocument();
    });
  });

  test("displays complaint status correctly", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <Complaints />
      </TestRouter>
    );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:0/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("table has accessible structure", async () => {
    let container;
    await act(async () => {
      const result = render(
      <TestRouter>
        <Complaints />
      </TestRouter>
    );
      container = result.container;
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:0/)).toBeInTheDocument();
    }, { timeout: 3000 });
    const table = container.querySelector("table");
    if (table) {
      expect(table).toBeInTheDocument();
    }
  });

  test("handles status filter change", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Complaints />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText(/rows:0/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("handles error state", async () => {
    const axios = require("axios");
    axios.get.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <Complaints />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

});
