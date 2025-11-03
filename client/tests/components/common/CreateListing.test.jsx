import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CreateListing from "../../../src/components/common/CreateListing.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/utils/cloudinary", () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue("http://img.url/x.jpg"),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: { post: jest.fn().mockResolvedValue({ data: { success: true } }) },
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("CreateListing", () => {
  test("shows image type error", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <CreateListing />
        </TestRouter>
      );
    });
    const fileInput = document.querySelector('input[type="file"]');
    const badFile = new File(["x"], "a.txt", { type: "text/plain" });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [badFile] } });
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Please upload a valid image file/)
      ).toBeInTheDocument();
    });
  });

  test("submits new listing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <CreateListing />
        </TestRouter>
      );
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Service Title/i), {
        target: { value: "Title" },
      });
      fireEvent.change(screen.getByLabelText(/Price/i), {
        target: { value: "10" },
      });
      fireEvent.change(screen.getByLabelText(/Service Details/i), {
        target: { value: "Details" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Listing/i }));
    });
    const api = (await import("../../../src/config/api")).default;
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/api/listings",
        expect.objectContaining({ serviceTitle: "Title" })
      );
    });
  });
});
