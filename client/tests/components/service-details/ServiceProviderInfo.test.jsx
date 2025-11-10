import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ServiceProviderInfo from "../../../src/components/service-details/ServiceProviderInfo.jsx";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("ServiceProviderInfo", () => {
  const provider = {
    _id: "p1",
    userId: { firstName: "John", lastName: "Doe", profilePicture: "" },
    verificationStatus: "verified",
    rating: 4.7,
    description: "Pro",
    contactEmail: "a@b.com",
    contactPhone: "123",
    businessName: "Biz",
  };

  test("renders provider info and actions", () => {
    const onContact = jest.fn();
    render(
      <ServiceProviderInfo provider={provider} onContactProvider={onContact} />
    );
    expect(screen.getByText(/Service Provider/)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText(/"Pro"/)).toBeInTheDocument();
    expect(screen.getByText("a@b.com")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Biz")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /View Profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/provider/profile/p1");
    const messageButton = screen.getByLabelText(/Contact/i);
    fireEvent.click(messageButton);
    expect(onContact).toHaveBeenCalled();
  });
});
