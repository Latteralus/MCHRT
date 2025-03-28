# UI Update and Sidebar Fix Plan

Based on user feedback, the previous UI updates did not fully match the desired appearance, and the sidebar navigation highlighting is broken. This plan outlines the steps to address these issues.

## Goals

1.  Ensure the sidebar correctly highlights the active page link.
2.  Adjust component styling across the application to match the visual appearance shown in the provided screenshot (image provided on 2025-03-28).
3.  Maintain consistency by using the semantic CSS approach defined in `src/styles/global.css`.

## Steps

1.  **Fix Sidebar Active State:**
    *   Modify `src/components/layouts/MainLayout.tsx` to import and use the `useRouter` hook from `next/router` to determine the current route (`pathname`).
    *   Pass the `pathname` as the `activePath` prop to the `Sidebar` component instance within `MainLayout.tsx`.
    *   Verify that `src/components/navigation/Sidebar.tsx` correctly uses the received `activePath` prop to conditionally apply the `.active` class to the appropriate `.menu-item` link.

2.  **Adjust Styling to Match Screenshot:**
    *   **Stat Cards:**
        *   Re-examine the refactored stat card widgets (`EmployeeStats`, `AttendanceWidget`, `LeaveWidget`, `ComplianceStatsWidget`).
        *   Adjust their internal JSX structure (likely needing a wrapper div for left/right content) and potentially add/modify CSS in `global.css` for `.stat-card .card-body` or specific inner elements to achieve the side-by-side layout (icon/label left, value/trend right) shown in the screenshot.
    *   **License Operations Widget:**
        *   Re-examine `ExpiringComplianceWidget.tsx`.
        *   Adjust the JSX structure and CSS for `.license-item` and its children (`.license-item-avatar`, `.license-item-info`, `.license-item-name`, `.license-item-detail`, `.license-status`) to precisely match the screenshot's appearance (layout, fonts, spacing).
    *   **General Review:**
        *   Compare other elements visible in the screenshot (header elements, buttons, overall spacing within `.main-content`) against the screenshot.
        *   Make necessary CSS adjustments in `global.css` to ensure visual fidelity.

3.  **Audit Other Pages/Components:**
    *   Systematically review other key pages (e.g., Leave Management, Compliance, Documents, Settings) and common UI components (buttons, inputs, tables if used elsewhere).
    *   Refactor components as needed to remove conflicting utility classes and apply the semantic classes from `global.css` consistently. Prioritize pages visible in the main navigation.

4.  **Final Review & Testing:**
    *   Navigate through the application, verifying the sidebar highlighting works correctly.
    *   Visually inspect key pages to ensure UI consistency and alignment with the target style.
    *   Test responsiveness if applicable based on styles in `global.css`.

## Implementation Notes

*   All styling changes should primarily be made by applying semantic classes defined in `src/styles/global.css`.
*   Avoid introducing new utility classes or extensive inline styles unless absolutely necessary for layout adjustments not covered by existing semantic classes.
*   If new semantic classes are needed (e.g., for table styling, specific widget layouts), define them clearly in `global.css`.