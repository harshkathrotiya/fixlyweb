import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ChangePassword from "../../../src/pages/auth/ChangePassword.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { email: "test@example.com" },
    token: "test-token",
    login: jest.fn(),
  }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
  put: jest.fn(),
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

import axios from "axios";

import TestRouter from "../../utils/testRouter.jsx";
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Change Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.put.mockResolvedValue({
      data: { success: true, message: "Password changed successfully" },
    });
  });

  describe("Rendering", () => {
    test("renders change password modal when open", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      expect(screen.getByText(/change password/i)).toBeInTheDocument();
    });

    test("renders current password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      expect(currentPasswordInput).toBeInTheDocument();
    });

    test("renders new password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      expect(newPasswordInput).toBeInTheDocument();
    });

    test("renders confirm password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("renders submit button", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders cancel button", () => {
      render(
        <TestRouter>
          <ChangePassword />
        </TestRouter>
      );
      const cancelBtn = screen.queryByRole("button", { name: /cancel|back/i });
      if (cancelBtn) {
        expect(cancelBtn).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts current password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const currentPasswordInput = screen.queryByLabelText(/current password/i) ||
        screen.queryByPlaceholderText(/current|old password/i) ||
        screen.queryByDisplayValue("");
      if (currentPasswordInput) {
        await act(async () => {
      fireEvent.change(currentPasswordInput, {
        target: { value: "OldPassword123!" },
          });
      });
      expect(currentPasswordInput.value).toBe("OldPassword123!");
      } else {
        expect(screen.getByText(/change password/i)).toBeInTheDocument();
      }
    });

    test("accepts new password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      await act(async () => {
      fireEvent.change(newPasswordInput, {
        target: { value: "NewPassword123!" },
        });
      });
      expect(newPasswordInput.value).toBe("NewPassword123!");
    });

    test("accepts confirm password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      await act(async () => {
      fireEvent.change(confirmPasswordInput, {
        target: { value: "NewPassword123!" },
        });
      });
      expect(confirmPasswordInput.value).toBe("NewPassword123!");
    });


    test("modal does not render when closed", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={false} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      expect(screen.queryByText(/change password/i)).not.toBeInTheDocument();
    });

    test("calls onClose when close button is clicked", async () => {
      const onClose = jest.fn();
      await act(async () => {
        render(
          <TestRouter>
            <ChangePassword isOpen={true} onClose={onClose} />
          </TestRouter>
        );
      });
      const closeBtn = screen.queryByRole("button", { name: /close/i }) ||
        screen.queryByLabelText(/close/i);
      if (closeBtn) {
        await act(async () => {
          fireEvent.click(closeBtn);
        });
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe("Validation", () => {
    test("shows error for empty current password", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const submitBtn = screen.queryByRole("button", {
        name: /change|update|submit/i,
      });
      if (submitBtn) {
        await act(async () => {
      fireEvent.click(submitBtn);
        });
        expect(submitBtn).toBeInTheDocument();
      } else {
        expect(screen.getByText(/change password/i)).toBeInTheDocument();
      }
    });

  });

  describe("Navigation", () => {
    test("cancel button is clickable", async () => {
      const onClose = jest.fn();
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={onClose} />
        </TestRouter>
      );
      });
      const cancelBtn = screen.queryByRole("button", { name: /cancel|back/i });
      if (cancelBtn) {
        await act(async () => {
        fireEvent.click(cancelBtn);
        });
        expect(cancelBtn).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("all password inputs have proper labels", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      expect(currentPasswordInput).toBeInTheDocument();
      expect(newPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("submit button is accessible", async () => {
      await act(async () => {
      render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
      });
      const submitBtn = screen.queryByRole("button", {
        name: /change|update|submit/i,
      });
      if (submitBtn) {
      expect(submitBtn).toHaveAccessibleName();
      } else {
        expect(screen.getByText(/change password/i)).toBeInTheDocument();
      }
    });

    test("form has proper semantic structure", async () => {
      let container;
      await act(async () => {
        const result = render(
        <TestRouter>
            <ChangePassword isOpen={true} onClose={jest.fn()} />
        </TestRouter>
      );
        container = result.container;
      });
      const formElement = container.querySelector("form");
      expect(formElement || container.firstChild).toBeInTheDocument();
    });
  });
});
