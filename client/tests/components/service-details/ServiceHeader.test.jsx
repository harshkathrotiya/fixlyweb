import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ServiceHeader from "../../../src/components/service-details/ServiceHeader.jsx";

describe("ServiceHeader", () => {
  const getTimeSince = () => "2 days ago";
  const formatDate = () => "Date";

  test("renders title, category, time and rating", () => {
    render(
      <ServiceHeader
        title="Cleaning"
        categoryName="Home"
        createdAt={new Date().toISOString()}
        averageRating={4.3}
        reviewCount={5}
        isActive
        getTimeSince={getTimeSince}
        formatDate={formatDate}
        onShare={jest.fn()}
      />
    );
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText(/Listed 2 days ago/)).toBeInTheDocument();
    expect(screen.getByText("4.3")).toBeInTheDocument();
    expect(screen.getByText("(5 reviews)")).toBeInTheDocument();
    expect(screen.getByText("Available Now")).toBeInTheDocument();
  });

  test("calls onShare when share button clicked", () => {
    const onShare = jest.fn();
    render(
      <ServiceHeader
        title="T"
        categoryName="C"
        createdAt={new Date().toISOString()}
        averageRating={0}
        reviewCount={0}
        isActive={false}
        getTimeSince={getTimeSince}
        formatDate={formatDate}
        onShare={onShare}
      />
    );
    fireEvent.click(screen.getByLabelText("Share this service"));
    expect(onShare).toHaveBeenCalled();
  });
});
