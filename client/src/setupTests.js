import "@testing-library/jest-dom";

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

process.env.VITE_CLOUDINARY_UPLOAD_PRESET = "test-preset";
process.env.VITE_CLOUDINARY_CLOUD_NAME = "test-cloud";

const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = (...args) => {
  const message = args[0]?.toString() || "";

  if (message.includes("Function components cannot be given refs")) {
    return;
  }

  if (
    message.includes("Error fetching") ||
    message.includes("Error creating")
  ) {
    return;
  }

  if (
    message.includes("Uncaught [Error: boom]") ||
    message.includes("Error caught by boundary") ||
    message.includes("Error: boom")
  ) {
    return;
  }

  if (message.includes("The above error occurred in the")) {
    return;
  }

  originalError(...args);
};

console.warn = (...args) => {
  const message = args[0]?.toString() || "";

  if (message.includes("Function components cannot be given refs")) {
    return;
  }

  originalWarn(...args);
};

console.log = (...args) => {
  const message = args[0]?.toString() || "";

  if (
    message.includes("Fetching") ||
    message.includes("Fetched") ||
    message.includes("Categories response") ||
    message.includes("Bookings response") ||
    message.includes("component mounted with token") ||
    message.includes("mounted") ||
    message.includes("API Response") ||
    message.includes("API Response:") ||
    message.includes("Registration success")
  ) {
    return;
  }

  originalLog(...args);
};
