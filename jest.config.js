// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest', // Use the ts-jest preset
  globalSetup: '<rootDir>/global-setup.ts',
  globalTeardown: '<rootDir>/global-teardown.ts',
  // Add more setup options before each test is run (runs AFTER globalSetup)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // For beforeEach hooks like clearing DB
// Configure ts-jest to use tsconfig paths for transformation
transform: {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: 'tsconfig.json', // Point to your tsconfig
      // Explicitly add paths mapping for ts-jest transformer
      paths: {
        '@/*': ['./src/*']
      }
    },
  ],
},
testEnvironment: 'node', // Use 'node' environment for backend/service tests
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
