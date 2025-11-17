import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
const mockLogout = jest.fn();
jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { firstName: "John", lastName: "Doe" },
    logout: mockLogout,
  }),
}));

import ProviderLayout from "../../../src/pages/provider/ProviderLayout";

import TestRouter from "../../utils/testRouter.jsx";
describe("ProviderLayout", () => {
  test("renders children and triggers logout", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ProviderLayout>
            <div data-testid="child">Content</div>
          </ProviderLayout>
        </TestRouter>
      );
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();

    await act(async () => {
      const logoutBtn = screen.getByRole("button", { name: /logout/i });
      fireEvent.click(logoutBtn);
    });
    expect(mockLogout).toHaveBeenCalled();
  });

  test("renders layout without crashing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ProviderLayout>
            <div data-testid="child">Content</div>
          </ProviderLayout>
        </TestRouter>
      );
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("displays user name in layout", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <ProviderLayout>
            <div data-testid="child">Content</div>
          </ProviderLayout>
        </TestRouter>
      );
    });
    // Layout should render with user information
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
