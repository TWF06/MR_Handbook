// ==========================================================================
// MR HANDBOOK MANAGER - SUPABASE BACKEND CONTROLLER
// ==========================================================================

const supabaseUrl = 'https://kzakbvsxlfwhquhmdgns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWtidnN4bGZ3aHF1aG1kZ25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNzIxNzMsImV4cCI6MjEwMTk0ODE3M30.O_MPY0tYUpmNzwEOnHC4BPVB3rz94y-RuaECd7PpX_c';

let clientSupabase = null;
try {
  const client = window.supabase;
  if (!client) {
    throw new Error("Supabase library not loaded. This is often caused by ad-blockers blocking Supabase CDN links.");
  }
  clientSupabase = client.createClient(supabaseUrl, supabaseKey);
} catch (err) {
  console.error("Supabase initialization error:", err);
  // Expose a dummy client that returns empty promises to prevent code from throwing type errors
  clientSupabase = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: { message: "Database offline (Supabase blocked by adblocker/network)" } }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "Database offline" } })
        })
      }),
      insert: () => Promise.resolve({ error: { message: "Database offline" } }),
      update: () => Promise.resolve({ error: { message: "Database offline" } }),
      delete: () => Promise.resolve({ error: { message: "Database offline" } })
    })
  };
  
  // Show user-friendly overlay banner
  window.addEventListener('DOMContentLoaded', () => {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = "position: fixed; top: 0; left: 0; right: 0; background: #fee2e2; color: #991b1b; padding: 15px; border-bottom: 2px solid #fca5a5; z-index: 100000; box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-family: sans-serif; font-size: 14px; line-height: 1.5; text-align: center;";
    alertDiv.innerHTML = "<strong>Database Connection Error:</strong> The Supabase client could not be loaded. This is usually caused by ad-blockers (like Brave Shield, uBlock Origin, etc.) blocking Supabase CDN scripts. Please <strong>disable your adblocker</strong> for this site and refresh.";
    document.body.prepend(alertDiv);
  });
}

export const supabase = clientSupabase;

// Seed data definition inside db.js to support database resets
// Role permission groups for security routing and validation
export const ALL_ROLES = [
  'Director', 'HR', 'Administrative',
  'BOH Manager', 'CDP', 'SOUS', 'BOH Crew',
  'FOH Manager', 'Waiter', 'Barista'
];
export const MANAGER_ROLES = [
  'Director', 'HR', 'Administrative',
  'BOH Manager', 'FOH Manager'
];
export const MANAGEMENT_ROLES = [
  'Director', 'HR', 'Administrative'
];

export const ROLE_HIERARCHY = {
  'Director': 4,
  'HR': 3,
  'Administrative': 2,
  'BOH Manager': 1,
  'FOH Manager': 1,
  'CDP': 0,
  'SOUS': 0,
  'BOH Crew': 0,
  'Waiter': 0,
  'Barista': 0
};

export function getRoleLevel(role) {
  return ROLE_HIERARCHY[role] || 0;
}

export function canManageUser(managerRole, targetRole) {
  const mLevel = getRoleLevel(managerRole);
  const tLevel = getRoleLevel(targetRole);
  
  if (managerRole === 'Director') return true; // Director has highest authorization
  return mLevel > tLevel;
}

