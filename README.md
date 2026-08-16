# MR Handbook Manager

MR Handbook Manager is a secure internal Single-Page Web Application (SPA) designed to centralize company handbooks, Standard Operating Procedures (SOPs), work instructions, and employee manuals. Rather than distributing static PDF files, administrators can update materials in real-time, register employees, track system audit trails, and address worker concerns through an integrated FAQ forum.

---

## 1. Core Product Features

*   **Secure Authentication**: Role-Based Access Control (RBAC) separating administrative and worker panels.
*   **Dynamic Markdown Handbook Viewer**: Generates clean, searchable articles from Markdown files, complete with a sticky Table of Contents sidebar for easy page navigation.
*   **Real-time Admin Editing Panels**: Admins can edit, order, create, or upload `.md` files to update content on the fly.
*   **Interactive FAQ Forum**: Workers can create discussion threads, and administrators can reply or pin responses.
*   **Tamper-Resistant Security Logs**: Automated logging of administrator profile actions with timestamps.
*   **Responsive UI**: Optimized for mobile and tablet devices for workers accessing materials on the factory floor.

---

## 2. Technology Stack

### Core Frontend
*   **HTML5**: Structuring app panes, modals, and tables.
*   **CSS3**: Custom design system built with CSS variables, featuring real-time Light/Dark mode toggles, micro-animations, and responsive slide-out drawers.
*   **JavaScript (ES6 Modules)**: Powering modular app flow, dynamic event handlers, state management, and asynchronous operations.

### Libraries & Dependencies (via CDNs)
*   **[@supabase/supabase-js](https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)**: PostgREST API client managing secure database transactions.
*   **[marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js)**: Client-side Markdown parser.
*   **[DOMPurify](https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js)**: Sanitizes compiled HTML to prevent Cross-Site Scripting (XSS).
*   **[Lucide Icons](https://unpkg.com/lucide@latest)**: Premium UI icons.
*   **[Inter Font](https://fonts.google.com/specimen/Inter)**: Typography.

### Remote Database
*   **Supabase PostgreSQL**: A cloud database storing all application state. 
*   *Note: Row-Level Security (RLS) is disabled by design for simplified frontend queries in this internal application setup.*

---

## 3. Database Architecture & Setup

### Relational Schema
The database consists of six tables:
1.  `users`: Store employee credentials, roles (`Administrator` or `Worker`), and statuses (`Active` or `Disabled`).
2.  `sections`: Categorize handbook modules.
3.  `documents`: Store handbook bodies in Markdown.
4.  `faq_threads`: Discussions created by employees.
5.  `faq_replies`: Responses under discussion threads.
6.  `audit_logs`: Administrator system actions.

### Setup Instructions
1.  Go to your [Supabase Console](https://supabase.com) and navigate to your project.
2.  Open the **SQL Editor** in the left sidebar menu.
3.  Click **New Query** to create an empty query sheet.
4.  Copy the contents of [`schema.sql`](./schema.sql) and paste them into the SQL editor window.
5.  Ensure no text is highlighted and click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`). This creates the tables, disables RLS for client access, and inserts default seeds.

---

## 4. Local Development

To run the application locally:
1.  Ensure you have **Python** installed.
2.  Open your terminal inside the project directory and run:
    ```bash
    npm start
    ```
    *(Alternatively, run: `python -m http.server 8000`)*
3.  Open your browser and navigate to **[http://localhost:8000](http://localhost:8000)**.

---

## 5. Vercel Deployment

To deploy the application to Vercel:
1. Connect your repository to **Vercel**.
2. Add the following **Environment Variables** in the Vercel Dashboard project settings:
   *   `SUPABASE_URL`: Your Supabase Project URL.
   *   `SUPABASE_ANON_KEY`: Your Supabase public anonymous API key.
3. Verify that the build and deployment settings are set to:
   *   **Build Command**: `npm run build` (executes the dynamic injection script `inject-env.js`).
   *   **Output Directory**: `.` (pre-configured in `vercel.json`).
4. Trigger a deployment. The build process will automatically bake the environment variables into the static frontend scripts.

---

## 6. Seed Accounts (Default Logins)

| User Role | Email | Password | Full Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@company.com` | `admin123` | Alex Vance | Active |
| **Worker** | `worker1@company.com` | `worker123` | John Doe | Active |
| **Worker** | `worker2@company.com` | `worker123` | Jane Smith | Active |
| **Worker** | `disabled@company.com` | `disabled123` | Bob Johnson | Disabled |

*All password records are stored securely using **SHA-256** hashing.*
