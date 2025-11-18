import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("../../../src/utils/cloudinary", () => ({
  uploadToCloudinary: jest
    .fn()
    .mockResolvedValue("https://example.com/image.jpg"),
}));

const api = require("../../../src/config/api");

const mockNavigate = jest.fn();
const mockLogout = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const { useNavigate } = require("react-router-dom");
const { useAuth } = require("../../../src/context/AuthContext.jsx");

import UserProfile from "../../../src/pages/user/UserProfile";

import TestRouter from "../../utils/testRouter.jsx";
describe("UserProfile page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({
      user: { id: "u1" },
      token: "t",
      logout: mockLogout,
    });
  });

  test("fetches and displays user profile data", async () => {
    api.default.getCurrentUser.mockResolvedValue({
      data: {
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          profilePicture: "",
        },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <UserProfile />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/My Profile/i)).toBeInTheDocument()
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    expect(firstNameInput.value).toBe("John");
  });

  test("renders user profile page without crashing", async () => {
    api.default.getCurrentUser.mockResolvedValue({
      data: {
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "1234567890",
          profilePicture: "",
        },
      },
    });

    await act(async () => {
      render(
        <TestRouter>
          <UserProfile />
        </TestRouter>
      );
    });

    await waitFor(() =>
      expect(screen.getByText(/My Profile/i)).toBeInTheDocument()
    );
  });
});