// Seed data definition inside db.js to support database resets
const SEED_USERS = [
  { employee_id: "ADM001", name: "Alex Vance", email: "admin@company.com", password: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", department: "Management", role: "Director", status: "Active" },
  { employee_id: "ADM002", name: "Sarah Connor", email: "hr@company.com", password: "96924614e866b96e49a88eb82f1b72e59e99a80e1c312781b0a8809c9dfd3d4b", department: "Management", role: "HR", status: "Active" },
  { employee_id: "WRK001", name: "John Doe", email: "worker1@company.com", password: "312bba6ac1c4274943d7d3c1f346e8e27310c731e407ce5592d82f0d101fbff1", department: "BOH", role: "BOH Manager", status: "Active" },
  { employee_id: "WRK002", name: "Jane Smith", email: "worker2@company.com", password: "312bba6ac1c4274943d7d3c1f346e8e27310c731e407ce5592d82f0d101fbff1", department: "FOH", role: "Waiter", status: "Active" },
  { employee_id: "WRK003", name: "Bob Johnson", email: "disabled@company.com", password: "dde79399fb85ad1dfbaec103d360520c2590f9106832d830dff673eae18c39d9", department: "BOH", role: "BOH Crew", status: "Disabled" },
  { employee_id: "WRK004", name: "David Miller", email: "foh@company.com", password: "38933b4998069e2b6947ec3a0c5c4d63cd7650fa9b3dfbd9db0995c6a3e5d38a", department: "FOH", role: "FOH Manager", status: "Active" }
];

const SEED_SECTIONS = [
  { id: "sec-1", title: "Company Introduction", order_num: 1, target_category: "Both" },
  { id: "sec-2", title: "Safety Guidelines", order_num: 2, target_category: "Both" },
  { id: "sec-3", title: "Warehouse Procedures", order_num: 3, target_category: "BOH" },
  { id: "sec-4", title: "HR Policies", order_num: 4, target_category: "Both" },
  { id: "sec-5", title: "Emergency Procedures", order_num: 5, target_category: "Both" },
  { id: "sec-6", title: "FOH Operations", order_num: 6, target_category: "FOH" }
];

const SEED_DOCUMENTS = [
  {
    id: "doc-1-1",
    section_id: "sec-1",
    title: "Welcome & Mission",
    order_num: 1,
    content: `# Welcome to MR Manufacturing!

Welcome to the team. We are thrilled to have you join us. This handbook is designed to help you get acquainted with our operations, work guidelines, safety rules, and culture.

## Our Mission
To manufacture high-quality precision components with efficiency, integrity, and safety as our guiding pillars.

## Core Pillars
1. **Safety First:** No job is so important that it cannot be done safely.
2. **Quality Driven:** Precision is not just a standard, it's our promise.
3. **Customer Focused:** We deliver on-time, reliable solutions.

> "Quality is not an act, it is a habit." — Aristotle

If you have any questions, reach out to your direct supervisor or check the FAQ board!`
  },
  {
    id: "doc-1-2",
    section_id: "sec-1",
    title: "Company Values",
    order_num: 2,
    content: `# Core Company Values

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
| Improvement | Quality | Recommend workflow optimizations |`
  },
  {
    id: "doc-2-1",
    section_id: "sec-2",
    title: "PPE Guidelines",
    order_num: 1,
    content: `# Personal Protective Equipment (PPE)

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

*Failure to comply with PPE rules will result in immediate suspension from the work floor.*`
  },
  {
    id: "doc-2-2",
    section_id: "sec-2",
    title: "Fire Prevention",
    order_num: 2,
    content: `# Fire Prevention & Safety Protocol

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
4. **S**weep from side to side.`
  },
  {
    id: "doc-3-1",
    section_id: "sec-3",
    title: "Receiving Procedures",
    order_num: 1,
    content: `# Receiving Procedures

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

\`\`\`javascript
// Example API Payload for Inbound Shipments
{
  "purchaseOrderId": "PO-2026-9812",
  "receivedBy": "WRK002",
  "items": [
    { "sku": "STEEL-SHEET-A", "quantity": 50, "damaged": 0 }
  ],
  "timestamp": "2026-08-08T08:00:00Z"
}
\`\`\``
  },
  {
    id: "doc-4-1",
    section_id: "sec-4",
    title: "Working Hours & Breaks",
    order_num: 1,
    content: `# Working Hours & Rest Breaks

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
All overtime must be approved in advance by your supervisor. Hours worked past 40 hours per week are paid at **1.5x** the standard hourly rate.`
  },
  {
    id: "doc-5-1",
    section_id: "sec-5",
    title: "Evacuation Plan",
    order_num: 1,
    content: `# Emergency Evacuation Plan

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

*Do not re-enter the building until the Safety Officer declares it is safe to do so.*`
  },
  {
    id: "doc-6-1",
    section_id: "sec-6",
    title: "Customer Service Standards",
    order_num: 1,
    content: `# Customer Service Standards

Welcome to our front-of-house team! Outstanding service is key to our success.

## General Guidelines
- **Greeting:** Greet every customer with a warm smile and eye contact within 10 seconds of arrival.
- **Attitude:** Maintain a helpful and polite posture at all times.
- **Service Timing:** Keep table check-ins consistent. Check back on meals within 2 minutes of serving.`
  }
];

const SEED_FAQ_THREADS = [
  { id: "faq-1", title: "How do I request a safety gear replacement?", author_id: "WRK001", author_name: "John Doe", resolved: true, pinned_reply_id: "rep-1-1" },
  { id: "faq-2", title: "Where can I view the Shift C holiday schedule?", author_id: "WRK002", author_name: "Jane Smith", resolved: false, pinned_reply_id: null }
];

const SEED_FAQ_REPLIES = [
  { id: "rep-1-1", thread_id: "faq-1", author_id: "ADM001", author_name: "Alex Vance (Admin)", content: "For safety gear replacements, visit the Safety Office on the first floor. Bring your old gear (if damaged) and fill out the PPE Replacement Request form. They will issue replacements immediately." },
  { id: "rep-1-2", thread_id: "faq-1", author_id: "WRK001", author_name: "John Doe", content: "Perfect, thank you! I got my steel-toed boots replaced today." },
  { id: "rep-2-1", thread_id: "faq-2", author_id: "ADM001", author_name: "Alex Vance (Admin)", content: "I will upload the Q3/Q4 holiday rosters in the HR Policy section later this afternoon. Keep an eye out!" }
];

// Helper to hash password using Web Crypto API (SHA-256)
export async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Database Seeder routine (wipes tables and inserts seed records)
export async function initializeDatabase(forceReset = false) {
  if (!forceReset) return; // Seeding is primarily manual via schema.sql, or triggered via dashboard reset

  try {
    // Truncate tables sequentially (due to foreign key cascades)
    await supabase.from('audit_logs').delete().neq('id', '');
    await supabase.from('faq_replies').delete().neq('id', '');
    await supabase.from('faq_threads').delete().neq('id', '');
    await supabase.from('documents').delete().neq('id', '');
    await supabase.from('sections').delete().neq('id', '');
    await supabase.from('users').delete().neq('employee_id', '');

    // Insert seeds
    await supabase.from('users').insert(SEED_USERS);
    await supabase.from('sections').insert(SEED_SECTIONS);
    await supabase.from('documents').insert(SEED_DOCUMENTS);
    await supabase.from('faq_threads').insert(SEED_FAQ_THREADS);
    await supabase.from('faq_replies').insert(SEED_FAQ_REPLIES);
    
    await writeAuditLog("SYSTEM", "Database reset to baseline seeding defaults.");
  } catch (err) {
    console.error("Database seed error:", err);
    throw new Error("Failed to seed database: " + err.message);
  }
}

// Session management
export function getCurrentSession() {
  const session = sessionStorage.getItem('mrhb_session');
  return session ? JSON.parse(session) : null;
}

export function setSession(user) {
  sessionStorage.setItem('mrhb_session', JSON.stringify({
    employeeId: user.employee_id,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role
  }));
}

export function clearSession() {
  sessionStorage.removeItem('mrhb_session');
}

// Audit Logging
export async function writeAuditLog(userId, action) {
  try {
    let userName = "System";
    if (userId !== "SYSTEM") {
      const session = getCurrentSession();
      userName = session ? session.name : "Unknown User";
    }
    
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      user_name: userName,
      action: action,
      timestamp: new Date().toISOString()
    };
    
    await supabase.from('audit_logs').insert([newLog]);
  } catch (err) {
    console.error("Audit Logging Error:", err);
  }
}

