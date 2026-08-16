-- ==========================================================================
-- MR HANDBOOK MANAGER - POSTGRES / SUPABASE DATABASE SCHEMA
-- Copy and paste this script into the Supabase SQL Editor to initialize.
-- ==========================================================================

-- Clean up existing tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS faq_replies CASCADE;
DROP TABLE IF EXISTS faq_threads CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    employee_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- SHA-256 hash
    department VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active'
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Sections Table
CREATE TABLE sections (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    order_num INTEGER NOT NULL,
    target_category VARCHAR(50) DEFAULT 'Both' NOT NULL -- 'BOH', 'FOH', or 'Both'
);
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;

-- 3. Documents Table
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    section_id VARCHAR(50) REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- 4. FAQ Threads Table
CREATE TABLE faq_threads (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_id VARCHAR(50) REFERENCES users(employee_id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    pinned_reply_id VARCHAR(50) -- Text column to avoid circular dependencies
);
ALTER TABLE faq_threads DISABLE ROW LEVEL SECURITY;

-- 5. FAQ Replies Table
CREATE TABLE faq_replies (
    id VARCHAR(50) PRIMARY KEY,
    thread_id VARCHAR(50) REFERENCES faq_threads(id) ON DELETE CASCADE,
    author_id VARCHAR(50) REFERENCES users(employee_id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE faq_replies DISABLE ROW LEVEL SECURITY;

-- 6. Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(255),
    action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- SEED DATA INSERTION
-- ==========================================================================

-- Seed default employees matching the new organizational role structure
INSERT INTO users (employee_id, name, email, password, department, role, status) VALUES
('ADM001', 'Alex Vance', 'admin@company.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Management', 'Director', 'Active'),
('ADM002', 'Sarah Connor', 'hr@company.com', '96924614e866b96e49a88eb82f1b72e59e99a80e1c312781b0a8809c9dfd3d4b', 'Management', 'HR', 'Active'),
('WRK001', 'John Doe', 'worker1@company.com', '312bba6ac1c4274943d7d3c1f346e8e27310c731e407ce5592d82f0d101fbff1', 'BOH', 'BOH Manager', 'Active'),
('WRK002', 'Jane Smith', 'worker2@company.com', '312bba6ac1c4274943d7d3c1f346e8e27310c731e407ce5592d82f0d101fbff1', 'FOH', 'Waiter', 'Active'),
('WRK003', 'Bob Johnson', 'disabled@company.com', 'dde79399fb85ad1dfbaec103d360520c2590f9106832d830dff673eae18c39d9', 'BOH', 'BOH Crew', 'Disabled'),
('WRK004', 'David Miller', 'foh@company.com', '38933b4998069e2b6947ec3a0c5c4d63cd7650fa9b3dfbd9db0995c6a3e5d38a', 'FOH', 'FOH Manager', 'Active');

-- Seed default handbook sections with audience target tags
INSERT INTO sections (id, title, order_num, target_category) VALUES
('sec-1', 'Company Introduction', 1, 'Both'),
('sec-2', 'Safety Guidelines', 2, 'Both'),
('sec-3', 'Warehouse Procedures', 3, 'BOH'),
('sec-4', 'HR Policies', 4, 'Both'),
('sec-5', 'Emergency Procedures', 5, 'Both'),
('sec-6', 'FOH Operations', 6, 'FOH');

-- Seed default handbook documents using dollar-quoting ($$) to safely handle multiline markdown
INSERT INTO documents (id, section_id, title, content, order_num, last_updated) VALUES
('doc-1-1', 'sec-1', 'Welcome & Mission', $$# Welcome to MR Manufacturing!

Welcome to the team. We are thrilled to have you join us. This handbook is designed to help you get acquainted with our operations, work guidelines, safety rules, and culture.

## Our Mission
To manufacture high-quality precision components with efficiency, integrity, and safety as our guiding pillars.

## Core Pillars
1. **Safety First:** No job is so important that it cannot be done safely.
2. **Quality Driven:** Precision is not just a standard, it's our promise.
3. **Customer Focused:** We deliver on-time, reliable solutions.

> "Quality is not an act, it is a habit." — Aristotle

If you have any questions, reach out to your direct supervisor or check the FAQ board!$$, 1, '2026-08-01 09:00:00+00'),

('doc-1-2', 'sec-1', 'Company Values', $$# Core Company Values

At MR Manufacturing, our values shape everything we do.

## Integrity
We communicate honestly, take responsibility, and hold ourselves to the highest ethical standards.

## Collaboration
We work as one unit. Success is shared, and challenges are solved together.

## Continuous Improvement
We constantly evaluate and refine our workflows:
- Lean manufacturing principles
- Regular feedback loops
- Ongoing technical training

### Value Alignment Matrix
| Value | Standard | Action Expected |
|---|---|---|
| Integrity | Honesty | Report anomalies immediately |
| Collaboration | Teamwork | Support cross-department tasks |
| Improvement | Quality | Recommend workflow optimizations |$$, 2, '2026-08-01 10:30:00+00'),

('doc-2-1', 'sec-2', 'PPE Guidelines', $$# Personal Protective Equipment (PPE)

This document details the mandatory PPE standards across all factory floors.

## Core PPE Requirements
All employees and visitors must wear the following gear when entering production areas:
- [x] Steel-toed safety shoes
- [x] High-visibility vest
- [x] Safety glasses (ANSI Z87.1 approved)

## Specialized PPE
Depending on your station, additional gear may be required:
- **Welding Area:** Welding helmet, heavy-duty leather apron, and welding gloves.
- **Chemical Handling:** Splash goggles, chemical-resistant gloves, and rubber aprons.
- **High-Noise Zones:** Earplugs or noise-cancelling earmuffs (when decibels exceed 85dB).

### Decibel Exposure Limits
| Zone | Avg Noise Level | Protection Needed |
|---|---|---|
| Assembly Floor | 70-80 dB | Recommended |
| CNC Machine Hall | 85-95 dB | Mandatory |
| Stamping Press | 100+ dB | High-grade Ear Defenders |

*Failure to comply with PPE rules will result in immediate suspension from the work floor.*$$, 1, '2026-08-03 08:15:00+00'),

('doc-2-2', 'sec-2', 'Fire Prevention', $$# Fire Prevention & Safety Protocol

Maintaining a fire-safe environment is the responsibility of every employee.

## Preventive Rules
- **No Smoking:** Smoking is strictly forbidden inside all facilities, except in designated outdoor smoking zones.
- **Clear Aisles:** Keep fire exits, extinguisher stations, and electrical panels clear at all times.
- **Flammable Storage:** Store flammable chemicals inside the yellow self-closing safety cabinets.

## Fire Extinguisher Types & Locations
We use **ABC Dry Chemical** extinguishers across the main floor, and **CO2** extinguishers near electrical panels.

### Standard PASS Procedure
If you must operate a fire extinguisher, remember **PASS**:
1. **P**ull the pin.
2. **A**im at the base of the fire.
3. **S**queeze the handle.
4. **S**weep from side to side.$$, 2, '2026-08-03 11:00:00+00'),

('doc-3-1', 'sec-3', 'Receiving Procedures', $$# Receiving Procedures

All inbound shipments must follow this strict verification workflow.

## Verification Checklist
When a delivery truck arrives:
- [ ] Inspect the physical condition of the packaging for damage.
- [ ] Verify the driver's manifest matches the purchase order (PO) number.
- [ ] Count the boxes/pallets before signing the bill of lading (BOL).

## Data Entry Workflow
Record the incoming inventory in our system within 2 hours of arrival:
1. Open the Inventory Manager application.
2. Select **Inbound Shipments**.
3. Scan the barcode on the receiving label.
4. If a item is damaged, take a photo and upload it immediately to the portal under 'Damaged Deliveries'.

```javascript
// Example API Payload for Inbound Shipments
{
  "purchaseOrderId": "PO-2026-9812",
  "receivedBy": "WRK002",
  "items": [
    { "sku": "STEEL-SHEET-A", "quantity": 50, "damaged": 0 }
  ],
  "timestamp": "2026-08-08T08:00:00Z"
}
```$$, 1, '2026-08-04 14:20:00+00'),

('doc-4-1', 'sec-4', 'Working Hours & Breaks', $$# Working Hours & Rest Breaks

We operate on a 3-shift rotation schedule to maintain continuous operations.

## Shift Schedules
- **Shift A (Morning):** 06:00 AM - 02:00 PM
- **Shift B (Afternoon):** 02:00 PM - 10:00 PM
- **Shift C (Night):** 10:00 PM - 06:00 AM

## Rest Breaks
For every 8-hour shift, employees are entitled to:
- One **30-minute unpaid lunch break** (scheduled near the mid-point of the shift).
- Two **15-minute paid rest breaks** (one in the first half, one in the second half).

### Overtime Rules
All overtime must be approved in advance by your supervisor. Hours worked past 40 hours per week are paid at **1.5x** the standard hourly rate.$$, 1, '2026-08-05 09:00:00+00'),

('doc-5-1', 'sec-5', 'Evacuation Plan', $$# Emergency Evacuation Plan

In the event of an evacuation alarm (continuous high-pitched horn), follow these instructions immediately.

## Evacuation Steps
1. Stop all operations and safely cut power to machines (if immediately accessible).
2. Leave personal belongings behind.
3. Evacuate the building via the nearest marked green exit door.
4. **Do not run or push.** Walk calmly and quickly.
5. Assemble at **Assembly Point A** (Main Car Park) or **Assembly Point B** (Rear Field) as instructed.

## Assembly Point Map Ref
- **North/East Wings:** Main Car Park (Point A)
- **South/West Wings:** Rear Field (Point B)

*Do not re-enter the building until the Safety Officer declares it is safe to do so.*$$, 1, '2026-08-06 15:45:00+00'),

('doc-6-1', 'sec-6', 'Customer Service Standards', $$# Customer Service Standards

Welcome to our front-of-house team! Outstanding service is key to our success.

## General Guidelines
- **Greeting:** Greet every customer with a warm smile and eye contact within 10 seconds of arrival.
- **Attitude:** Maintain a helpful and polite posture at all times.
- **Service Timing:** Keep table check-ins consistent. Check back on meals within 2 minutes of serving.$$, 1, '2026-08-07 09:00:00+00');

-- Seed default FAQ threads
INSERT INTO faq_threads (id, title, author_id, author_name, created_at, resolved, pinned_reply_id) VALUES
('faq-1', 'How do I request a safety gear replacement?', 'WRK001', 'John Doe', '2026-08-06 10:15:00+00', TRUE, 'rep-1-1'),
('faq-2', 'Where can I view the Shift C holiday schedule?', 'WRK002', 'Jane Smith', '2026-08-07 11:40:00+00', FALSE, NULL);

-- Seed default FAQ replies
INSERT INTO faq_replies (id, thread_id, author_id, author_name, content, created_at) VALUES
('rep-1-1', 'faq-1', 'ADM001', 'Alex Vance (Admin)', 'For safety gear replacements, visit the Safety Office on the first floor. Bring your old gear (if damaged) and fill out the PPE Replacement Request form. They will issue replacements immediately.', '2026-08-06 11:00:00+00'),
('rep-1-2', 'faq-1', 'WRK001', 'John Doe', 'Perfect, thank you! I got my steel-toed boots replaced today.', '2026-08-06 14:30:00+00'),
('rep-2-1', 'faq-2', 'ADM001', 'Alex Vance (Admin)', 'I will upload the Q3/Q4 holiday rosters in the HR Policy section later this afternoon. Keep an eye out!', '2026-08-07 13:10:00+00');

-- Seed initial audit logs
INSERT INTO audit_logs (id, user_id, user_name, action, timestamp) VALUES
('log-1', 'ADM001', 'Alex Vance', 'Database initialized with granular department roles and category targeted sections.', NOW());
