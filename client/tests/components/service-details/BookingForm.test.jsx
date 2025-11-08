import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BookingForm from "../../../src/components/service-details/BookingForm.jsx";

describe("BookingForm", () => {
  const provider = { userId: { firstName: "John", lastName: "Doe" } };
  const baseDetails = { date: "2025-12-01", time: "10:30", notes: "Note" };

  test("renders title, summary and close button", () => {
    const onClose = jest.fn();
    render(
      <BookingForm
        bookingDetails={baseDetails}
        onBookingDetailsChange={jest.fn()}
        onSubmit={jest.fn()}
        onClose={onClose}
        title="Service X"
        provider={provider}
        servicePrice={500}
      />
    );
    expect(screen.getByText(/Book "Service X"/)).toBeInTheDocument();
    expect(screen.getByText("Service:")).toBeInTheDocument();
    expect(screen.getByText("Provider:")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close booking form"));
    expect(onClose).toHaveBeenCalled();
  });

  test("date input has min set to today", () => {
    render(
      <BookingForm
        bookingDetails={baseDetails}
        onBookingDetailsChange={jest.fn()}
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="Service X"
        provider={provider}
        servicePrice={500}
      />
    );
    const min = new Date().toISOString().split("T")[0];
    expect(screen.getByLabelText("Preferred Date")).toHaveAttribute("min", min);
  });

  test("submits form", () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <BookingForm
        bookingDetails={baseDetails}
        onBookingDetailsChange={jest.fn()}
        onSubmit={onSubmit}
        onClose={jest.fn()}
        title="Service X"
        provider={provider}
        servicePrice={500}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  test("shows error message when provided", () => {
    render(
      <BookingForm
        bookingDetails={baseDetails}
        onBookingDetailsChange={jest.fn()}
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="Service X"
        provider={provider}
        servicePrice={500}
        bookingError="Invalid"
      />
    );
    expect(screen.getByText("Invalid")).toBeInTheDocument();
  });

  test("calls onBookingDetailsChange when editing fields", () => {
    const onChange = jest.fn();
    render(
      <BookingForm
        bookingDetails={baseDetails}
        onBookingDetailsChange={onChange}
        onSubmit={jest.fn()}
        onClose={jest.fn()}
        title="Service X"
        provider={provider}
        servicePrice={500}
      />
    );
    fireEvent.change(screen.getByLabelText("Preferred Date"), {
      target: { value: "2025-12-02" },
    });
    fireEvent.change(screen.getByLabelText("Preferred Time"), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText("Additional Notes"), {
      target: { value: "New" },
    });
    expect(onChange).toHaveBeenCalled();
  });
});
