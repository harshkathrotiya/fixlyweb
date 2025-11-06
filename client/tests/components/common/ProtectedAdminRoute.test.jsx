import React from "react";
import { render, screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "../../../src/components/common/ProtectedAdminRoute.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: () => true, isAdmin: () => true }),
}));

describe("ProtectedAdminRoute", () => {
  test("renders children for admin", () => {
    render(
      <TestRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <div>Secret</div>
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </TestRouter>
    );
    expect(screen.getByText("Secret")).toBeInTheDocument();
  });

  test("renders without crashing", () => {
    const { container } = render(
      <TestRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <div>Secret</div>
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </TestRouter>
    );
    expect(container).toBeTruthy();
  });
});
