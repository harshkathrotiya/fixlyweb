import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../../../src/components/admin/shared/Modal.jsx";

describe("Modal Component", () => {
  test("renders modal when open and closes on overlay click", () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen title="Title" onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    fireEvent.mouseDown(document);
    expect(onClose).toHaveBeenCalled();
  });

  test("closes on Escape key", () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen title="Esc" onClose={onClose}>
        <div />
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("renders without crashing when not open", () => {
    const { container } = render(
      <Modal isOpen={false} title="Title" onClose={jest.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(container).toBeTruthy();
  });
});
