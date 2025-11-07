import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import ReviewCard from "../../../src/components/common/review.jsx";

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            customerId: { firstName: "A", lastName: "B" },
            reviewText: "Nice",
            rating: 4,
          },
        ],
      },
    }),
  },
}));

describe("ReviewCard", () => {
  test("renders fetched reviews", async () => {
    await act(async () => {
      render(<ReviewCard />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Nice/)).toBeInTheDocument();
    });
  });

  test("renders customer name from review", async () => {
    await act(async () => {
      render(<ReviewCard />);
    });
    await waitFor(() => {
      expect(screen.getByText(/A B/)).toBeInTheDocument();
    });
  });

  test("renders without crashing", async () => {
    await act(async () => {
      const { container } = render(<ReviewCard />);
      expect(container).toBeTruthy();
    });
  });
});
