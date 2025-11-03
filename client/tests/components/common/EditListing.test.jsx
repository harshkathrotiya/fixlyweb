import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import EditListing from "../../../src/components/common/EditListing.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      data: {
        serviceTitle: "T",
        servicePrice: 10,
        serviceDetails: "D",
        tags: ["a", "b"],
        isActive: true,
      },
    },
  }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

jest
  .spyOn(Storage.prototype, "getItem")
  .mockImplementation((key) => (key === "authToken" ? "t" : null));

describe("EditListing", () => {
  test("loads listing and updates", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <EditListing />
        </TestRouter>
      );
    });
    await waitFor(() => screen.getByText("Edit Service Listing"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Update Listing/i }));
    });
    const axios = (await import("axios")).default;
    expect(axios.put).toHaveBeenCalled();
  });
});
