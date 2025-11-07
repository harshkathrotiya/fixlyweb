import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Tasker from "../../../src/components/common/tasker.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/components/common/Navbar.jsx", () => {
  return function MockNavbar() {
    return <div>Navbar</div>;
  };
});

jest.mock("../../../src/utils/cloudinary", () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue("https://cloudinary.com/image.jpg"),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        data: [
          { _id: "cat1", categoryName: "Plumbing" },
          { _id: "cat2", categoryName: "Cleaning" },
        ],
      },
    }),
    post: jest.fn().mockResolvedValue({
      data: { success: true, message: "Registration successful" },
    }),
  },
}));

describe("Tasker Component", () => {
  test("renders registration form", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Tasker />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Become a Service Provider")).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });
  });

  test("renders all form sections", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Tasker />
        </TestRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Service Details")).toBeInTheDocument();
      expect(screen.getByText("Address Information")).toBeInTheDocument();
      expect(screen.getByText("Bank Details")).toBeInTheDocument();
    });
  });

  test("validates image file type", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Tasker />
        </TestRouter>
      );
    });
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      const badFile = new File(["x"], "test.txt", { type: "text/plain" });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
    });
    await waitFor(() => {
      expect(screen.getByText(/Please upload a valid image file/)).toBeInTheDocument();
    });
  });

  test("validates image file size", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Tasker />
        </TestRouter>
      );
    });
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(largeFile, "size", { value: 3 * 1024 * 1024 });
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
    });
    await waitFor(() => {
      expect(screen.getByText(/Image size should not exceed 2MB/)).toBeInTheDocument();
    });
  });

  test("submits form with valid data", async () => {
    const api = (await import("../../../src/config/api")).default;
    await act(async () => {
      render(
        <TestRouter>
          <Tasker />
        </TestRouter>
      );
    });
    await waitFor(() => screen.getByText("Register as Service Provider"));
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByLabelText(/Last Name/i), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), {
        target: { value: "1234567890" },
      });
      fireEvent.change(screen.getByLabelText(/Service Category/i), {
        target: { value: "cat1" },
      });
      fireEvent.change(screen.getByLabelText(/Service Description/i), {
        target: { value: "Test description" },
      });
      fireEvent.change(screen.getByLabelText(/Experience/i), {
        target: { value: "5" },
      });
      fireEvent.change(screen.getByLabelText(/Qualifications/i), {
        target: { value: "Degree" },
      });
      fireEvent.change(screen.getByLabelText(/Certifications/i), {
        target: { value: "Cert" },
      });
      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: "123 Street" },
      });
      fireEvent.change(screen.getByLabelText(/City/i), {
        target: { value: "City" },
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: "State" },
      });
      fireEvent.change(screen.getByLabelText(/ZIP Code/i), {
        target: { value: "12345" },
      });
      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: "Country" },
      });
      fireEvent.change(screen.getByLabelText(/Account Holder Name/i), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByLabelText(/Account Number/i), {
        target: { value: "123456" },
      });
      fireEvent.change(screen.getByLabelText(/Bank Name/i), {
        target: { value: "Bank" },
      });
      fireEvent.change(screen.getByLabelText(/IFSC Code/i), {
        target: { value: "IFSC123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Register as Service Provider/i }));
    });
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/api/providers/register",
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        })
      );
    });
  });

  test("renders without crashing", async () => {
    await act(async () => {
      const { container } = render(
        <TestRouter>
          <Tasker />
        </TestRouter>
      );
      expect(container).toBeTruthy();
    });
  });
});

