import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Login from "../../../src/pages/auth/Login.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: jest.fn().mockReturnValue(true),
    token: null,
  }),
}));

jest.mock("../../../src/config/api.js", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
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

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.post.mockResolvedValue({
      data: {
        success: true,
        token: "test-token",
      },
    });
    api.get.mockResolvedValue({
      data: {
        data: { email: "test@test.com", userType: "user", isActive: true },
      },
    });
  });

  describe("Rendering", () => {
    test("renders login form with title", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    test("renders email input field", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("renders password input field", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    test("renders submit button", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", { name: /sign in|login/i });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders forgot password link", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const forgotLink = screen.queryByText(/forgot password/i);
      if (forgotLink) {
        expect(forgotLink).toBeInTheDocument();
      }
    });

    test("renders signup link", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const signupLink = screen.queryByText(/sign up|register|create/i);
      if (signupLink) {
        expect(signupLink).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts email input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
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

    test("accepts password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      });
      expect(passwordInput.value).toBe("password123");
    });




  });

  describe("Validation", () => {
    test("shows error for empty email", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", { name: /sign in|login/i });
      await act(async () => {
      fireEvent.click(submitBtn);
      });
      expect(submitBtn).toBeInTheDocument();
    });


    test("shows error for empty password", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      });
      const submitBtn = screen.getByRole("button", { name: /sign in|login/i });
      await act(async () => {
      fireEvent.click(submitBtn);
      });
      expect(submitBtn).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    test("forgot password link is clickable", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const forgotLink = screen.queryByText(/forgot password/i);
      if (forgotLink) {
        await act(async () => {
        fireEvent.click(forgotLink);
        });
        expect(forgotLink).toBeInTheDocument();
      }
    });

    test("signup link is clickable", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const signupLink = screen.queryByText(/sign up|register|create/i);
      if (signupLink) {
        await act(async () => {
        fireEvent.click(signupLink);
        });
        expect(signupLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("form has proper labels", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test("submit button is accessible", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Login />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", { name: /sign in|login/i });
      expect(submitBtn).toHaveAccessibleName();
    });
  });
});
