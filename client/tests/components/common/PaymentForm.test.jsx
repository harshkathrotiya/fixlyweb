import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import PaymentForm from "../../../src/components/common/PaymentForm.jsx";

import TestRouter from "../../utils/testRouter.jsx";
jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        data: {
          bookingStatus: "Pending",
          serviceListingId: { serviceTitle: "Svc" },
          serviceProviderId: { userId: { firstName: "A", lastName: "B" } },
          serviceDateTime: new Date().toISOString(),
          totalAmount: 100,
        },
      },
    }),
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ bookingId: "b1" }),
}));

describe("PaymentForm", () => {
  test("processes credit card payment", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <PaymentForm />
        </TestRouter>
      );
    });
    await waitFor(() => screen.getByText("Payment Details"));
    await act(async () => {
      const paymentMethodSelect = screen.getByText(/Payment Method:/i).closest("div").querySelector("select");
      fireEvent.change(paymentMethodSelect, {
        target: { value: "Credit Card" },
      });
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Card Number:/i)).toBeInTheDocument();
    });
    await act(async () => {
      const cardNumber = screen.getByLabelText(/Card Number:/i);
      fireEvent.change(cardNumber, {
        target: { value: "1234" },
      });
      const cardName = screen.getByLabelText(/Cardholder Name:/i);
      fireEvent.change(cardName, {
        target: { value: "John" },
      });
      const expiryDate = screen.getByLabelText(/Expiry Date:/i);
      fireEvent.change(expiryDate, {
        target: { value: "12/30" },
      });
      const cvv = screen.getByLabelText(/CVV:/i);
      fireEvent.change(cvv, {
        target: { value: "123" },
      });
      const payButton = screen.getByRole("button", { name: /Pay/i });
      fireEvent.click(payButton);
    });
    const api = (await import("../../../src/config/api")).default;
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/api/payments",
        expect.objectContaining({
          bookingId: "b1",
          paymentMethod: "Credit Card",
        })
      );
    });
  });
});
