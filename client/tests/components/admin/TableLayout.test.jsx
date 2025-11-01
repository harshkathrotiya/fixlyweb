import React from "react";
import { render, screen } from "@testing-library/react";
import TableLayout from "../../../src/components/admin/shared/TableLayout.jsx";

describe("TableLayout Component", () => {
  test("renders title, action button and children", () => {
    render(
      <TableLayout title="Users" actionButton={<button>Add</button>}>
        <div>Child</div>
      </TableLayout>
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});
