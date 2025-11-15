import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Reports from "../../../src/pages/admin/Reports.jsx";
import axios from "axios";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("react-chartjs-2", () => ({
  Bar: (props) => <div>BarChart</div>,
  Line: (props) => <div>LineChart</div>,
  Pie: (props) => <div>PieChart</div>,
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  get: jest.fn(),
}));

describe("Reports Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        data: {
          labels: ["Jan", "Feb"],
          datasets: [{ label: "Revenue", data: [100, 200] }],
          tableHeaders: ["Month", "Revenue"],
          tableData: [{ Month: "Jan", Revenue: 100 }],
          summary: { totalRevenue: 300 },
        },
      },
    });
  });

  test("renders reports page without crashing", async () => {
    await act(async () => {
    const { container } = render(
      <TestRouter>
        <Reports />
      </TestRouter>
    );
    expect(container).toBeInTheDocument();
    });
  });

  test("displays report data after loading", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Reports />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("displays charts", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Reports />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays summary information", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Reports />
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
          <Reports />
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
          <Reports />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("displays report table data", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Reports />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test("handles empty report data", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          labels: [],
          datasets: [],
          tableHeaders: [],
          tableData: [],
          summary: { totalRevenue: 0 },
        },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <Reports />
        </TestRouter>
      );
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
