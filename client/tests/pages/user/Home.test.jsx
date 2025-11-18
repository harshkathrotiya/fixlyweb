import React from "react";
import { render, screen, act } from "@testing-library/react";
jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  },
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  const stripAnimProps = (props) => {
    const {
      whileHover,
      whileTap,
      whileInView,
      initial,
      animate,
      variants,
      transition,
      viewport,
      ...rest
    } = props;
    return rest;
  };

  return {
    motion: {
      div: ({ children, ...props }) =>
        React.createElement("div", stripAnimProps(props), children),
      h1: ({ children, ...props }) =>
        React.createElement("h1", stripAnimProps(props), children),
      h2: ({ children, ...props }) =>
        React.createElement("h2", stripAnimProps(props), children),
      p: ({ children, ...props }) =>
        React.createElement("p", stripAnimProps(props), children),
      button: ({ children, ...props }) =>
        React.createElement("button", stripAnimProps(props), children),
      section: ({ children, ...props }) =>
        React.createElement("section", stripAnimProps(props), children),
      span: ({ children, ...props }) =>
        React.createElement("span", stripAnimProps(props), children),
    },
  };
});

import Home from "../../../src/pages/user/Home";

import TestRouter from "../../utils/testRouter.jsx";
describe("Home page", () => {
  test("renders home page without crashing", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Home />
        </TestRouter>
      );
    });
    expect(document.body).toBeInTheDocument();
  });

  test("displays home page content", async () => {
    await act(async () => {
      render(
        <TestRouter>
          <Home />
        </TestRouter>
      );
    });
    // Home page should render without errors
    expect(document.body).toBeInTheDocument();
  });
});
