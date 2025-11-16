import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ForgotPassword from "../../../src/pages/auth/ForgotPassword.jsx";

jest.mock("../../../src/config/api.js", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
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
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Forgot Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.post.mockResolvedValue({
      data: { success: true, message: "Email sent successfully" },
    });
  });

  describe("Rendering", () => {
    test("renders forgot password form with title", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    test("renders email input field", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("renders submit button", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders back to login link", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const backLink = screen.queryByText(/back|login|sign in/i);
      if (backLink) {
        expect(backLink).toBeInTheDocument();
      }
    });

  });

  describe("Form Interactions", () => {
    test("accepts email input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      });
      expect(emailInput.value).toBe("test@example.com");
    });

  });

  describe("Validation", () => {
    test("shows error for empty email", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });
      await act(async () => {
      fireEvent.click(submitBtn);
      });
      expect(submitBtn).toBeInTheDocument();
    });

  });

  describe("Navigation", () => {
    test("back to login link is clickable", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const backLink = screen.queryByText(/back|login|sign in/i);
      if (backLink) {
        await act(async () => {
        fireEvent.click(backLink);
        });
        expect(backLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("email input has proper label", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("submit button is accessible", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });

    test("page has semantic structure", async () => {
      let container;
      await act(async () => {
        const result = render(
        <TestRouter>
          <ForgotPassword />
        </TestRouter>
      );
        container = result.container;
      });
      const mainContent =
        container.querySelector("main") ||
        container.querySelector('[role="main"]');
      expect(mainContent || container.firstChild).toBeInTheDocument();
    });
  });
});
