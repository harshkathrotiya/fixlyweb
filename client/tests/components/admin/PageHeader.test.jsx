import React from "react";
import { render, screen } from "@testing-library/react";
import PageHeader from "../../../src/components/admin/shared/PageHeader.jsx";

jest.mock("../../../src/components/admin/shared/Breadcrumbs.jsx", () => {
  return function MockBreadcrumbs() {
    return <div>Crumbs</div>;
  };
});

describe("PageHeader Component", () => {
  test("renders title, subtitle and actions", () => {
    render(
      <PageHeader
        title="T"
        subtitle="S"
        actions={<button>A</button>}
        icon="home"
      />
    );
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  test("shows breadcrumbs by default", () => {
    render(<PageHeader title="T" />);
    expect(screen.getByText("Crumbs")).toBeInTheDocument();
  });

  test("hides breadcrumbs when disabled", () => {
    render(<PageHeader title="T" showBreadcrumbs={false} />);
    expect(screen.queryByText("Crumbs")).toBeNull();
  });

  test("renders without crashing with default props", () => {
    const { container } = render(<PageHeader title="Title" />);
    expect(container).toBeTruthy();
  });
});
