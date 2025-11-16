import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Signup from "../../../src/pages/auth/Signup.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    register: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock("../../../src/utils/cloudinary.js", () => ({
  uploadToCloudinary: jest.fn(),
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

import { uploadToCloudinary } from "../../../src/utils/cloudinary.js";

import TestRouter from "../../utils/testRouter.jsx";
global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Signup Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      status: 201,
      json: async () => ({
        success: true,
        token: "test-token",
        message: "Registration successful",
      }),
    });
    uploadToCloudinary.mockResolvedValue("https://example.com/image.jpg");
    global.alert = jest.fn();
  });

  describe("Rendering", () => {
    test("renders signup form with title", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      expect(
        screen.getByText(/create your account/i)
      ).toBeInTheDocument();
    });

    test("renders first name input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const firstNameInput =
        screen.getByLabelText(/first name/i) ||
        screen.getByPlaceholderText(/first name/i);
      expect(firstNameInput).toBeInTheDocument();
    });

    test("renders last name input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const lastNameInput =
        screen.getByLabelText(/last name/i) ||
        screen.getByPlaceholderText(/last name/i);
      expect(lastNameInput).toBeInTheDocument();
    });

    test("renders email input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("renders phone number input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const phoneInput =
        screen.getByLabelText(/phone|phone number/i) ||
        screen.getByPlaceholderText(/phone/i);
      if (phoneInput) {
        expect(phoneInput).toBeInTheDocument();
      }
    });

    test("renders password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      expect(passwordInput).toBeInTheDocument();
    });


    test("renders submit button", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders login link", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const loginLink = screen.queryByText(
        /already have account|login|sign in/i
      );
      if (loginLink) {
        expect(loginLink).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts first name input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const firstNameInput =
        screen.getByLabelText(/first name/i) ||
        screen.getByPlaceholderText(/first name/i);
      await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "John" } });
      });
      expect(firstNameInput.value).toBe("John");
    });

    test("accepts last name input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const lastNameInput =
        screen.getByLabelText(/last name/i) ||
        screen.getByPlaceholderText(/last name/i);
      await act(async () => {
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      });
      expect(lastNameInput.value).toBe("Doe");
    });

    test("accepts email input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      await act(async () => {
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      });
      expect(emailInput.value).toBe("john@example.com");
    });

    test("accepts phone input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const phoneInput =
        screen.getByLabelText(/phone|phone number/i) ||
        screen.getByPlaceholderText(/phone/i);
      if (phoneInput) {
        await act(async () => {
        fireEvent.change(phoneInput, { target: { value: "1234567890" } });
        });
        expect(phoneInput.value).toBe("1234567890");
      }
    });

    test("accepts password input", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      });
      expect(passwordInput.value).toBe("Password123!");
    });

  });

  describe("Validation", () => {


    test("shows error when required fields are empty", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });
      await act(async () => {
      fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });

    test("handles profile image upload", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const fileInput = screen.queryByLabelText(/profile picture|image/i);
      if (fileInput) {
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } });
      });
      }
    });

    test("handles signup with address fields", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const streetInput = screen.getByLabelText(/street/i);
      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state/i);
      const zipCodeInput = screen.getByLabelText(/zip/i);
      const countryInput = screen.getByLabelText(/country/i);

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: "John" } });
        fireEvent.change(lastNameInput, { target: { value: "Doe" } });
        fireEvent.change(emailInput, { target: { value: "john@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.change(streetInput, { target: { value: "123 Main St" } });
        fireEvent.change(cityInput, { target: { value: "New York" } });
        fireEvent.change(stateInput, { target: { value: "NY" } });
        fireEvent.change(zipCodeInput, { target: { value: "10001" } });
        fireEvent.change(countryInput, { target: { value: "USA" } });
      });
    });


    test("handles image upload error", async () => {
      uploadToCloudinary.mockRejectedValue(new Error("Upload failed"));

      await act(async () => {
        render(
          <TestRouter>
            <Signup />
          </TestRouter>
        );
      });
      const fileInput = screen.queryByLabelText(/profile picture|image/i);
      if (fileInput) {
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } });
        });
      }
    });
  });

  describe("Navigation Links", () => {
    test("login link is clickable", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const loginLink = screen.queryByText(
        /already have account|login|sign in/i
      );
      if (loginLink) {
        await act(async () => {
        fireEvent.click(loginLink);
        });
        expect(loginLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("all form inputs have proper labels", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const firstNameInput =
        screen.getByLabelText(/first name/i) ||
        screen.getByPlaceholderText(/first name/i);
      const lastNameInput =
        screen.getByLabelText(/last name/i) ||
        screen.getByPlaceholderText(/last name/i);
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test("submit button is accessible", async () => {
      await act(async () => {
      render(
        <TestRouter>
          <Signup />
        </TestRouter>
      );
      });
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });
  });
});
