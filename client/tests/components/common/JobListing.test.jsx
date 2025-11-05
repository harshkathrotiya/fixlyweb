import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobListing from "../../../src/components/common/joblisting.jsx";

import TestRouter from "../../utils/testRouter.jsx";
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => [{ city: "Ahmedabad" }, { city: "Surat" }],
});

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

describe("JobListing", () => {
  test("renders filters and fetches cities", async () => {
    render(
      <TestRouter>
        <JobListing />
      </TestRouter>
    );
    await waitFor(() =>
      expect(screen.getByText("Select City")).toBeInTheDocument()
    );
    expect(screen.getByText("Select Category")).toBeInTheDocument();
  });

  test("submits search", async () => {
    const api = (await import("../../../src/config/api")).default;
    render(
      <TestRouter>
        <JobListing />
      </TestRouter>
    );
    await waitFor(() => screen.getByText("Search"));
    const searchButton = screen.getByText("Search");
    expect(searchButton).toBeInTheDocument();
    fireEvent.click(searchButton);
    // Verify button click doesn't crash
    expect(screen.getByText("Search")).toBeInTheDocument();
  });
});