// RBAC middleware simulator
async function authorize(allowedRoles) {
  const session = getCurrentSession();
  if (!session) throw new Error("Authentication required.");
  
  // Verify account is still active in Supabase
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('status')
    .eq('employee_id', session.employeeId)
    .single();
    
  if (error || !dbUser || dbUser.status !== 'Active') {
    clearSession();
    throw new Error("Your account has been disabled or removed.");
  }
  
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Unauthorized: Access denied.");
  }
  return session;
}

// ================= AUTH API =================
export async function login(email, password) {
  if (!email || !password) throw new Error("Email and password are required.");
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();
  
  if (error) {
    console.error("Supabase Login Error:", error);
    if (error.code === 'PGRST116') {
      throw new Error("Invalid email or password.");
    }
    throw new Error(`Database Connection Error: ${error.message} (${error.code}). Please verify you ran schema.sql inside your Supabase Dashboard SQL Editor first.`);
  }
  
  if (!user) {
    throw new Error("Invalid email or password.");
  }
  
  if (user.status !== 'Active') {
    throw new Error("This account is disabled. Contact your administrator.");
  }
  
  const hashedInput = await hashPassword(password);
  if (user.password !== hashedInput) {
    throw new Error("Invalid email or password.");
  }
  
  setSession(user);
  await writeAuditLog(user.employee_id, "Logged in successfully.");
  return getCurrentSession();
}

