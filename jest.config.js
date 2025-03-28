// jest.config.js
const nextJest = require('next/jest');

// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Uncomment if you have a setup file

  testEnvironment: 'node', // Use 'node' environment for backend/service tests
  moduleNameMapper: {
    // Handle module aliases (this should match the paths configuration in tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Suppress console output during test runs
  silent: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/_app.tsx", // Exclude Next.js specific files if needed
    "!src/**/_document.tsx",
    "!src/pages/api/auth/**", // Exclude auth routes if not testing directly
    // Add other exclusions as necessary
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);