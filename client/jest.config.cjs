module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/src/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: ["**/tests/**/*.test.jsx", "**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/main.jsx", "!src/index.js"],
  moduleFileExtensions: ["js", "jsx", "json"],
  transformIgnorePatterns: [
    "node_modules/(?!(framer-motion|react-chartjs-2)/)",
  ],
};

