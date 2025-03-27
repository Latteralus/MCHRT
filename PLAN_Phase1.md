# Plan: Phase 1 - Project Setup & Core Infrastructure

This plan outlines the steps to establish the foundational structure, layout, authentication, and configuration for the Mountain Care HR Management Platform, based on the project documentation.

## Steps

1.  **Verify Initial Setup:**
    *   Confirm the existing Next.js project uses TypeScript.
    *   Verify ESLint and Prettier configurations (`.eslintrc.json`, `prettier.config.js`) are in place.
2.  **Establish Folder Structure:**
    *   Create the core directories outlined in `DevDocuments/Project.md` (lines 84-548) within the `src` folder (e.g., `components`, `config`, `db`, `lib`, `modules`, `types`) and the root level (`local-storage`, `tests`, `docs`, `e2e`).
3.  **Implement Core Layout Components:**
    *   Create `MainLayout.tsx` incorporating a `Sidebar` component based on the structure and styling provided in `DevDocuments/example.md`. (Note: TopBar component removed as per user instruction).
    *   Place the layout components likely within `src/components/layouts/` and `src/components/navigation/`.
    *   Update `src/pages/_app.tsx` to use `MainLayout` for relevant pages.
4.  **Set Up Basic Authentication:**
    *   Install `next-auth`.
    *   Configure NextAuth.js using the `CredentialsProvider` for username/password login (no email login) as specified in `DevDocuments/TechnicalDocument.md`. This involves creating the API route `src/pages/api/auth/[...nextauth].ts`.
    *   Create a basic `login.tsx` page under `src/pages/`.
5.  **Configure Mock Database (SQLite):**
    *   Install `sequelize` and `sqlite3`.
    *   Create database configuration files (`src/db/config.ts`) and a setup script (`src/db/mockDbSetup.ts`) for initializing Sequelize with SQLite for development and testing, as mentioned in `DevDocuments/TechnicalDocument.md`.
6.  **Set Up Environment Variables:**
    *   Create a `.env.local` file based on the example in `DevDocuments/Project.md` (lines 537-539) and the requirements in `DevDocuments/TechnicalDocument.md` (lines 135-141).
    *   Include placeholders for `DATABASE_URL` (pointing to the SQLite file initially), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `FILE_STORAGE_PATH`.
7.  **Create Local Document Storage:**
    *   Create the directory structure under `local-storage/documents/` as specified in `DevDocuments/Project.md` (lines 480-485).
    *   Ensure the `FILE_STORAGE_PATH` in `.env.local` points to this location.

## Flowchart

```mermaid
graph TD
    A[Start: Review Project Docs] --> B{Project Initialized?};
    B -- Yes --> C[1. Verify Initial Setup (TS, Linting)];
    B -- No --> D[Initialize Next.js Project (Not needed)];
    C --> E[2. Establish Folder Structure];
    E --> F[3. Implement Core Layout (Sidebar, TopBar, MainLayout)];
    F --> G[4. Setup NextAuth (CredentialsProvider, Login Page)];
    G --> H[5. Configure Mock DB (SQLite + Sequelize)];
    H --> I[6. Setup Environment Variables (.env.local)];
    I --> J[7. Create Local Document Storage Dirs];
    J --> K[End Phase 1 Setup];