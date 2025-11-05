import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "../../../src/components/common/Layout.jsx";
import TestRouter from "../../utils/testRouter.jsx";

jest.mock("../../../src/components/common/Navbar.jsx", () => {
  return function MockNavbar() {
    return <div>Navbar</div>;
  };
});

jest.mock("../../../src/components/common/Footer.jsx", () => {
  return function MockFooter() {
    return <div>Footer</div>;
  };
});

describe("Layout Component", () => {
  test("renders children", () => {
    render(
      <TestRouter>
        <Layout>
          <div>Main Content</div>
        </Layout>
      </TestRouter>
    );
    expect(screen.getByText("Main Content")).toBeInTheDocument();
  });

  test("renders navbar by default", () => {
    render(
      <TestRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestRouter>
    );
    expect(screen.getByText("Navbar")).toBeInTheDocument();
  });

  test("renders footer by default", () => {
    render(
      <TestRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestRouter>
    );
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  test("hides navbar when hideNavbar is true", () => {
    render(
      <TestRouter>
        <Layout hideNavbar>
          <div>Content</div>
        </Layout>
      </TestRouter>
    );
    expect(screen.queryByText("Navbar")).not.toBeInTheDocument();
  });

  test("hides footer when hideFooter is true", () => {
    render(
      <TestRouter>
        <Layout hideFooter>
          <div>Content</div>
        </Layout>
      </TestRouter>
    );
    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(
      <TestRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestRouter>
    );
    expect(container).toBeTruthy();
  });
});

