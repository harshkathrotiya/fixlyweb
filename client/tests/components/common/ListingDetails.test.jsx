import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ListingDetails from "../../../src/components/common/ListingDetails.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        data: {
          _id: "l1",
          serviceTitle: "Svc",
          servicePrice: 10,
          serviceDetails: "Desc",
          tags: ["a"],
          isActive: true,
        },
      },
    }),
  },
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "l1" }),
}));

describe("ListingDetails", () => {
  test("renders details after load", async () => {
    render(
      <TestRouter>
        <ListingDetails />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Listing Details/)).toBeInTheDocument();
      expect(screen.getByText("Svc")).toBeInTheDocument();
    });
  });
});
