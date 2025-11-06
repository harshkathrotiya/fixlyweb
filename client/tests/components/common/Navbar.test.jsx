import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../../../src/components/common/Navbar.jsx";
import TestRouter from "../../utils/testRouter.jsx";

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { userType: "admin" },
    logout: jest.fn(),
    isAuthenticated: () => true,
  }),
}));

describe("Navbar", () => {
  test("renders brand and links", () => {
    render(
      <TestRouter>
        <Navbar />
      </TestRouter>
    );
    expect(screen.getByText("Fixly")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

});
