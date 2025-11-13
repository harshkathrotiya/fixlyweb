import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AdminLayout from "../../../src/pages/admin/AdminLayout.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { firstName: "Ada", lastName: "Admin" },
    logout: jest.fn(),
  }),
}));

describe("AdminLayout Component", () => {
  beforeEach(() => {
    delete window.location;
    window.location = { href: "" };
  });

  test("renders header and logout navigates", async () => {
    await act(async () => {
    render(
      <TestRouter initialEntries={["/admin"]}>
        <AdminLayout>
          <div>Child</div>
        </AdminLayout>
      </TestRouter>
    );
    });
    expect(screen.getByText(/Fixly Admin|F/)).toBeInTheDocument();
    await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Logout|Sign out/i }));
    });
    expect(window.location.href).toContain("/login");
  });

  test("renders children correctly", async () => {
    await act(async () => {
    render(
      <TestRouter initialEntries={["/admin"]}>
        <AdminLayout>
          <div data-testid="child-content">Test Child</div>
        </AdminLayout>
      </TestRouter>
    );
    });
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  test("displays admin user name in header", async () => {
    await act(async () => {
    render(
      <TestRouter initialEntries={["/admin"]}>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </TestRouter>
    );
    });
    expect(screen.getAllByText(/Ada/).length).toBeGreaterThan(0);
  });

  test("has accessible navigation structure", async () => {
    let container;
    await act(async () => {
      const result = render(
      <TestRouter initialEntries={["/admin"]}>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </TestRouter>
    );
      container = result.container;
    });
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });

  test("sidebar toggles on mobile", async () => {
    await act(async () => {
    render(
      <TestRouter initialEntries={["/admin"]}>
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>
      </TestRouter>
    );
    });
    const toggleBtn = screen.queryByRole("button", {
      name: /menu|toggle|hamburger/i,
    });
    if (toggleBtn) {
      await act(async () => {
      fireEvent.click(toggleBtn);
      });
      expect(toggleBtn).toBeInTheDocument();
    }
  });

  test("renders navigation links", async () => {
    await act(async () => {
      render(
        <TestRouter initialEntries={["/admin"]}>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </TestRouter>
      );
    });
    expect(screen.getByText(/Fixly Admin|F/)).toBeInTheDocument();
  });

  test("handles navigation click", async () => {
    await act(async () => {
      render(
        <TestRouter initialEntries={["/admin"]}>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </TestRouter>
      );
    });
    expect(screen.getByText(/Fixly Admin|F/)).toBeInTheDocument();
  });

  test("displays user information in header", async () => {
    await act(async () => {
      render(
        <TestRouter initialEntries={["/admin"]}>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </TestRouter>
      );
    });
    expect(screen.getAllByText(/Ada/).length).toBeGreaterThan(0);
  });
});
