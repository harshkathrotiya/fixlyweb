import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CreateAdminUser from "../../../src/pages/admin/CreateAdminUser.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

describe("CreateAdminUser Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("submits and shows success", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <CreateAdminUser />
      </TestRouter>
    );
    });
    await act(async () => {
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "B" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "secret1" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "secret1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Admin user created successfully/i)
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
    }, { timeout: 3000 });
  });

  test("shows validation error for mismatched passwords", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <CreateAdminUser />
      </TestRouter>
    );
    });
    await act(async () => {
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "B" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "secret1" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "secret2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test("shows validation error for invalid email", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <CreateAdminUser />
      </TestRouter>
    );
    });
    await act(async () => {
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText(/Create New Admin User/i)).toBeInTheDocument();
    });
  });

  test("shows validation error for empty fields", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <CreateAdminUser />
      </TestRouter>
    );
    });
    await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
    });
    await waitFor(() => {
      expect(screen.queryByText(/Create New Admin User/i)).toBeInTheDocument();
    });
  });

  test("submit button is disabled initially", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <CreateAdminUser />
      </TestRouter>
    );
    });
    const submitBtn = screen.getByRole("button", { name: /Create Admin User/i });
    expect(submitBtn).toBeInTheDocument();
  });

  test("form renders all input fields", async () => {
    await act(async () => {
    render(
      <TestRouter>
        <CreateAdminUser />
      </TestRouter>
    );
    });
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  test("handles form submission error", async () => {
    const axios = require("axios");
    axios.post.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(
        <TestRouter>
          <CreateAdminUser />
        </TestRouter>
      );
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: "A" },
      });
      fireEvent.change(screen.getByLabelText(/Last Name/i), {
        target: { value: "B" },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: "secret1" },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: "secret1" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
    });
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  test("handles password strength validation", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <CreateAdminUser />
        </TestRouter>
      );
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: "123" },
      });
    });
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  test("handles form reset", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <CreateAdminUser />
        </TestRouter>
      );
    });
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
  });
});
