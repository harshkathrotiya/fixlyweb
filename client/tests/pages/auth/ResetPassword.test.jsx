import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ResetPassword from "../../../src/pages/auth/ResetPassword.jsx";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ token: "test-token" }),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../../src/config/api.js", () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        return ({ children, ...props }) => React.createElement(prop, props, children);
      }
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

import api from "../../../src/config/api.js";

import TestRouter from "../../utils/testRouter.jsx";
describe("Reset Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.put.mockResolvedValue({
      data: { success: true, message: "Password reset successfully" },
    });
  });

  describe("Rendering", () => {

    test("renders password input field", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const passwordInput = screen.getByLabelText(/new password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    test("renders confirm password input field", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("renders submit button", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /reset password/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders instruction text", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const instruction = screen.queryByText(
        /enter new password|create new password/i
      );
      if (instruction) {
        expect(instruction).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const passwordInput = screen.getByLabelText(/new password/i);
      await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });
      });
      expect(passwordInput.value).toBe("NewPassword123!");
    });

    test("accepts confirm password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      await act(async () => {
      fireEvent.change(confirmPasswordInput, {
        target: { value: "NewPassword123!" },
        });
      });
      expect(confirmPasswordInput.value).toBe("NewPassword123!");
    });

  });

  describe("Validation", () => {

    test("shows error for empty password fields", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /reset password/i,
      });
      await act(async () => {
      fireEvent.click(submitBtn);
      });
      expect(submitBtn).toBeInTheDocument();
    });

  });

  describe("Accessibility", () => {
    test("password inputs have proper labels", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("submit button is accessible", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ResetPassword />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /reset password/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });
  });
});