export async function logout() {
  const session = getCurrentSession();
  if (session) {
    await writeAuditLog(session.employeeId, "Logged out.");
    clearSession();
  }
}

export async function resetPasswordWithSecurityCheck(email, employeeId, newPassword) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('employee_id', employeeId.toUpperCase().trim())
    .single();
  
  if (error || !user) {
    throw new Error("Security verification failed. Match not found.");
  }
  
  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
  
  const hashedPassword = await hashPassword(newPassword);
  const { error: updateError } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('employee_id', user.employee_id);
    
  if (updateError) throw new Error("Failed to reset password: " + updateError.message);
  
  await writeAuditLog(user.employee_id, "Password reset via security recovery.");
  return true;
}

// ================= WORKER MANAGEMENT (ADMIN ONLY) =================
export async function registerWorker(workerData) {
  const admin = await authorize(MANAGER_ROLES);
  
  const { employeeId, name, email, password, department, role } = workerData;
  if (!employeeId || !name || !email || !password || !department || !role) {
    throw new Error("All fields are required.");
  }
  
  // Hierarchy Check
  if (!canManageUser(admin.role, role)) {
    throw new Error(`Unauthorized: You do not have permission to register a worker with role "${role}".`);
  }
  
  const hashedPassword = await hashPassword(password);
  const newUser = {
    employee_id: employeeId.toUpperCase().trim(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    department: department,
    role: role,
    status: 'Active'
  };
  
  const { error } = await supabase.from('users').insert([newUser]);
  if (error) {
    if (error.code === '23505') {
      throw new Error("Employee ID or Email is already registered.");
    }
    throw new Error(error.message);
  }
  
  await writeAuditLog(admin.employeeId, `Registered new user: ${name} (${employeeId})`);
  return newUser;
}

export async function editWorker(employeeId, updatedData) {
  const admin = await authorize(MANAGER_ROLES);
  
  // Fetch target user's current role
  const { data: targetUser, error: fetchErr } = await supabase
    .from('users')
    .select('role')
    .eq('employee_id', employeeId)
    .single();
    
  if (fetchErr || !targetUser) throw new Error("Target employee profile not found.");
  
  // Hierarchy check on current level
  if (!canManageUser(admin.role, targetUser.role)) {
    throw new Error("Unauthorized: You do not have permission to edit this level of employee.");
  }
  
  // Hierarchy check on new level (prevent illegal promotions)
  if (!canManageUser(admin.role, updatedData.role)) {
    throw new Error(`Unauthorized: You cannot assign a role level ("${updatedData.role}") higher than or equal to your own.`);
  }
  
  const updatePayload = {
    name: updatedData.name?.trim(),
    email: updatedData.email?.toLowerCase().trim(),
    department: updatedData.department,
    role: updatedData.role,
    status: updatedData.status
  };
  
  const { data, error } = await supabase
    .from('users')
    .update(updatePayload)
    .eq('employee_id', employeeId)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  await writeAuditLog(admin.employeeId, `Updated user info for: ${updatedData.name} (${employeeId})`);
  return {
    employeeId: data.employee_id,
    name: data.name,
    email: data.email,
    department: data.department,
    role: data.role,
    status: data.status
  };
}

export async function removeWorker(employeeId) {
  const admin = await authorize(MANAGER_ROLES);
  if (employeeId === admin.employeeId) throw new Error("You cannot delete your own account.");
  
  // Fetch target user's current role
  const { data: targetUser, error: fetchErr } = await supabase
    .from('users')
    .select('name, role')
    .eq('employee_id', employeeId)
    .single();
    
  if (fetchErr || !targetUser) throw new Error("Target employee profile not found.");
  
  // Hierarchy check
  if (!canManageUser(admin.role, targetUser.role)) {
    throw new Error("Unauthorized: You do not have permission to remove this level of employee.");
  }
  
  const { error } = await supabase.from('users').delete().eq('employee_id', employeeId);
  if (error) throw new Error(error.message);
  
  await writeAuditLog(admin.employeeId, `Removed user: ${targetUser.name} (${employeeId})`);
}

export async function adminResetPassword(employeeId, newPassword) {
  const admin = await authorize(MANAGER_ROLES);
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
  
  // Fetch target user's current role
  const { data: targetUser, error: fetchErr } = await supabase
    .from('users')
    .select('name, role')
    .eq('employee_id', employeeId)
    .single();
    
  if (fetchErr || !targetUser) throw new Error("Target employee profile not found.");
  
  // Hierarchy check
  if (!canManageUser(admin.role, targetUser.role)) {
    throw new Error("Unauthorized: You do not have permission to reset password for this level of employee.");
  }
  
  const hashedPassword = await hashPassword(newPassword);
  
  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('employee_id', employeeId);
  
  if (error) throw new Error(error.message);
  
  await writeAuditLog(admin.employeeId, `Reset password for user: ${targetUser.name} (${employeeId})`);
}

export async function getUsers() {
  await authorize(MANAGER_ROLES);
  const { data, error } = await supabase.from('users').select('*').order('employee_id');
  if (error) throw new Error(error.message);
  
  return data.map(u => ({
    employeeId: u.employee_id,
    name: u.name,
    email: u.email,
    department: u.department,
    role: u.role,
    status: u.status
  }));
}

// ================= SECTION MANAGEMENT (ADMIN ONLY CRUD / WORKER READ) =================
export async function getSections() {
  await authorize(ALL_ROLES);
  const { data, error } = await supabase.from('sections').select('*').order('order_num');
  if (error) throw new Error(error.message);
  
  return data.map(s => ({
    id: s.id,
    title: s.title,
    order: s.order_num,
    targetCategory: s.target_category || 'Both'
  }));
}

export async function saveSection(sectionData) {
  const admin = await authorize(MANAGEMENT_ROLES);
  
  if (!sectionData.title || !sectionData.title.trim()) {
    throw new Error("Section title is required.");
  }
  
  const targetCategory = sectionData.targetCategory || 'Both';
  
  if (sectionData.id) {
    // Update
    const { data, error } = await supabase
      .from('sections')
      .update({ 
        title: sectionData.title.trim(),
        target_category: targetCategory
      })
      .eq('id', sectionData.id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    await writeAuditLog(admin.employeeId, `Renamed section to: "${sectionData.title}" (Target: ${targetCategory})`);
    return { id: data.id, title: data.title, order: data.order_num, targetCategory: data.target_category };
  } else {
    // Create
    const { data: sections } = await supabase.from('sections').select('order_num');
    const maxOrder = sections ? sections.reduce((max, s) => s.order_num > max ? s.order_num : max, 0) : 0;
    
    const newSection = {
      id: `sec-${Date.now()}`,
      title: sectionData.title.trim(),
      order_num: maxOrder + 1,
      target_category: targetCategory
    };
    
    const { error } = await supabase.from('sections').insert([newSection]);
    if (error) throw new Error(error.message);
    
    await writeAuditLog(admin.employeeId, `Created section: "${newSection.title}" (Target: ${newSection.target_category})`);
    return { id: newSection.id, title: newSection.title, order: newSection.order_num, targetCategory: newSection.target_category };
  }
}

export async function deleteSection(sectionId) {
  const admin = await authorize(MANAGEMENT_ROLES);
  
  const { data: sec } = await supabase.from('sections').select('title').eq('id', sectionId).single();
  const title = sec ? sec.title : "Unknown Section";
  
  const { error } = await supabase.from('sections').delete().eq('id', sectionId);
  if (error) throw new Error(error.message);
  
  await writeAuditLog(admin.employeeId, `Deleted section: "${title}" (and linked documents)`);
}

export async function reorderSections(sectionIds) {
  const admin = await authorize(MANAGEMENT_ROLES);
  
  for (let i = 0; i < sectionIds.length; i++) {
    const { error } = await supabase
      .from('sections')
      .update({ order_num: i + 1 })
      .eq('id', sectionIds[i]);
    if (error) throw new Error(error.message);
  }
  
  await writeAuditLog(admin.employeeId, "Reordered navigation sections.");
}

// ================= HANDBOOK DOCUMENT MANAGEMENT =================
export async function getDocuments(sectionId = null) {
  await authorize(ALL_ROLES);
  
  let query = supabase.from('documents').select('*').order('order_num');
  if (sectionId) {
    query = query.eq('section_id', sectionId);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  
  return data.map(d => ({
    id: d.id,
    sectionId: d.section_id,
    title: d.title,
    content: d.content,
    order: d.order_num,
    lastUpdated: d.last_updated
  }));
}

export async function getDocumentById(docId) {
  await authorize(ALL_ROLES);
  const { data, error } = await supabase.from('documents').select('*').eq('id', docId).single();
  if (error || !data) return null;
  
  return {
    id: data.id,
    sectionId: data.section_id,
    title: data.title,
    content: data.content,
    order: data.order_num,
    lastUpdated: data.last_updated
  };
}

export async function saveDocument(docData) {
  const admin = await authorize(MANAGEMENT_ROLES);
  
  if (!docData.title || !docData.title.trim()) throw new Error("Document title is required.");
  if (!docData.sectionId) throw new Error("Section assignment is required.");
  if (docData.content === undefined) throw new Error("Document content is empty.");
  
  if (docData.id) {
    // Update
    const payload = {
      title: docData.title.trim(),
      section_id: docData.sectionId,
      content: docData.content,
      last_updated: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('documents')
      .update(payload)
      .eq('id', docData.id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    await writeAuditLog(admin.employeeId, `Updated document: "${docData.title}" in section ID: ${docData.sectionId}`);
    return {
      id: data.id,
      sectionId: data.section_id,
      title: data.title,
      content: data.content,
      order: data.order_num,
      lastUpdated: data.last_updated
    };
  } else {
    // Create
    const { data: sectionDocs } = await supabase.from('documents').select('order_num').eq('section_id', docData.sectionId);
    const maxOrder = sectionDocs ? sectionDocs.reduce((max, d) => d.order_num > max ? d.order_num : max, 0) : 0;
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      section_id: docData.sectionId,
      title: docData.title.trim(),
      content: docData.content,
      order_num: maxOrder + 1,
      last_updated: new Date().toISOString()
    };
    
    const { error } = await supabase.from('documents').insert([newDoc]);
    if (error) throw new Error(error.message);
    
    await writeAuditLog(admin.employeeId, `Created document: "${newDoc.title}" in section ID: ${newDoc.sectionId}`);
    return {
      id: newDoc.id,
      sectionId: newDoc.section_id,
      title: newDoc.title,
      content: newDoc.content,
      order: newDoc.order_num,
      lastUpdated: newDoc.last_updated
    };
  }
}

export async function reorderDocuments(sectionId, documentIds) {
  const admin = await authorize(MANAGEMENT_ROLES);
  
  for (let i = 0; i < documentIds.length; i++) {
    const { error } = await supabase
      .from('documents')
      .update({ order_num: i + 1 })
      .eq('id', documentIds[i])
      .eq('section_id', sectionId);
    if (error) throw new Error(error.message);
  }
  
  await writeAuditLog(admin.employeeId, `Reordered documents in section ID: ${sectionId}`);
}

export async function deleteDocument(docId) {
  const admin = await authorize(MANAGEMENT_ROLES);
  const { data: doc } = await supabase.from('documents').select('title').eq('id', docId).single();
  const title = doc ? doc.title : "Unknown Document";
  
  const { error } = await supabase.from('documents').delete().eq('id', docId);
  if (error) throw new Error(error.message);
  
  await writeAuditLog(admin.employeeId, `Deleted document: "${title}"`);
}

// ================= FAQ INTERACTIVE DISCUSSION BOARD =================
export async function getFAQThreads() {
  await authorize(ALL_ROLES);
  const { data, error } = await supabase.from('faq_threads').select('*');
  if (error) throw new Error(error.message);
  
  return data.map(t => ({
    id: t.id,
    title: t.title,
    authorId: t.author_id,
    authorName: t.author_name,
    createdAt: t.created_at,
    resolved: t.resolved,
    pinnedReplyId: t.pinned_reply_id
  })).sort((a, b) => {
    const aPinned = a.pinnedReplyId ? 1 : 0;
    const bPinned = b.pinnedReplyId ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export async function getFAQReplies(threadId) {
  await authorize(ALL_ROLES);
  const { data, error } = await supabase
    .from('faq_replies')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at');
    
  if (error) throw new Error(error.message);
  
  return data.map(r => ({
    id: r.id,
    threadId: r.thread_id,
    authorId: r.author_id,
    authorName: r.author_name,
    content: r.content,
    createdAt: r.created_at
  }));
}

export async function createFAQThread(title) {
  const user = await authorize(ALL_ROLES);
  if (!title || !title.trim()) throw new Error("Thread title cannot be empty.");
  
  const newThread = {
    id: `faq-${Date.now()}`,
    title: title.trim(),
    author_id: user.employeeId,
    author_name: user.name,
    created_at: new Date().toISOString(),
    resolved: false,
    pinned_reply_id: null
  };
  
  const { error } = await supabase.from('faq_threads').insert([newThread]);
  if (error) throw new Error(error.message);
  
  await writeAuditLog(user.employeeId, `Created FAQ thread: "${newThread.title}"`);
  return {
    id: newThread.id,
    title: newThread.title,
    authorId: newThread.author_id,
    authorName: newThread.author_name,
    createdAt: newThread.created_at,
    resolved: newThread.resolved,
    pinnedReplyId: newThread.pinned_reply_id
  };
}

export async function replyToFAQThread(threadId, content) {
  const user = await authorize(ALL_ROLES);
  if (!content || !content.trim()) throw new Error("Reply content cannot be empty.");
  
  const { data: thread } = await supabase.from('faq_threads').select('title').eq('id', threadId).single();
  const title = thread ? thread.title : "Unknown Thread";
  
  const authorSuffix = MANAGER_ROLES.includes(user.role) ? ' (Admin)' : '';
  const newReply = {
    id: `rep-${Date.now()}`,
    thread_id: threadId,
    author_id: user.employeeId,
    author_name: `${user.name}${authorSuffix}`,
    content: content.trim(),
    created_at: new Date().toISOString()
  };
  
  const { error } = await supabase.from('faq_replies').insert([newReply]);
  if (error) throw new Error(error.message);
  
  await writeAuditLog(user.employeeId, `Replied to FAQ thread: "${title}"`);
  return {
    id: newReply.id,
    threadId: newReply.thread_id,
    authorId: newReply.author_id,
    authorName: newReply.author_name,
    content: newReply.content,
    createdAt: newReply.created_at
  };
}

export async function toggleFAQThreadResolved(threadId) {
  const user = await authorize(MANAGER_ROLES);
  const { data: thread, error: getErr } = await supabase.from('faq_threads').select('*').eq('id', threadId).single();
  if (getErr || !thread) throw new Error("FAQ thread not found.");
  
  const nextResolved = !thread.resolved;
  const { data, error } = await supabase
    .from('faq_threads')
    .update({ resolved: nextResolved })
    .eq('id', threadId)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  await writeAuditLog(user.employeeId, `Marked FAQ thread "${thread.title}" as ${nextResolved ? 'Resolved' : 'Open'}`);
  return {
    id: data.id,
    title: data.title,
    authorId: data.author_id,
    authorName: data.author_name,
    createdAt: data.created_at,
    resolved: data.resolved,
    pinnedReplyId: data.pinned_reply_id
  };
}

export async function pinFAQReply(threadId, replyId) {
  const user = await authorize(MANAGER_ROLES);
  
  const { data: thread, error: getErr } = await supabase.from('faq_threads').select('*').eq('id', threadId).single();
  if (getErr || !thread) throw new Error("FAQ thread not found.");
  
  const { error } = await supabase
    .from('faq_threads')
    .update({ pinned_reply_id: replyId })
    .eq('id', threadId);
    
  if (error) throw new Error(error.message);
  await writeAuditLog(user.employeeId, `${replyId ? 'Pinned' : 'Unpinned'} reply in FAQ thread: "${thread.title}"`);
}

export async function deleteFAQThread(threadId) {
  const user = await authorize(MANAGER_ROLES);
  const { data: thread } = await supabase.from('faq_threads').select('title').eq('id', threadId).single();
  const title = thread ? thread.title : "Unknown Thread";
  
  const { error } = await supabase.from('faq_threads').delete().eq('id', threadId);
  if (error) throw new Error(error.message);
  
  await writeAuditLog(user.employeeId, `Deleted FAQ thread: "${title}"`);
}

export async function deleteFAQReply(replyId) {
  const user = await authorize(MANAGER_ROLES);
  
  const { data: reply } = await supabase.from('faq_replies').select('thread_id').eq('id', replyId).single();
  if (!reply) throw new Error("Reply not found.");
  
  const { error } = await supabase.from('faq_replies').delete().eq('id', replyId);
  if (error) throw new Error(error.message);
  
  // Unpin if it was pinned
  const { data: thread } = await supabase.from('faq_threads').select('pinned_reply_id').eq('id', reply.thread_id).single();
  if (thread && thread.pinned_reply_id === replyId) {
    await supabase.from('faq_threads').update({ pinned_reply_id: null }).eq('id', reply.thread_id);
  }
  
  await writeAuditLog(user.employeeId, `Deleted reply on thread ID: ${reply.thread_id}`);
}

// ================= AUDIT LOGS (ADMIN ONLY) =================
export async function getAuditLogs() {
  await authorize(MANAGER_ROLES);
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
  if (error) throw new Error(error.message);
  
  return data.map(log => ({
    id: log.id,
    userId: log.user_id,
    userName: log.user_name,
    action: log.action,
    timestamp: log.timestamp
  }));
}
