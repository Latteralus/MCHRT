# Plan: Fixing Jest Integration Test Initialization Issue (Phase 8)

## Problem Description

Integration tests (`tests/api/*.test.ts`) consistently fail with the error `Sequelize has not been initialized or set.`. This blocks progress on Phase 8 testing goals.

## Investigation Summary

Analysis of `Project.md`, Jest configuration (`jest.config.js`), setup files (`jest.setup.ts`, `tests/db-setup.ts`), database utilities (`src/db/mockDbSetup.ts`), an example test (`tests/api/documents.test.ts`), and a model file (`src/modules/documents/models/Document.ts`) confirmed the root cause:

A **race condition** exists between Jest's module loading and the asynchronous database setup performed in `jest.setup.ts`'s `beforeAll` hook. Sequelize models (`*.ts`) call `getSequelizeInstance()` during their initial module evaluation (in `Model.init`). If Jest loads these model files *before* the asynchronous `setupTestDb` function finishes creating and setting the Sequelize instance, the `getSequelizeInstance()` call fails. Attempts to mitigate this using dynamic imports within test files were insufficient because Jest still pre-parses or loads the model dependencies before the async setup completes.

## Approved Solution Plan (with Logging)

The plan is to ensure the Sequelize instance exists *before* any model file is loaded, while still performing asynchronous setup (like migrations) before tests run. Logging will be added to verify the execution order.

1.  **Synchronous Instance Creation with Logging (`src/db/mockDbSetup.ts`):**
    *   Add `console.log('[mockDbSetup] Creating Sequelize instance...')` immediately before creating the instance.
    *   Modify the module to create the Sequelize instance **synchronously** using the test configuration when the module is first loaded.
    *   Add `console.log('[mockDbSetup] Sequelize instance created.')` immediately after creation.
    *   Export the getter (`getSequelizeInstance`) as before.
    *   Remove the setter function (`setSequelizeInstance`).

2.  **Refactor Asynchronous Setup with Logging (`tests/db-setup.ts`):**
    *   In `setupTestDb`:
        *   Add `console.log('[setupTestDb] Starting setup...')` at the beginning.
        *   Remove the instance creation logic.
        *   Get the already-created instance using `const sequelize = getSequelizeInstance();`.
        *   Add `console.log('[setupTestDb] Running migrations...')`.
        *   Run migrations (`await umzug.up();`).
        *   Add `console.log('[setupTestDb] Migrations complete. Importing models/associations...')`.
        *   Dynamically import models and associations (`await import(...)`).
        *   Add `console.log('[setupTestDb] Setup complete.')` at the end.
    *   Update `teardownTestDb` and `clearTestDb` to also use `getSequelizeInstance()` to retrieve the instance.

3.  **Maintain Test File Dynamic Imports:**
    *   Keep the dynamic `await import(...)` for handlers, models, and fixtures within the `beforeAll` hook of test files (e.g., `tests/api/documents.test.ts`). This ensures tests don't interact with models *before migrations are complete*, even though the Sequelize instance itself exists earlier.

## Proposed Execution Flow Diagram

```mermaid
sequenceDiagram
    participant Jest
    participant mockDbSetup.ts
    participant jest.setup.ts
    participant db-setup.ts
    participant Model.ts
    participant TestFile.ts

    Note over Jest: Test Run Starts
    Jest ->> mockDbSetup.ts: Loads module
    activate mockDbSetup.ts
    mockDbSetup.ts ->> mockDbSetup.ts: Logs 'Creating instance...'
    mockDbSetup.ts ->> mockDbSetup.ts: Creates Sequelize instance (Sync)
    mockDbSetup.ts ->> mockDbSetup.ts: Logs 'Instance created.'
    deactivate mockDbSetup.ts
    Note over Jest: Loads other modules (incl. Models)
    Jest ->> Model.ts: Loads module
    activate Model.ts
    Model.ts ->> mockDbSetup.ts: getSequelizeInstance()
    activate mockDbSetup.ts
    mockDbSetup.ts -->> Model.ts: Returns existing instance
    deactivate mockDbSetup.ts
    Model.ts ->> Model.ts: Model.init(..., { sequelize: instance })
    deactivate Model.ts
    Note over Jest: Executes setupFilesAfterEnv
    Jest ->> jest.setup.ts: Executes file
    activate jest.setup.ts
    jest.setup.ts ->> jest.setup.ts: beforeAll hook starts (async)
    jest.setup.ts ->> db-setup.ts: setupTestDb()
    activate db-setup.ts
    db-setup.ts ->> db-setup.ts: Logs 'Starting setup...'
    db-setup.ts ->> mockDbSetup.ts: getSequelizeInstance()
    activate mockDbSetup.ts
    mockDbSetup.ts -->> db-setup.ts: Returns existing instance
    deactivate mockDbSetup.ts
    db-setup.ts ->> db-setup.ts: Authenticate (async)
    db-setup.ts ->> db-setup.ts: Logs 'Running migrations...'
    db-setup.ts ->> db-setup.ts: Run Migrations (async)
    db-setup.ts ->> db-setup.ts: Logs 'Migrations complete...'
    db-setup.ts ->> db-setup.ts: Dynamically import Models/Associations (async)
    db-setup.ts ->> db-setup.ts: Logs 'Setup complete.'
    db-setup.ts -->> jest.setup.ts: setupTestDb() completes
    deactivate db-setup.ts
    jest.setup.ts -->> Jest: beforeAll hook finishes
    deactivate jest.setup.ts
    Note over Jest: Executes Test File
    Jest ->> TestFile.ts: Executes file
    activate TestFile.ts
    TestFile.ts ->> TestFile.ts: beforeAll hook starts (async)
    TestFile.ts ->> TestFile.ts: Dynamically import Handler/Models/Fixtures (async)
    Note right of TestFile.ts: Models are already initialized, migrations are done.
    TestFile.ts -->> Jest: beforeAll hook finishes
    Note over Jest: Runs tests...
    TestFile.ts ->> mockDbSetup.ts: getSequelizeInstance() (during test execution)
    activate mockDbSetup.ts
    mockDbSetup.ts -->> TestFile.ts: Returns instance
    deactivate mockDbSetup.ts
    TestFile.ts ->> Model.ts: Model.create(), findByPk(), etc.
    deactivate TestFile.ts