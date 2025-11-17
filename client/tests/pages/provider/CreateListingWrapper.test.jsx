import React from "react";
import { render, screen, act } from "@testing-library/react";

jest.mock(
  "../../../src/pages/provider/ProviderLayout",
  () =>
    ({ children }) =>
      <div data-testid="provider-layout">{children}</div>
);
jest.mock("../../../src/components/common/CreateListing", () => () => (
  <div data-testid="create-listing">CreateListing</div>
));

import CreateListingWrapper from "../../../src/pages/provider/CreateListingWrapper";

describe("CreateListingWrapper", () => {
  test("renders CreateListing inside ProviderLayout", async () => {
    await act(async () => {
      render(<CreateListingWrapper />);
    });
    expect(screen.getByTestId("provider-layout")).toBeInTheDocument();
    expect(screen.getByTestId("create-listing")).toBeInTheDocument();
  });

  test("renders wrapper without crashing", async () => {
    await act(async () => {
      render(<CreateListingWrapper />);
    });
    expect(screen.getByTestId("provider-layout")).toBeInTheDocument();
  });
});
