# Namo: Autonomous E2E Front-End Testing Plan

This document outlines a detailed, step-by-step browser testing plan for the Namo Volunteer Management Platform. This plan is specifically designed to be executed **fully autonomously** by an AI agent (Gemini Flash) using the `browser` tool.

## 🚨 CRITICAL INSTRUCTIONS FOR THE AUTONOMOUS AGENT 🚨
1. **NO CODING OR FILE MODIFICATIONS:** You must **NOT** write a single line of code. You must **NOT** touch the codebase or edit any files, with the sole exception of creating and updating the `docs/nightly_test_report.md` file. Your job is ONLY to test the UI through the browser and report issues.
2. **NO USER INPUT:** You are running overnight. You must **NEVER** pause to ask the user for input, credentials, or confirmation. 
3. **USE PROVIDED CREDENTIALS:** When the test requires you to log in as a Admin or Super Admin, you MUST use the following credentials:
   - **Email:** `stefano.pollastri25@gmail.com`
   - **Password:** `15October!`
4. **CONTINUOUS REPORTING & SNAPSHOTS:** Create a file named `docs/nightly_test_report.md` at the very beginning. 
   - **After EVERY SINGLE micro-test/step**, you MUST append the result (Pass/Fail) to this markdown file.
   - You MUST include a brief description of the outcome ("l'esito").
   - You MUST capture a screenshot using the browser tool at the end of each micro-test and embed the snapshot image link directly into the markdown report (e.g., `![Step 1.1 Outcome](/absolute/path/to/screenshot.png)`).
5. **ERROR HANDLING:** If you encounter a bug, an error, or a missing feature, document it as a failure, take a screenshot, and attempt to continue to the next independent test flow. Do not stop the entire test suite unless absolutely blocked.

---

## Autonomous Browser Test Flows

### Setup Phase
- Ensure the local development server is running strictly on `http://localhost:3000`. This is the URL configured in Supabase, so it MUST be port 3000. If it is not running, or if port 3000 is occupied by another process, you MUST find the process running on port 3000 (e.g., using `lsof -i :3000 -t | xargs kill -9`) and kill it before running `pnpm dev` in a background terminal.

### Flow 1: Authentication & Onboarding
- **Goal:** Verify new volunteer registration and administrative approval.
- **Micro-Tests:**
  - **1.1 Register:** Navigate to `http://localhost:3000`, click "Registrati", and submit the form with valid data (Name, Surname, clear email, sectors). 
    - *Post-test action:* Capture snapshot. Append result to report.
  - **1.2 Registration Pending:** Verify the UI shows the "pending approval" message. 
    - *Post-test action:* Capture snapshot. Append result to report.
  - **1.3 Blocked Calendar:** Attempt to navigate to the calendar or dashboard and verify access is restricted.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **1.4 Admin Approval:** Log in using the provided credentials (`stefano.pollastri25@gmail.com` / `15October!`). Navigate to User Management, find the new user you just registered, and click "Approve". 
    - *Post-test action:* Capture snapshot. Append result to report.
  - **1.5 Volunteer Login:** Log out. Log in with the newly created volunteer credentials. Verify successful access to the Volunteer Dashboard.
    - *Post-test action:* Capture snapshot. Append result to report.

### Flow 2: Admin Event Creation & Management
- **Goal:** Verify an admin can create, clone, and publish events.
- **Micro-Tests:**
  - **2.1 Validation Error:** Log in using the provided credentials (`stefano.pollastri25@gmail.com` / `15October!`). Navigate to **Events** -> **New Event**. Attempt to submit without a mandatory Location. Verify validation error appears.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **2.2 Create Draft Interno Event:** Fill all fields for an `Interno` event (capacity: 1, waitlist limit: 2). Save as `Draft`. Verify it appears in the Admin list but not on the public calendar.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **2.3 Publish Event:** Change the 'Interno' event state to **Published**.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **2.4 Create Aperto Event:** Create an `Aperto` (public) event and Publish it.
    - *Post-test action:* Capture snapshot. Append result to report.

### Flow 3: External User Registration (Utente Esterno)
- **Goal:** Verify an unauthenticated user can browse and register for public events.
- **Micro-Tests:**
  - **3.1 Anonymous Browsing:** Ensure you are logged out. Navigate to the events calendar. Verify ONLY the `Aperto` event is visible. The `Interno` event must be hidden.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **3.2 External Registration:** Click the `Aperto` event -> "Register". Fill the lightweight form and submit. Verify immediate confirmation UI.
    - *Post-test action:* Capture snapshot. Append result to report.

### Flow 4: Volunteer Calendar & Waitlist Logic
- **Goal:** Verify that a volunteer can register, hit capacity limits, and join a waitlist.
- **Micro-Tests:**
  - **4.1 Register Interno Event:** Log in as the Volontario (from Flow 1). View Calendar, verify the `Interno` published event is visible. Register for it (capacity 1). Verify immediate confirmation.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **4.2 Hit Capacity / Waitlist:** Log out. Register/login as a **second Volontario**. Navigate to the same `Interno` event. Attempt to register. System should notify the event is full. Join waitlist. Verify the UI confirms "Waitlist position: #1".
    - *Post-test action:* Capture snapshot. Append result to report.

### Flow 5: Cancellation & Auto-Promotion
- **Goal:** Verify that a cancellation promotes the waitlist correctly.
- **Micro-Tests:**
  - **5.1 Volunteer Cancellation:** Log in as the first Volontario (confirmed spot). Navigate to Dashboard/Event Details and cancel the registration.
    - *Post-test action:* Capture snapshot. Append result to report.
  - **5.2 Auto-Promotion:** Log out. Log in as the second Volontario (waitlisted). Navigate to Dashboard. Verify status changed from "Waitlist" to "Confirmed" automatically.
    - *Post-test action:* Capture snapshot. Append result to report.

### Flow 6: Admin Audit & Data Management
- **Goal:** Verify admin tools for attendance override and data export.
- **Micro-Tests:**
  - **6.1 Attendance Override:** Log in using the provided credentials (`stefano.pollastri25@gmail.com` / `15October!`). Navigate to the `Interno` event registrations. Manually override the attendance status of the confirmed volunteer to "No Show".
    - *Post-test action:* Capture snapshot. Append result to report.
  - **6.2 Audit Log Verification:** Navigate to the **Audit Log** page. Verify the manual attendance override is recorded.
    - *Post-test action:* Capture snapshot. Append result to report.

---

## Final Review
After executing these steps, your `docs/nightly_test_report.md` will contain the full trace of the end-to-end testing, accompanied by snapshots of the UI at every single micro-test stage. Once finished, you may conclude the session. Remember: **strictly test the UI and describe the issues; do not touch the codebase.**
