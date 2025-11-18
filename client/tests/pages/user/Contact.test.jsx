import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isAuthenticated: jest.fn(() => false),
  }),
}));

import Contact from "../../../src/pages/user/Contact";

import TestRouter from "../../utils/testRouter.jsx";
describe("Contact page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    window.alert.mockRestore();
  });

  test("submits contact form and shows alert", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Contact />
        </TestRouter>
      );
    });

    const name = screen.getByLabelText(/Name/i);
    const email = screen.getByLabelText(/Email/i);
    const message = screen.getByLabelText(/Message/i);
    const submit = screen.getByText(/Send Message/i);

    await act(async () => {
      fireEvent.change(name, { target: { value: "Alice" } });
      fireEvent.change(email, { target: { value: "alice@example.com" } });
      fireEvent.change(message, { target: { value: "Hello" } });
    });

    await act(async () => {
      fireEvent.click(submit);
    });

    // advance timers to run the simulated timeout in handleSubmit
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(window.alert).toHaveBeenCalled();
  });

  test("renders contact form without crashing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Contact />
        </TestRouter>
      );
    });
    expect(screen.getByText(/Send Message/i)).toBeInTheDocument();
  });

  test("displays all form fields", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Contact />
        </TestRouter>
      );
    });
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });
});
