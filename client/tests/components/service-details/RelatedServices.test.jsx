import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RelatedServices from "../../../src/components/service-details/RelatedServices.jsx";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("RelatedServices", () => {
  test("returns null when no services", () => {
    const { container } = render(<RelatedServices services={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders services and navigates on click", () => {
    const services = [
      {
        _id: "s1",
        serviceTitle: "A",
        servicePrice: 10,
        serviceDetails: "x",
        averageRating: 4.5,
      },
      {
        _id: "s2",
        serviceTitle: "B",
        servicePrice: 20,
        serviceDetails: "y",
        averageRating: 0,
      },
    ];
    render(<RelatedServices services={services} />);
    expect(screen.getByText("You Might Also Like")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("₹10")).toBeInTheDocument();
    fireEvent.click(
      screen.getAllByRole("button", { name: /View Details/i })[0]
    );
    expect(mockNavigate).toHaveBeenCalledWith("/listing/s1");
  });
});
