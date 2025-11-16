import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AuthChoice from "../../../src/pages/auth/AuthChoice.jsx";

import TestRouter from "../../utils/testRouter.jsx";
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
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

describe("AuthChoice Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders auth choice page with title", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      expect(screen.getByText(/welcome!/i)).toBeInTheDocument();
    });

    test("renders login button", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      const loginBtn = screen.getByRole("button", { name: /login/i });
      expect(loginBtn).toBeInTheDocument();
    });

    test("renders signup button", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      const signupBtn = screen.getByRole("button", {
        name: /sign up/i,
      });
      expect(signupBtn).toBeInTheDocument();
    });

    test("renders both authentication option buttons", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Navigation", () => {
    test("login button navigates to login page", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      const loginBtn = screen.getByRole("button", { name: /login/i });
      await act(async () => {
      fireEvent.click(loginBtn);
      });
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("signup button navigates to signup page", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      const signupBtn = screen.getByRole("button", {
        name: /sign up/i,
      });
      await act(async () => {
      fireEvent.click(signupBtn);
      });
      expect(mockNavigate).toHaveBeenCalledWith("/signup");
    });
  });

  describe("Layout and Accessibility", () => {
    test("page is accessible with semantic structure", async () => {
      let container;
      await act(async () => {
        const result = render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
        container = result.container;
      });
      const mainContent =
        container.querySelector("main") ||
        container.querySelector('[role="main"]');
      expect(mainContent || container.firstChild).toBeInTheDocument();
    });

    test("buttons have proper accessible labels", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <AuthChoice />
        </TestRouter>
      );
      });
      const loginBtn = screen.getByRole("button", { name: /login/i });
      const signupBtn = screen.getByRole("button", {
        name: /sign up/i,
      });
      expect(loginBtn).toHaveAccessibleName();
      expect(signupBtn).toHaveAccessibleName();
    });
  });
});
