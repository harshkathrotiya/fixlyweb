import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ user: { _id: "u1" } }),
}));

const mockGet = jest.fn().mockResolvedValue({
  data: {
    data: [
      {
        _id: "m1",
        content: "Hello",
        senderId: "u1",
        createdAt: new Date().toISOString(),
      },
    ],
  },
});

const mockPost = jest.fn().mockResolvedValue({
  data: {
    data: {
      _id: "m2",
      content: "Hi",
      senderId: "u1",
      createdAt: new Date().toISOString(),
    },
  },
});

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        data: [
          {
            _id: "m1",
            content: "Hello",
            senderId: "u1",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    }),
    post: jest.fn().mockResolvedValue({
      data: {
        data: {
          _id: "m2",
          content: "Hi",
          senderId: "u1",
          createdAt: new Date().toISOString(),
        },
      },
    }),
  },
}));

import Messaging from "../../../src/pages/user/Messaging";

describe("Messaging", () => {
  test("loads messages and allows sending a new message", async () => {
    await act(async () => {
    render(<Messaging bookingId="b1" providerId="p1" customerId="c1" />);
    });

    await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Type your message/i);
    await act(async () => {
    fireEvent.change(input, { target: { value: "Hi" } });
    });
    const sendBtn = screen.getByRole("button", { name: /send/i });
    await act(async () => {
    fireEvent.click(sendBtn);
    });

    const api = require("../../../src/config/api");
    await waitFor(() => expect(api.default.post).toHaveBeenCalled());
  });

  test("renders messaging component without crashing", async () => {
    await act(async () => {
      render(<Messaging bookingId="b1" providerId="p1" customerId="c1" />);
    });
    await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument());
  });
});
