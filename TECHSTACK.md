# Technology Stack - MR Handbook Manager

This document provides a detailed overview of the technologies, libraries, architecture, and security mechanisms used to build the MR Handbook Manager application.

---

## 1. Core Architecture

The application is structured as a light, high-performance **Single-Page Application (SPA)** that runs client-side in the browser, communicating with a remote **Supabase (PostgreSQL)** database.

*   **HTML5**: Structuring the workspace view containers, modals, table elements, and form inputs.
*   **CSS3**: Custom design system styled using native CSS Variables, supporting real-time Light/Dark mode toggles, micro-animations, glassmorphic filters, and mobile-first responsive drawers.
*   **JavaScript (ES6 Modules)**: Powering modular app flow, dynamic event handlers, rendering templates, state routing, and asynchronous API client transactions.

---

## 2. External Libraries & Dependencies

All dependencies are loaded securely via CDNs, minimizing external setup:

*   **[@supabase/supabase-js](https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)**: The official Supabase JavaScript Client library used to execute remote query parameters, inserts, updates, and deletes.
*   **[marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js)**: High-speed, standards-compliant client-side Markdown compiler.
*   **[DOMPurify](https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js)**: Industrial-strength XSS sanitizer to secure rendered HTML elements before insertion into the DOM.
*   **[Lucide Icons](https://unpkg.com/lucide@latest)**: Premium SVG iconography loaded dynamically.
*   **[Inter Font](https://fonts.google.com/specimen/Inter)**: Google Fonts integration for modern and highly legible typography.

---

## 3. Database & Storage Architecture

The application stores all relational data tables inside a real-time **Supabase PostgreSQL** cloud instance:

*   **Project Instance**: `kzakbvsxlfwhquhmdgns.supabase.co`
*   **Tables & Relational Schema**:
    *   `users`: Employee credential entries, department tags, roles, and status fields.
    *   `sections`: Categorized handbook headings.
    *   `documents`: Handbook manuals containing markdown body text.
    *   `faq_threads`: Discussions created by employees.
    *   `faq_replies`: Response details under discussion threads.
    *   `audit_logs`: Logging information for administrator security reviews.
*   **Persistence**: Handled live by Supabase. Authorization tokens are cached inside `sessionStorage` for temporary state preservation (auto-expires when the browser tab is closed).

---

## 4. Security Implementation

The application implements high-fidelity simulations of server-side security features:

*   **Role-Based Access Control (RBAC)**: An access authorization shield wrapping database APIs. Functions (such as creating sections, editing workers, pinning FAQ replies) check if the active session user holds the `Administrator` role.
*   **Password Hashing**: Utilizes the native **Web Cryptography API** (`crypto.subtle.digest`) to compute **SHA-256** hashes of credentials before storing them, eliminating plain-text password leakage.
*   **Cross-Site Scripting (XSS) Prevention**: Compulsory cleaning of all parsed Markdown content and FAQ replies using `DOMPurify` before rendering to block raw HTML injection.
*   **Audit Trail Logs**: Automated generation of tamper-resistant administrative logs mapping the actor's Employee ID, action performed, and exact timestamp.

---

## 5. Development Server
*   **Python HTTP Server**: Built-in standard library module (`python -m http.server`) used to serve files locally with correct MIME types for ES6 imports.
