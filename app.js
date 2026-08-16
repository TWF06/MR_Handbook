import * as DB from './db.js?v=3';

// ==========================================================================
// STATE MANAGEMENT & ROUTING
// ==========================================================================
let currentSession = null;
let currentView = 'auth'; // auth, worker, faq, admin, search
let currentSectionId = null;
let currentDocumentId = null;
let currentFAQThreadId = null;
let activeAdminTab = 'admin-tab-dash';
let lastViewBeforeSearch = 'worker'; // Keeps track of where to return after clear search

// Department and Roles configurations
const DEPT_ROLES = {
  'Management': ['Director', 'HR', 'Administrative'],
  'BOH': ['BOH Manager', 'CDP', 'SOUS', 'BOH Crew'],
  'FOH': ['FOH Manager', 'Waiter', 'Barista']
};

function hasDashboardAccess(role) {
  return ['Director', 'HR', 'Administrative', 'BOH Manager', 'FOH Manager'].includes(role);
}

function hasFullAdminAccess(role) {
  return ['Director', 'HR', 'Administrative'].includes(role);
}

function populateRolesDropdown(deptVal, selectedRoleVal = null) {
  const roleSelect = document.getElementById('crud-worker-role');
  if (!roleSelect) return;
  roleSelect.innerHTML = '';
  const roles = DEPT_ROLES[deptVal] || [];
  roles.forEach(role => {
    const opt = document.createElement('option');
    opt.value = role;
    opt.textContent = role;
    if (selectedRoleVal && role === selectedRoleVal) {
      opt.selected = true;
    }
    roleSelect.appendChild(opt);
  });
}

// UI Selectors
const el = {
  viewAuth: document.getElementById('view-auth'),
  viewWorkspace: document.getElementById('view-workspace'),
  formLogin: document.getElementById('form-login'),
  formRecover: document.getElementById('form-recover'),
  btnShowRecover: document.getElementById('btn-show-recover'),
  btnShowLogin: document.getElementById('btn-show-login'),
  btnToggleTheme: document.getElementById('btn-toggle-theme'),
  btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
  sidebarLeft: document.getElementById('sidebar-left'),
  sidebarRightTOC: document.getElementById('sidebar-right-toc'),
  btnFloatingTOC: document.getElementById('btn-floating-toc'),
  leftNavSections: document.getElementById('left-nav-sections'),
  contentContainer: document.getElementById('content-container'),
  
  // Headers
  navUserName: document.getElementById('nav-user-name'),
  navUserRole: document.getElementById('nav-user-role'),
  userBadgeName: document.getElementById('user-badge-name'),
  btnGoAdmin: document.getElementById('btn-go-admin'),
  btnGoWorker: document.getElementById('btn-go-worker'),
  btnLogout: document.getElementById('btn-logout'),
  globalSearch: document.getElementById('global-search'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  
  // Panes
  paneWorker: document.getElementById('pane-worker-viewer'),
  paneFAQ: document.getElementById('pane-faq-board'),
  paneAdmin: document.getElementById('pane-admin-portal'),
  paneSearch: document.getElementById('pane-search-results'),
  
  // Search
  searchResultsSummary: document.getElementById('search-results-summary'),
  searchResultsList: document.getElementById('search-results-list'),
  btnCloseSearch: document.getElementById('btn-close-search'),
  
  // Viewer
  viewerBreadcrumbs: document.getElementById('viewer-breadcrumbs'),
  docTitleView: document.getElementById('doc-title-view'),
  docTimestampView: document.getElementById('doc-timestamp-view'),
  docMarkdownBody: document.getElementById('doc-markdown-body'),
  rightTOCList: document.getElementById('right-toc-list'),
  btnNavPrev: document.getElementById('btn-nav-prev'),
  btnNavPrevTitle: document.getElementById('btn-nav-prev-title'),
  btnNavNext: document.getElementById('btn-nav-next'),
  btnNavNextTitle: document.getElementById('btn-nav-next-title'),
  
  // FAQ
  btnCreateThread: document.getElementById('btn-create-thread'),
  faqThreadSearch: document.getElementById('faq-thread-search'),
  faqThreadsContainer: document.getElementById('faq-threads-container'),
  faqStreamEmpty: document.getElementById('faq-stream-empty'),
  faqStreamActive: document.getElementById('faq-stream-active'),
  activeThreadBadge: document.getElementById('active-thread-badge'),
  activeThreadTitle: document.getElementById('active-thread-title'),
  activeThreadAuthor: document.getElementById('active-thread-author'),
  activeThreadDate: document.getElementById('active-thread-date'),
  activeThreadAdminOptions: document.getElementById('active-thread-admin-options'),
  btnAdminResolveThread: document.getElementById('btn-admin-resolve-thread'),
  btnAdminDeleteThread: document.getElementById('btn-admin-delete-thread'),
  faqRepliesContainer: document.getElementById('faq-replies-container'),
  formFaqReply: document.getElementById('form-faq-reply'),
  faqReplyText: document.getElementById('faq-reply-text'),
  
  // Modals
  modalWorkerCrud: document.getElementById('modal-worker-crud'),
  formWorkerCrud: document.getElementById('form-worker-crud'),
  modalWorkerResetPwd: document.getElementById('modal-worker-reset-pwd'),
  formAdminResetPwd: document.getElementById('form-admin-reset-pwd'),
  modalFAQThread: document.getElementById('modal-faq-thread'),
  formFAQThreadCreate: document.getElementById('form-faq-thread-create'),
  
  // Admin Tabs & Controls
  tabButtons: document.querySelectorAll('.tab-btn'),
  adminTabContents: document.querySelectorAll('.admin-tab-content'),
  statTotalWorkers: document.getElementById('stat-total-workers'),
  statActiveWorkers: document.getElementById('stat-active-workers'),
  statTotalSections: document.getElementById('stat-total-sections'),
  statTotalDocs: document.getElementById('stat-total-docs'),
  statUnansweredFAQ: document.getElementById('stat-unanswered-faq'),
  dashRecentActivity: document.getElementById('dash-recent-activity'),
  btnAdminResetDB: document.getElementById('btn-admin-reset-db'),
  
  // Admin Worker Management
  adminWorkerSearch: document.getElementById('admin-worker-search'),
  adminWorkersTableBody: document.getElementById('admin-workers-table-body'),
  btnAdminAddWorker: document.getElementById('btn-admin-add-worker'),
  
  // Admin Sections
  adminSectionsListBody: document.getElementById('admin-sections-list-body'),
  adminSectionFormTitle: document.getElementById('admin-section-form-title'),
  formAdminSection: document.getElementById('form-admin-section'),
  adminSectionId: document.getElementById('admin-section-id'),
  adminSectionTitle: document.getElementById('admin-section-title'),
  btnAdminCancelSection: document.getElementById('btn-admin-cancel-section'),
  
  // Admin Documents
  adminDocSelectSection: document.getElementById('admin-doc-select-section'),
  btnAdminNewDoc: document.getElementById('btn-admin-new-doc'),
  adminDocsListBody: document.getElementById('admin-docs-list-body'),
  adminDocEditorPanel: document.getElementById('admin-doc-editor-panel'),
  adminDocEmpty: document.getElementById('admin-doc-empty'),
  formAdminDoc: document.getElementById('form-admin-doc'),
  adminDocId: document.getElementById('admin-doc-id'),
  adminDocTitle: document.getElementById('admin-doc-title'),
  adminDocSection: document.getElementById('admin-doc-section'),
  adminDocFileUpload: document.getElementById('admin-doc-file-upload'),
  uploadFilename: document.getElementById('upload-filename'),
  btnAdminDocPreview: document.getElementById('btn-admin-doc-preview'),
  adminDocMarkdown: document.getElementById('admin-doc-markdown'),
  editorWriteArea: document.getElementById('editor-write-area'),
  editorPreviewArea: document.getElementById('editor-preview-area'),
  btnAdminDeleteDoc: document.getElementById('btn-admin-delete-doc'),
  
  // Admin Audit
  btnAdminRefreshAudit: document.getElementById('btn-admin-refresh-audit'),
  adminAuditTableBody: document.getElementById('admin-audit-table-body'),
  
  // Google Sync UI
  formGoogleSyncConfig: document.getElementById('form-google-sync-config'),
  syncClientId: document.getElementById('sync-client-id'),
  syncApiKey: document.getElementById('sync-api-key'),
  syncFolderId: document.getElementById('sync-folder-id'),
  syncStatusLight: document.getElementById('sync-status-light'),
  syncStatusText: document.getElementById('sync-status-text'),
  syncHelperText: document.getElementById('sync-helper-text'),
  btnSyncAuthorize: document.getElementById('btn-sync-authorize'),
  btnSyncRun: document.getElementById('btn-sync-run')
};

// Toast notification helper
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'danger') icon = 'alert-triangle';
  if (type === 'warning') icon = 'alert-circle';
  
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close"><i data-lucide="x"></i></button>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  // Auto remove
  const timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeout);
    toast.remove();
  });
}

// App routing controller
async function switchView(viewName) {
  currentView = viewName;
  
  // Hide all main panes
  el.paneWorker.classList.add('hidden');
  el.paneFAQ.classList.add('hidden');
  el.paneAdmin.classList.add('hidden');
  el.paneSearch.classList.add('hidden');
  
  if (viewName === 'worker') {
    el.paneWorker.classList.remove('hidden');
    await loadDocumentViewer();
  } else if (viewName === 'faq') {
    el.paneFAQ.classList.remove('hidden');
    await loadFAQBoard();
  } else if (viewName === 'admin') {
    el.paneAdmin.classList.remove('hidden');
    await loadAdminTab(activeAdminTab);
  } else if (viewName === 'search') {
    el.paneSearch.classList.remove('hidden');
  }
  
  // Toggle Admin/Worker buttons in user dropdown header
  if (currentSession && hasDashboardAccess(currentSession.role)) {
    if (viewName === 'admin') {
      el.btnGoAdmin.classList.add('hidden');
      el.btnGoWorker.classList.remove('hidden');
    } else {
      el.btnGoAdmin.classList.remove('hidden');
      el.btnGoWorker.classList.add('hidden');
    }
  } else {
    el.btnGoAdmin.classList.add('hidden');
    el.btnGoWorker.classList.add('hidden');
  }

  // Update sidebar active highlights
  updateLeftSidebarActiveItem();
  lucide.createIcons();
}

// Check logged in user and show correct app frame
async function checkAuth() {
  currentSession = DB.getCurrentSession();
  if (currentSession) {
    el.viewAuth.classList.add('hidden');
    el.viewWorkspace.classList.remove('hidden');
    
    // Set user header details
    el.navUserName.textContent = currentSession.name;
    el.navUserRole.textContent = currentSession.role;
    el.userBadgeName.textContent = currentSession.name.charAt(0).toUpperCase();
    
    try {
      await DB.initializeDatabase();
      await buildLeftSidebar();
      
      // Load default section and doc from memory or local state
      const sections = await DB.getSections();
      const allowedSections = sections.filter(sec => {
        if (!currentSession) return false;
        if (currentSession.department === 'Management') return true;
        if (currentSession.department === 'BOH') return sec.targetCategory === 'BOH' || sec.targetCategory === 'Both';
        if (currentSession.department === 'FOH') return sec.targetCategory === 'FOH' || sec.targetCategory === 'Both';
        return false;
      });
      
      if (allowedSections.length > 0) {
        currentSectionId = allowedSections[0].id;
        const docs = await DB.getDocuments(currentSectionId);
        if (docs.length > 0) {
          currentDocumentId = docs[0].id;
        }
      }
      
      // If admin/manager, land on dashboard first. Otherwise, worker portal
      if (hasDashboardAccess(currentSession.role)) {
        await switchView('admin');
      } else {
        await switchView('worker');
      }
    } catch (err) {
      console.error("Auth initialization failed:", err);
      DB.clearSession();
      el.viewWorkspace.classList.add('hidden');
      el.viewAuth.classList.remove('hidden');
      switchAuthForm('login');
    }
    
  } else {
    el.viewWorkspace.classList.add('hidden');
    el.viewAuth.classList.remove('hidden');
    switchAuthForm('login');
  }
  lucide.createIcons();
}

function switchAuthForm(form) {
  if (form === 'login') {
    el.formLogin.classList.remove('hidden');
    el.formRecover.classList.add('hidden');
    document.getElementById('auth-subtitle').textContent = "Sign in to access secure company documentation";
  } else {
    el.formLogin.classList.add('hidden');
    el.formRecover.classList.remove('hidden');
    document.getElementById('auth-subtitle').textContent = "Verify details to set a new password";
  }
}

// ==========================================================================
// THEME & INTERFACE INTERACTION
// ==========================================================================
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark-mode');
  
  if (isDark) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    el.btnToggleTheme.querySelector('.theme-icon-dark').classList.remove('hidden');
    el.btnToggleTheme.querySelector('.theme-icon-light').classList.add('hidden');
    localStorage.setItem('mrhb_theme', 'light');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    el.btnToggleTheme.querySelector('.theme-icon-dark').classList.add('hidden');
    el.btnToggleTheme.querySelector('.theme-icon-light').classList.remove('hidden');
    localStorage.setItem('mrhb_theme', 'dark');
  }
}

// Load persisted theme preference
function loadPersistedTheme() {
  const theme = localStorage.getItem('mrhb_theme') || 'light';
  if (theme === 'dark') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    el.btnToggleTheme.querySelector('.theme-icon-dark').classList.add('hidden');
    el.btnToggleTheme.querySelector('.theme-icon-light').classList.remove('hidden');
  }
}

// Mobile sidebar responsiveness
el.btnToggleSidebar.addEventListener('click', (e) => {
  e.stopPropagation();
  el.sidebarLeft.classList.toggle('mobile-open');
});
document.addEventListener('click', (e) => {
  // If clicked outside, close mobile menus
  if (!el.sidebarLeft.contains(e.target) && e.target !== el.btnToggleSidebar) {
    el.sidebarLeft.classList.remove('mobile-open');
  }
  if (!el.sidebarRightTOC.contains(e.target) && e.target !== el.btnFloatingTOC) {
    el.sidebarRightTOC.classList.remove('mobile-open');
  }
});
el.btnFloatingTOC.addEventListener('click', (e) => {
  e.stopPropagation();
  el.sidebarRightTOC.classList.toggle('mobile-open');
});

// ==========================================================================
// SIDEBAR BUILDER & EVENTS
// ==========================================================================
async function buildLeftSidebar() {
  try {
    const sections = await DB.getSections();
    el.leftNavSections.innerHTML = '';
    
    const session = DB.getCurrentSession();
    const allowedSections = sections.filter(sec => {
      if (!session) return false;
      if (session.department === 'Management') return true;
      if (session.department === 'BOH') return sec.targetCategory === 'BOH' || sec.targetCategory === 'Both';
      if (session.department === 'FOH') return sec.targetCategory === 'FOH' || sec.targetCategory === 'Both';
      return false;
    });
    
    for (const sec of allowedSections) {
      const docs = await DB.getDocuments(sec.id);
      
      const secItem = document.createElement('div');
      secItem.className = 'sidebar-section-group';
      
      const isSecActive = (currentSectionId === sec.id && currentView === 'worker');
      const btnSec = document.createElement('button');
      btnSec.className = `nav-item ${isSecActive ? 'active' : ''}`;
      btnSec.dataset.sectionId = sec.id;
      
      let displayTitle = sec.title;
      if (session && session.department === 'Management') {
        displayTitle += ` [${sec.targetCategory}]`;
      }
      
      btnSec.innerHTML = `
        <div class="nav-item-content">
          <i data-lucide="folder"></i>
          <span>${displayTitle}</span>
        </div>
        <i data-lucide="chevron-right" class="chevron-indicator ${isSecActive ? 'rotated' : ''}"></i>
      `;
      
      const subList = document.createElement('div');
      subList.className = `sub-nav-list ${isSecActive ? '' : 'hidden'}`;
      
      docs.forEach(doc => {
        const btnDoc = document.createElement('button');
        btnDoc.className = `sub-nav-item ${currentDocumentId === doc.id && isSecActive ? 'active' : ''}`;
        btnDoc.dataset.docId = doc.id;
        btnDoc.textContent = doc.title;
        
        btnDoc.addEventListener('click', async () => {
          currentSectionId = sec.id;
          currentDocumentId = doc.id;
          await switchView('worker');
        });
        subList.appendChild(btnDoc);
      });
      
      btnSec.addEventListener('click', async () => {
        const isExpanded = !subList.classList.contains('hidden');
        document.querySelectorAll('.sub-nav-list').forEach(l => l.classList.add('hidden'));
        document.querySelectorAll('.chevron-indicator').forEach(c => c.style.transform = 'rotate(0deg)');
        
        if (!isExpanded) {
          subList.classList.remove('hidden');
          btnSec.querySelector('.chevron-indicator').style.transform = 'rotate(90deg)';
        }
        
        if (docs.length > 0) {
          currentSectionId = sec.id;
          currentDocumentId = docs[0].id;
          await switchView('worker');
        }
      });
      
      secItem.appendChild(btnSec);
      secItem.appendChild(subList);
      el.leftNavSections.appendChild(secItem);
    }
    
    const faqItem = document.createElement('button');
    faqItem.className = `nav-item ${currentView === 'faq' ? 'active' : ''}`;
    faqItem.id = 'left-nav-faq-trigger';
    faqItem.innerHTML = `
      <div class="nav-item-content">
        <i data-lucide="message-square"></i>
        <span>FAQ Discussion</span>
      </div>
    `;
    faqItem.addEventListener('click', async () => {
      await switchView('faq');
    });
    el.leftNavSections.appendChild(faqItem);
    
    lucide.createIcons();
  } catch (err) {
    showToast("Sidebar Error", err.message, "danger");
  }
}

function updateLeftSidebarActiveItem() {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.sub-nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.sub-nav-list').forEach(l => l.classList.add('hidden'));
  document.querySelectorAll('.chevron-indicator').forEach(c => c.style.transform = 'rotate(0deg)');
  
  if (currentView === 'worker') {
    const parentBtn = document.querySelector(`.nav-item[data-section-id="${currentSectionId}"]`);
    if (parentBtn) {
      parentBtn.classList.add('active');
      parentBtn.querySelector('.chevron-indicator').style.transform = 'rotate(90deg)';
      const subList = parentBtn.nextElementSibling;
      if (subList) subList.classList.remove('hidden');
    }
    const docBtn = document.querySelector(`.sub-nav-item[data-doc-id="${currentDocumentId}"]`);
    if (docBtn) docBtn.classList.add('active');
    
  } else if (currentView === 'faq') {
    const faqBtn = document.getElementById('left-nav-faq-trigger');
    if (faqBtn) faqBtn.classList.add('active');
  }
}

// ==========================================================================
// DOCUMENT VIEWER & HEADINGS TOC RENDERER
// ==========================================================================
async function loadDocumentViewer() {
  if (!currentDocumentId) {
    el.docTitleView.textContent = "Welcome";
    el.docMarkdownBody.innerHTML = "<p class='text-muted'>Select a section from the left navigation panel to start reading.</p>";
    el.docTimestampView.textContent = "N/A";
    el.btnNavPrev.style.display = 'none';
    el.btnNavNext.style.display = 'none';
    return;
  }
  
  try {
    const doc = await DB.getDocumentById(currentDocumentId);
    if (!doc) throw new Error("Document not found.");
    
    // Breadcrumbs
    const sections = await DB.getSections();
    const section = sections.find(s => s.id === doc.sectionId);
    el.viewerBreadcrumbs.innerHTML = `
      <span>${section ? section.title : 'Unknown'}</span>
      <span class="breadcrumb-separator">/</span>
      <span>${doc.title}</span>
    `;
    
    el.docTitleView.textContent = doc.title;
    
    // Timestamp
    const formattedDate = new Date(doc.lastUpdated).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    el.docTimestampView.textContent = formattedDate;
    
    // Render Markdown securely
    const rawHTML = marked.parse(doc.content);
    const safeHTML = DOMPurify.sanitize(rawHTML);
    el.docMarkdownBody.innerHTML = safeHTML;
    
    // Generate Right TOC from Headings
    generateTableOfContents();
    
    // Calculate Previous & Next document anchors
    await setupDocNavigationFooter(doc);
    
    lucide.createIcons();
    
  } catch (err) {
    showToast("Viewer Error", err.message, "danger");
  }
}

function generateTableOfContents() {
  el.rightTOCList.innerHTML = '';
  
  // Find all headings inside the rendered article body
  const headings = el.docMarkdownBody.querySelectorAll('h1, h2, h3');
  
  if (headings.length === 0) {
    el.rightTOCList.innerHTML = '<span class="text-muted text-sm">No headings found on this page.</span>';
    el.btnFloatingTOC.classList.add('hidden');
    return;
  }
  
  el.btnFloatingTOC.classList.remove('hidden');
  
  headings.forEach((heading, idx) => {
    // Generate clean text-based ID anchor
    const cleanId = heading.textContent.toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')     // spaces to dashes
      .trim() + `-${idx}`;      // append unique index to avoid duplication
      
    heading.id = cleanId;
    
    // Create TOC link
    const link = document.createElement('a');
    link.href = `#${cleanId}`;
    link.className = 'toc-link';
    link.textContent = heading.textContent;
    
    // Indentation based on heading level
    if (heading.tagName === 'H2') link.classList.add('indent-2');
    if (heading.tagName === 'H3') link.classList.add('indent-3');
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth' });
      el.sidebarRightTOC.classList.remove('mobile-open'); // Close drawer if mobile
      
      // Update active class manually
      document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
    
    el.rightTOCList.appendChild(link);
  });
  
  // Hook up scroll listener to highlight current section
  el.contentContainer.addEventListener('scroll', highlightTOCScroll);
  highlightTOCScroll(); // Run once initially
}

function highlightTOCScroll() {
  const headings = el.docMarkdownBody.querySelectorAll('h1, h2, h3');
  const links = el.rightTOCList.querySelectorAll('.toc-link');
  
  if (headings.length === 0 || links.length === 0) return;
  
  let activeIndex = 0;
  const containerTop = el.contentContainer.scrollTop;
  
  // Find heading closest to top of scrolling viewport
  for (let i = 0; i < headings.length; i++) {
    const offset = headings[i].offsetTop;
    // Buffer offset to make it trigger a bit before hitting top
    if (containerTop >= offset - 100) {
      activeIndex = i;
    } else {
      break;
    }
  }
  
  links.forEach(l => l.classList.remove('active'));
  if (links[activeIndex]) {
    links[activeIndex].classList.add('active');
  }
}

async function setupDocNavigationFooter(currentDoc) {
  const allDocs = await DB.getDocuments(); // Fetched sorted by section and order
  const idx = allDocs.findIndex(d => d.id === currentDoc.id);
  
  // Previous button
  if (idx > 0) {
    el.btnNavPrev.style.display = 'flex';
    const prevDoc = allDocs[idx - 1];
    el.btnNavPrevTitle.textContent = prevDoc.title;
    // Update click action
    el.btnNavPrev.onclick = async () => {
      currentSectionId = prevDoc.sectionId;
      currentDocumentId = prevDoc.id;
      el.contentContainer.scrollTop = 0;
      await switchView('worker');
    };
  } else {
    el.btnNavPrev.style.display = 'none';
  }
  
  // Next button
  if (idx !== -1 && idx < allDocs.length - 1) {
    el.btnNavNext.style.display = 'flex';
    const nextDoc = allDocs[idx + 1];
    el.btnNavNextTitle.textContent = nextDoc.title;
    el.btnNavNext.onclick = async () => {
      currentSectionId = nextDoc.sectionId;
      currentDocumentId = nextDoc.id;
      el.contentContainer.scrollTop = 0;
      await switchView('worker');
    };
  } else {
    el.btnNavNext.style.display = 'none';
  }
}

// ==========================================================================
// SEARCH ENGINE WITH HIGH-FIDELITY KEYWORD HIGHLIGHTING
// ==========================================================================
async function performGlobalSearch(query) {
  if (!query || !query.trim()) {
    await switchView(lastViewBeforeSearch);
    el.btnClearSearch.classList.add('hidden');
    return;
  }
  
  el.btnClearSearch.classList.remove('hidden');
  
  // Save position where they were to go back if canceled
  if (currentView !== 'search') {
    lastViewBeforeSearch = currentView;
    await switchView('search');
  }
  
  const sections = await DB.getSections();
  const docs = await DB.getDocuments();
  const searchResults = [];
  const q = query.toLowerCase().trim();
  
  // 1. Search in documents
  docs.forEach(doc => {
    const titleMatch = doc.title.toLowerCase().includes(q);
    const contentMatch = doc.content.toLowerCase().includes(q);
    const parentSection = sections.find(s => s.id === doc.sectionId);
    
    if (titleMatch || contentMatch) {
      // Compile hit snippet with highlights
      let snippet = "";
      
      if (contentMatch) {
        const text = doc.content;
        const index = text.toLowerCase().indexOf(q);
        // Take snippet around the match
        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + q.length + 80);
        
        let snippetRaw = text.substring(start, end);
        if (start > 0) snippetRaw = "..." + snippetRaw;
        if (end < text.length) snippetRaw = snippetRaw + "...";
        
        // Highlight logic (case-insensitive replace)
        const regex = new RegExp(`(${escapeRegExp(q)})`, 'gi');
        snippet = snippetRaw.replace(regex, '<mark>$1</mark>');
      } else {
        // Just show first 120 chars
        snippet = doc.content.substring(0, 120) + "...";
      }
      
      searchResults.push({
        type: 'document',
        docId: doc.id,
        sectionId: doc.sectionId,
        sectionTitle: parentSection ? parentSection.title : "General",
        title: doc.title,
        snippet: snippet
      });
    }
  });
  
  // Render results
  el.searchResultsSummary.textContent = `Found ${searchResults.length} matching entries.`;
  el.searchResultsList.innerHTML = '';
  
  if (searchResults.length === 0) {
    el.searchResultsList.innerHTML = `
      <div class="faq-empty-state">
        <i data-lucide="search-code"></i>
        <h3>No results found</h3>
        <p>Try using different keywords or checking spelling.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  searchResults.forEach(res => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `
      <div class="result-header">
        <span class="result-crumbs">${res.sectionTitle}</span>
        <span class="badge badge-worker">Document</span>
      </div>
      <h4 class="result-title">${res.title}</h4>
      <p class="result-snippet">${res.snippet}</p>
    `;
    
    card.addEventListener('click', () => {
      // Clear search inputs and view doc
      el.globalSearch.value = '';
      el.btnClearSearch.classList.add('hidden');
      currentSectionId = res.sectionId;
      currentDocumentId = res.docId;
      switchView('worker');
    });
    
    el.searchResultsList.appendChild(card);
  });
  
  lucide.createIcons();
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Header Clear Search Button
el.btnClearSearch.addEventListener('click', async () => {
  el.globalSearch.value = '';
  await performGlobalSearch('');
});
el.btnCloseSearch.addEventListener('click', async () => {
  el.globalSearch.value = '';
  await performGlobalSearch('');
});
el.globalSearch.addEventListener('input', async (e) => {
  await performGlobalSearch(e.target.value);
});

// ==========================================================================
// FAQ DISCUSSION BOARD ENGINE
// ==========================================================================
async function loadFAQBoard() {
  await buildFAQThreadsList();
  
  if (currentFAQThreadId) {
    await loadFAQThreadStream(currentFAQThreadId);
  } else {
    el.faqStreamEmpty.classList.remove('hidden');
    el.faqStreamActive.classList.add('hidden');
  }
}

async function buildFAQThreadsList() {
  try {
    const threads = await DB.getFAQThreads();
    const filterText = el.faqThreadSearch.value.toLowerCase().trim();
    
    el.faqThreadsContainer.innerHTML = '';
    
    const filtered = threads.filter(t => t.title.toLowerCase().includes(filterText));
    
    if (filtered.length === 0) {
      el.faqThreadsContainer.innerHTML = '<span class="text-muted text-sm text-center mt-3">No questions found.</span>';
      return;
    }
    
    filtered.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `thread-item ${currentFAQThreadId === t.id ? 'active' : ''}`;
      
      const badgeClass = t.resolved ? 'badge-active' : 'badge-disabled';
      const badgeText = t.resolved ? 'Resolved' : 'Open';
      const isPinned = t.pinnedReplyId ? '★ Pinned' : '';
      
      const createdDate = new Date(t.createdAt).toLocaleDateString();
      
      btn.innerHTML = `
        <div class="thread-item-header">
          <span class="badge ${badgeClass}">${badgeText}</span>
          ${isPinned ? `<span class="text-warning font-semibold text-xs">${isPinned}</span>` : ''}
        </div>
        <h4>${t.title}</h4>
        <div class="thread-item-meta">
          <span>By ${t.authorName}</span>
          <span>${createdDate}</span>
        </div>
      `;
      
      btn.addEventListener('click', async () => {
        currentFAQThreadId = t.id;
        await loadFAQThreadStream(t.id);
        document.querySelectorAll('.thread-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      
      el.faqThreadsContainer.appendChild(btn);
    });
  } catch (err) {
    showToast("FAQ Threads Loading", err.message, "danger");
  }
}

async function loadFAQThreadStream(threadId) {
  try {
    const threads = await DB.getFAQThreads();
    const thread = threads.find(t => t.id === threadId);
    if (!thread) {
      currentFAQThreadId = null;
      await loadFAQBoard();
      return;
    }
    
    el.faqStreamEmpty.classList.add('hidden');
    el.faqStreamActive.classList.remove('hidden');
    
    el.activeThreadTitle.textContent = thread.title;
    el.activeThreadBadge.textContent = thread.resolved ? 'Resolved' : 'Open';
    el.activeThreadBadge.className = `badge ${thread.resolved ? 'badge-active' : 'badge-disabled'}`;
    el.activeThreadAuthor.textContent = thread.authorId === currentSession.employeeId ? 'You' : thread.authorName;
    el.activeThreadDate.textContent = new Date(thread.createdAt).toLocaleString();
    
    if (currentSession.role === 'Administrator') {
      el.activeThreadAdminOptions.classList.remove('hidden');
      el.btnAdminResolveThread.textContent = thread.resolved ? 'Re-open Thread' : 'Resolve Thread';
    } else {
      el.activeThreadAdminOptions.classList.add('hidden');
    }
    
    const replies = await DB.getFAQReplies(threadId);
    el.faqRepliesContainer.innerHTML = '';
    
    if (replies.length === 0) {
      el.faqRepliesContainer.innerHTML = '<p class="text-muted text-sm text-center my-4">No responses yet. Be the first to answer!</p>';
    } else {
      replies.forEach(rep => {
        const isPinned = thread.pinnedReplyId === rep.id;
        const repCard = document.createElement('div');
        repCard.className = `reply-card ${isPinned ? 'pinned' : ''}`;
        
        const isAuthorAdmin = rep.authorName.includes('(Admin)');
        
        repCard.innerHTML = `
          <div class="reply-card-header">
            <span class="reply-author ${isAuthorAdmin ? 'admin-author' : ''}">${rep.authorName}</span>
            <span class="reply-date">${new Date(rep.createdAt).toLocaleString()}</span>
          </div>
          <div class="reply-body">${rep.content}</div>
          
          ${currentSession.role === 'Administrator' ? `
            <div class="reply-actions">
              <button class="reply-action-btn btn-pin-reply" data-reply-id="${rep.id}">
                <i data-lucide="pin"></i> ${isPinned ? 'Unpin Answer' : 'Pin Answer'}
              </button>
              <button class="reply-action-btn text-danger btn-delete-reply" data-reply-id="${rep.id}">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </div>
          ` : ''}
        `;
        
        if (currentSession.role === 'Administrator') {
          repCard.querySelector('.btn-pin-reply').addEventListener('click', async () => {
            const nextPinId = isPinned ? null : rep.id;
            await DB.pinFAQReply(threadId, nextPinId);
            showToast("Pin Updated", isPinned ? "Reply unpinned." : "Reply pinned as helpful answer.", "success");
            await loadFAQThreadStream(threadId);
            await buildFAQThreadsList();
          });
          repCard.querySelector('.btn-delete-reply').addEventListener('click', async () => {
            if (confirm("Delete this response permanently?")) {
              await DB.deleteFAQReply(rep.id);
              showToast("Response Removed", "Response deleted.", "success");
              await loadFAQThreadStream(threadId);
            }
          });
        }
        
        el.faqRepliesContainer.appendChild(repCard);
      });
    }
    
    el.faqRepliesContainer.scrollTop = el.faqRepliesContainer.scrollHeight;
    lucide.createIcons();
    
  } catch (err) {
    showToast("FAQ Stream Error", err.message, "danger");
  }
}

el.btnAdminResolveThread.addEventListener('click', async () => {
  if (!currentFAQThreadId) return;
  try {
    const updated = await DB.toggleFAQThreadResolved(currentFAQThreadId);
    showToast("Status Updated", `Thread marked as ${updated.resolved ? 'Resolved' : 'Open'}.`, "success");
    await loadFAQThreadStream(currentFAQThreadId);
    await buildFAQThreadsList();
  } catch (err) {
    showToast("Resolve Thread Error", err.message, "danger");
  }
});

el.btnAdminDeleteThread.addEventListener('click', async () => {
  if (!currentFAQThreadId) return;
  if (confirm("Delete this entire discussion thread and all its replies? This action cannot be undone.")) {
    try {
      await DB.deleteFAQThread(currentFAQThreadId);
      showToast("Thread Deleted", "FAQ thread deleted successfully.", "success");
      currentFAQThreadId = null;
      await loadFAQBoard();
    } catch (err) {
      showToast("Delete Thread Error", err.message, "danger");
    }
  }
});

el.faqThreadSearch.addEventListener('input', async () => {
  await buildFAQThreadsList();
});

el.formFAQThreadCreate.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('faq-thread-title-input').value;
  try {
    const thread = await DB.createFAQThread(title);
    showToast("Thread Created", "Your question was posted successfully.", "success");
    currentFAQThreadId = thread.id;
    el.modalFAQThread.classList.add('hidden');
    el.formFAQThreadCreate.reset();
    await loadFAQBoard();
  } catch (err) {
    showToast("FAQ Post Error", err.message, "danger");
  }
});

el.formFaqReply.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentFAQThreadId) return;
  const content = el.faqReplyText.value;
  try {
    await DB.replyToFAQThread(currentFAQThreadId, content);
    el.faqReplyText.value = '';
    await loadFAQThreadStream(currentFAQThreadId);
  } catch (err) {
    showToast("Reply Post Error", err.message, "danger");
  }
});

// Modal triggers FAQ Thread
el.btnCreateThread.addEventListener('click', () => {
  el.modalFAQThread.classList.remove('hidden');
  document.getElementById('faq-thread-title-input').focus();
});

// ==========================================================================
// ADMINISTRATOR DASHBOARD & SUB-TABS
// ==========================================================================
async function loadAdminTab(tabId) {
  // Security fallback if not full admin
  if (currentSession && !hasFullAdminAccess(currentSession.role)) {
    if (tabId === 'admin-tab-sections' || tabId === 'admin-tab-documents') {
      tabId = 'admin-tab-dash';
    }
    // Hide buttons from DOM
    document.querySelectorAll('.tab-btn[data-target="admin-tab-sections"]').forEach(btn => btn.classList.add('hidden'));
    document.querySelectorAll('.tab-btn[data-target="admin-tab-documents"]').forEach(btn => btn.classList.add('hidden'));
  } else {
    // Show buttons
    document.querySelectorAll('.tab-btn[data-target="admin-tab-sections"]').forEach(btn => btn.classList.remove('hidden'));
    document.querySelectorAll('.tab-btn[data-target="admin-tab-documents"]').forEach(btn => btn.classList.remove('hidden'));
  }

  activeAdminTab = tabId;
  
  el.tabButtons.forEach(btn => {
    if (btn.dataset.target === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  el.adminTabContents.forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.remove('hidden');
    } else {
      pane.classList.add('hidden');
    }
  });
  
  if (tabId === 'admin-tab-dash') {
    await loadAdminDashboardMetrics();
  } else if (tabId === 'admin-tab-workers') {
    await loadWorkerManagementTable();
  } else if (tabId === 'admin-tab-sections') {
    await loadAdminSectionsList();
  } else if (tabId === 'admin-tab-documents') {
    await loadAdminDocumentManagement();
  } else if (tabId === 'admin-tab-audit') {
    await loadAuditLogsTable();
  }
  
  lucide.createIcons();
}

async function loadAdminDashboardMetrics() {
  try {
    const users = await DB.getUsers();
    const sections = await DB.getSections();
    const docs = await DB.getDocuments();
    const threads = await DB.getFAQThreads();
    const logs = await DB.getAuditLogs();
    
    el.statTotalWorkers.textContent = users.length;
    el.statActiveWorkers.textContent = users.filter(u => u.status === 'Active').length;
    el.statTotalSections.textContent = sections.length;
    el.statTotalDocs.textContent = docs.length;
    
    let unansweredCount = 0;
    for (const t of threads) {
      if (t.resolved) continue;
      const threadReplies = await DB.getFAQReplies(t.id);
      if (threadReplies.length === 0) {
        unansweredCount++;
        continue;
      }
      const lastReply = threadReplies[threadReplies.length - 1];
      if (!lastReply.authorName.includes('(Admin)')) {
        unansweredCount++;
      }
    }
    
    el.statUnansweredFAQ.textContent = unansweredCount;
    
    el.dashRecentActivity.innerHTML = '';
    logs.slice(0, 6).forEach(log => {
      const item = document.createElement('li');
      item.className = 'activity-item';
      
      const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      item.innerHTML = `
        <span class="activity-text"><strong>${log.userName}</strong>: ${log.action}</span>
        <span class="activity-time">${formattedTime}</span>
      `;
      el.dashRecentActivity.appendChild(item);
    });
    
    if (logs.length === 0) {
      el.dashRecentActivity.innerHTML = '<li class="text-muted text-sm text-center">No activity recorded.</li>';
    }
  } catch (err) {
    showToast("Metrics Error", err.message, "danger");
  }
}

el.btnAdminResetDB.addEventListener('click', async () => {
  if (confirm("WARNING: This will wipe all changes, reset standard documents, FAQ discussion threads, and restore default accounts. Proceed?")) {
    try {
      await DB.initializeDatabase(true);
      showToast("System Reset", "Database was restored to default seed states successfully.", "success");
      currentFAQThreadId = null;
      await buildLeftSidebar();
      await loadAdminTab('admin-tab-dash');
    } catch (err) {
      showToast("Reset Error", err.message, "danger");
    }
  }
});

// Tab button events
el.tabButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    await loadAdminTab(btn.dataset.target);
  });
});

// ==========================================================================
// WORKER MANAGEMENT CRUD
// ==========================================================================
async function loadWorkerManagementTable() {
  try {
    const users = await DB.getUsers();
    const filter = el.adminWorkerSearch.value.toLowerCase().trim();
    
    el.adminWorkersTableBody.innerHTML = '';
    
    const filtered = users.filter(u => 
      u.employeeId.toLowerCase().includes(filter) ||
      u.name.toLowerCase().includes(filter) ||
      u.department.toLowerCase().includes(filter)
    );
    
    filtered.forEach(u => {
      const tr = document.createElement('tr');
      
      const badgeRoleClass = u.role === 'Administrator' ? 'badge-admin' : 'badge-worker';
      const badgeStatusClass = u.status === 'Active' ? 'badge-active' : 'badge-disabled';
      
      tr.innerHTML = `
        <td><strong>${u.employeeId}</strong></td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.department}</td>
        <td><span class="badge ${badgeRoleClass}">${u.role}</span></td>
        <td><span class="badge ${badgeStatusClass}">${u.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary btn-edit-worker" data-id="${u.employeeId}" title="Edit Profile">
              <i data-lucide="edit-3"></i> Edit
            </button>
            <button class="btn btn-sm btn-secondary btn-reset-worker-pwd" data-id="${u.employeeId}" title="Reset Password">
              <i data-lucide="key-round"></i> Pass
            </button>
            ${u.employeeId !== currentSession.employeeId ? `
              <button class="btn btn-sm btn-outline-danger btn-delete-worker" data-id="${u.employeeId}" title="Delete User">
                <i data-lucide="trash-2"></i> Delete
              </button>
            ` : ''}
          </div>
        </td>
      `;
      
      // Events
      tr.querySelector('.btn-edit-worker').addEventListener('click', () => showWorkerCrudModal('edit', u));
      tr.querySelector('.btn-reset-worker-pwd').addEventListener('click', () => showWorkerResetPwdModal(u));
      
      const deleteBtn = tr.querySelector('.btn-delete-worker');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (confirm(`Remove worker "${u.name}" (${u.employeeId}) permanently?`)) {
            try {
              await DB.removeWorker(u.employeeId);
              showToast("Worker Deleted", "Employee account removed.", "success");
              await loadWorkerManagementTable();
            } catch (err) {
              showToast("Error deleting", err.message, "danger");
            }
          }
        });
      }
      
      el.adminWorkersTableBody.appendChild(tr);
    });
    
    lucide.createIcons();
  } catch (err) {
    showToast("Worker Load Error", err.message, "danger");
  }
}

el.adminWorkerSearch.addEventListener('input', async () => {
  await loadWorkerManagementTable();
});

// Modal triggers
el.btnAdminAddWorker.addEventListener('click', () => {
  showWorkerCrudModal('create');
});

function showWorkerCrudModal(mode, user = null) {
  el.modalWorkerCrud.classList.remove('hidden');
  document.getElementById('crud-mode').value = mode;
  
  if (mode === 'create') {
    document.getElementById('worker-modal-title').textContent = "Register Employee";
    el.formWorkerCrud.reset();
    document.getElementById('crud-worker-id').readOnly = false;
    document.getElementById('crud-password-group').classList.remove('hidden');
    document.getElementById('crud-worker-password').required = true;
    document.getElementById('crud-password-help').classList.add('hidden');
    document.getElementById('crud-status-group').classList.add('hidden');
    
    // Default department and roles setup
    document.getElementById('crud-worker-dept').value = 'Management';
    populateRolesDropdown('Management');
  } else {
    document.getElementById('worker-modal-title').textContent = "Edit Employee Profile";
    document.getElementById('crud-worker-id').value = user.employeeId;
    document.getElementById('crud-worker-id').readOnly = true;
    document.getElementById('crud-worker-name').value = user.name;
    document.getElementById('crud-worker-email').value = user.email;
    document.getElementById('crud-worker-dept').value = user.department;
    
    // Populate correct roles for editing user department
    populateRolesDropdown(user.department, user.role);
    
    document.getElementById('crud-worker-status').value = user.status;
    
    // Hide password fields during edit
    document.getElementById('crud-password-group').classList.add('hidden');
    document.getElementById('crud-worker-password').required = false;
    document.getElementById('crud-status-group').classList.remove('hidden');
  }
}

function showWorkerResetPwdModal(user) {
  el.modalWorkerResetPwd.classList.remove('hidden');
  document.getElementById('reset-pwd-employee-id').value = user.employeeId;
  document.getElementById('reset-pwd-worker-name').textContent = user.name;
  document.getElementById('reset-pwd-new-val').value = '';
}

// Worker CRUD form submit
el.formWorkerCrud.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mode = document.getElementById('crud-mode').value;
  
  const workerData = {
    employeeId: document.getElementById('crud-worker-id').value,
    name: document.getElementById('crud-worker-name').value,
    email: document.getElementById('crud-worker-email').value,
    department: document.getElementById('crud-worker-dept').value,
    role: document.getElementById('crud-worker-role').value
  };
  
  try {
    if (mode === 'create') {
      workerData.password = document.getElementById('crud-worker-password').value;
      await DB.registerWorker(workerData);
      showToast("Worker Registered", "Successfully registered new account.", "success");
    } else {
      workerData.status = document.getElementById('crud-worker-status').value;
      await DB.editWorker(workerData.employeeId, workerData);
      showToast("Profile Updated", "Employee account updated.", "success");
    }
    el.modalWorkerCrud.classList.add('hidden');
    await loadWorkerManagementTable();
  } catch (err) {
    showToast("Save Error", err.message, "danger");
  }
});

// Admin Reset Password submit
el.formAdminResetPwd.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('reset-pwd-employee-id').value;
  const newPwd = document.getElementById('reset-pwd-new-val').value;
  
  try {
    await DB.adminResetPassword(id, newPwd);
    showToast("Password Reset", "Worker password was reset successfully.", "success");
    el.modalWorkerResetPwd.classList.add('hidden');
  } catch (err) {
    showToast("Reset Password Error", err.message, "danger");
  }
});

// Close modals buttons
document.querySelectorAll('.btn-close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    el.modalWorkerCrud.classList.add('hidden');
    el.modalWorkerResetPwd.classList.add('hidden');
    el.modalFAQThread.classList.add('hidden');
  });
});

// ==========================================================================
// SECTION MANAGEMENT
// ==========================================================================
async function loadAdminSectionsList() {
  try {
    const sections = await DB.getSections();
    el.adminSectionsListBody.innerHTML = '';
    
    for (let index = 0; index < sections.length; index++) {
      const sec = sections[index];
      const div = document.createElement('div');
      div.className = 'admin-section-item';
      
      div.innerHTML = `
        <div class="section-item-left">
          <i data-lucide="grip-vertical" class="text-light"></i>
          <span>${sec.title}</span>
        </div>
        <div class="section-item-actions">
          <button class="admin-doc-order-btn btn-sec-up" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
            <i data-lucide="arrow-up"></i>
          </button>
          <button class="admin-doc-order-btn btn-sec-down" title="Move Down" ${index === sections.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
            <i data-lucide="arrow-down"></i>
          </button>
          <button class="btn btn-sm btn-secondary btn-edit-sec" title="Rename">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-sec" title="Delete Section">Delete</button>
        </div>
      `;
           div.querySelector('.btn-edit-sec').addEventListener('click', () => {
        el.adminSectionId.value = sec.id;
        el.adminSectionTitle.value = sec.title;
        document.getElementById('admin-section-target').value = sec.targetCategory || 'Both';
        el.adminSectionFormTitle.textContent = "Rename Section";
        el.btnAdminCancelSection.classList.remove('hidden');
        el.adminSectionTitle.focus();
      });
      
      div.querySelector('.btn-delete-sec').addEventListener('click', async () => {
        if (confirm(`Are you sure you want to delete section "${sec.title}"? ALL documents under this section will be permanently deleted.`)) {
          try {
            await DB.deleteSection(sec.id);
            showToast("Section Deleted", "Section and its documents removed.", "success");
            await buildLeftSidebar();
            await loadAdminSectionsList();
          } catch (err) {
            showToast("Error deleting", err.message, "danger");
          }
        }
      });
      
      const btnUp = div.querySelector('.btn-sec-up');
      const btnDown = div.querySelector('.btn-sec-down');
      
      btnUp.addEventListener('click', async () => {
        if (index > 0) {
          const temp = sections[index - 1].id;
          const reorderedIds = sections.map(s => s.id);
          reorderedIds[index] = temp;
          reorderedIds[index - 1] = sec.id;
          await DB.reorderSections(reorderedIds);
          await buildLeftSidebar();
          await loadAdminSectionsList();
        }
      });
      
      btnDown.addEventListener('click', async () => {
        if (index < sections.length - 1) {
          const temp = sections[index + 1].id;
          const reorderedIds = sections.map(s => s.id);
          reorderedIds[index] = temp;
          reorderedIds[index + 1] = sec.id;
          await DB.reorderSections(reorderedIds);
          await buildLeftSidebar();
          await loadAdminSectionsList();
        }
      });
      
      el.adminSectionsListBody.appendChild(div);
    }
    
    lucide.createIcons();
  } catch (err) {
    showToast("Sections Load Error", err.message, "danger");
  }
}


// Save Section Form Submit
el.formAdminSection.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = el.adminSectionId.value;
  const title = el.adminSectionTitle.value;
  const targetCategory = document.getElementById('admin-section-target').value;
  
  try {
    await DB.saveSection({ id: id || null, title: title, targetCategory: targetCategory });
    showToast("Section Saved", "Section was stored successfully.", "success");
    cancelSectionEdit();
    await buildLeftSidebar();
    await loadAdminSectionsList();
  } catch (err) {
    showToast("Error saving section", err.message, "danger");
  }
});

el.btnAdminCancelSection.addEventListener('click', cancelSectionEdit);

function cancelSectionEdit() {
  el.formAdminSection.reset();
  el.adminSectionId.value = '';
  document.getElementById('admin-section-target').value = 'Both';
  el.adminSectionFormTitle.textContent = "Create New Section";
  el.btnAdminCancelSection.classList.add('hidden');
}

// ==========================================================================
// HANDBOOK DOCUMENT MANAGEMENT COMPOSER
// ==========================================================================
let adminActiveDocId = null;

async function loadAdminDocumentManagement() {
  try {
    const sections = await DB.getSections();
    
    const prevSelectVal = el.adminDocSelectSection.value;
    el.adminDocSelectSection.innerHTML = '';
    
    sections.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.title;
      el.adminDocSelectSection.appendChild(opt);
    });
    
    if (prevSelectVal && sections.some(s => s.id === prevSelectVal)) {
      el.adminDocSelectSection.value = prevSelectVal;
    } else if (sections.length > 0) {
      el.adminDocSelectSection.value = sections[0].id;
    }
    
    el.adminDocSection.innerHTML = '';
    sections.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.title;
      el.adminDocSection.appendChild(opt);
    });
    
    await loadAdminDocumentsList();
  } catch (err) {
    showToast("Doc Management Init Error", err.message, "danger");
  }
}

async function loadAdminDocumentsList() {
  const sectionId = el.adminDocSelectSection.value;
  if (!sectionId) return;
  
  try {
    const docs = await DB.getDocuments(sectionId);
    el.adminDocsListBody.innerHTML = '';
    
    for (let index = 0; index < docs.length; index++) {
      const doc = docs[index];
      const li = document.createElement('li');
      li.className = `admin-doc-item ${adminActiveDocId === doc.id ? 'active' : ''}`;
      
      li.innerHTML = `
        <div class="admin-doc-item-left">
          <i data-lucide="file-text"></i>
          <span title="${doc.title}">${doc.title}</span>
        </div>
        <div class="section-item-actions">
          <button class="admin-doc-order-btn btn-doc-up" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.2"' : ''}>
            <i data-lucide="chevron-up"></i>
          </button>
          <button class="admin-doc-order-btn btn-doc-down" title="Move Down" ${index === docs.length - 1 ? 'disabled style="opacity:0.2"' : ''}>
            <i data-lucide="chevron-down"></i>
          </button>
        </div>
      `;
      
      li.addEventListener('click', async (e) => {
        if (e.target.closest('.admin-doc-order-btn')) return;
        await selectDocumentForEdit(doc.id);
      });
      
      const btnUp = li.querySelector('.btn-doc-up');
      const btnDown = li.querySelector('.btn-doc-down');
      
      btnUp.addEventListener('click', async () => {
        if (index > 0) {
          const temp = docs[index - 1].id;
          const reorderedIds = docs.map(d => d.id);
          reorderedIds[index] = temp;
          reorderedIds[index - 1] = doc.id;
          await DB.reorderDocuments(sectionId, reorderedIds);
          await loadAdminDocumentsList();
          await buildLeftSidebar();
        }
      });
      btnDown.addEventListener('click', async () => {
        if (index < docs.length - 1) {
          const temp = docs[index + 1].id;
          const reorderedIds = docs.map(d => d.id);
          reorderedIds[index] = temp;
          reorderedIds[index + 1] = doc.id;
          await DB.reorderDocuments(sectionId, reorderedIds);
          await loadAdminDocumentsList();
          await buildLeftSidebar();
        }
      });
      
      el.adminDocsListBody.appendChild(li);
    }
    
    lucide.createIcons();
  } catch (err) {
    showToast("Admin Docs List Error", err.message, "danger");
  }
}

el.adminDocSelectSection.addEventListener('change', async () => {
  await loadAdminDocumentsList();
});

async function selectDocumentForEdit(docId) {
  adminActiveDocId = docId;
  
  try {
    const doc = await DB.getDocumentById(docId);
    if (!doc) return;

    document.querySelectorAll('.admin-doc-item').forEach(li => li.classList.remove('active'));
    const activeLi = Array.from(document.querySelectorAll('.admin-doc-item')).find(li => {
      return li.querySelector('span').textContent === doc.title;
    });
    if (activeLi) activeLi.classList.add('active');
    
    el.adminDocEmpty.classList.add('hidden');
    el.formAdminDoc.classList.remove('hidden');
    
    el.adminDocId.value = doc.id;
    el.adminDocTitle.value = doc.title;
    el.adminDocSection.value = doc.sectionId;
    el.adminDocMarkdown.value = doc.content;
    
    el.adminDocFileUpload.value = '';
    el.uploadFilename.textContent = "Only .md files accepted";
    
    switchEditorTab('write');
    
  } catch (err) {
    showToast("Doc Edit Error", err.message, "danger");
  }
}

// Button "New Doc" click
el.btnAdminNewDoc.addEventListener('click', () => {
  adminActiveDocId = null;
  document.querySelectorAll('.admin-doc-item').forEach(li => li.classList.remove('active'));
  
  el.adminDocEmpty.classList.add('hidden');
  el.formAdminDoc.classList.remove('hidden');
  
  el.formAdminDoc.reset();
  el.adminDocId.value = '';
  // Pre-fill section dropdown to match list select
  el.adminDocSection.value = el.adminDocSelectSection.value;
  el.adminDocFileUpload.value = '';
  el.uploadFilename.textContent = "Only .md files accepted";
  
  switchEditorTab('write');
  el.adminDocTitle.focus();
});

// File Upload Validation & Parsing
el.adminDocFileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.name.endsWith('.md')) {
    showToast("Invalid File Type", "Please upload a valid Markdown (.md) document.", "warning");
    el.adminDocFileUpload.value = '';
    return;
  }
  
  el.uploadFilename.textContent = file.name;
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    // Populate textarea content
    el.adminDocMarkdown.value = evt.target.result;
    
    // Guess title from filename or H1 if not set
    if (!el.adminDocTitle.value) {
      // Look for H1: e.g. "# PPE Guidelines"
      const lines = evt.target.result.split('\n');
      const firstH1Line = lines.find(l => l.trim().startsWith('# '));
      if (firstH1Line) {
        el.adminDocTitle.value = firstH1Line.replace('# ', '').trim();
      } else {
        el.adminDocTitle.value = file.name.replace('.md', '').replace(/[-_]/g, ' ');
      }
    }
    
    showToast("Markdown Loaded", `${file.name} parsed successfully.`, "success");
    // Switch to preview to show results
    switchEditorTab('preview');
  };
  reader.readAsText(file);
});

// Editor tab switching (Write vs Preview)
function switchEditorTab(mode) {
  document.querySelectorAll('.editor-tab-btn').forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  if (mode === 'write') {
    el.editorWriteArea.classList.remove('hidden');
    el.editorPreviewArea.classList.add('hidden');
  } else {
    el.editorWriteArea.classList.add('hidden');
    el.editorPreviewArea.classList.remove('hidden');
    // Render Markdown preview
    const raw = el.adminDocMarkdown.value || "*No content to preview*";
    el.editorPreviewArea.innerHTML = DOMPurify.sanitize(marked.parse(raw));
  }
}

document.querySelectorAll('.editor-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchEditorTab(btn.dataset.mode);
  });
});

// Save Document Composer Submit
el.formAdminDoc.addEventListener('submit', async (e) => {
  e.preventDefault();
  const docData = {
    id: el.adminDocId.value || null,
    title: el.adminDocTitle.value,
    sectionId: el.adminDocSection.value,
    content: el.adminDocMarkdown.value
  };
  
  try {
    const saved = await DB.saveDocument(docData);
    showToast("Changes Published", `"${saved.title}" was saved and published.`, "success");
    
    // Clear composer and reload
    adminActiveDocId = null;
    el.formAdminDoc.classList.add('hidden');
    el.adminDocEmpty.classList.remove('hidden');
    
    await buildLeftSidebar();
    await loadAdminDocumentsList();
  } catch (err) {
    showToast("Publish Error", err.message, "danger");
  }
});

// Delete Document Composer
el.btnAdminDeleteDoc.addEventListener('click', async () => {
  const id = el.adminDocId.value;
  if (!id) return;
  
  if (confirm("Are you sure you want to permanently delete this document?")) {
    try {
      await DB.deleteDocument(id);
      showToast("Document Deleted", "Document removed from section.", "success");
      
      adminActiveDocId = null;
      el.formAdminDoc.classList.add('hidden');
      el.adminDocEmpty.classList.remove('hidden');
      
      await buildLeftSidebar();
      await loadAdminDocumentsList();
    } catch (err) {
      showToast("Delete Doc Error", err.message, "danger");
    }
  }
});

// ==========================================================================
// SECURITY AUDIT LOGS
// ==========================================================================
async function loadAuditLogsTable() {
  try {
    const logs = await DB.getAuditLogs();
    el.adminAuditTableBody.innerHTML = '';
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      const formattedDate = new Date(log.timestamp).toLocaleString();
      
      tr.innerHTML = `
        <td><span class="text-muted text-xs">${formattedDate}</span></td>
        <td><strong>${log.userName}</strong> <span class="text-xs text-light">(${log.userId})</span></td>
        <td><code class="text-sm">${log.action}</code></td>
      `;
      el.adminAuditTableBody.appendChild(tr);
    });
  } catch (err) {
    showToast("Audit Logs Error", err.message, "danger");
  }
}

el.btnAdminRefreshAudit.addEventListener('click', async () => {
  await loadAuditLogsTable();
  showToast("Audit Refresh", "Security logs fetched.", "success");
});

// ==========================================================================
// AUTHENTICATION FLOW & FORMS
// ==========================================================================
el.btnShowRecover.addEventListener('click', () => switchAuthForm('recover'));
el.btnShowLogin.addEventListener('click', () => switchAuthForm('login'));

// Submit Login
el.formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const session = await DB.login(email, password);
    showToast("Access Granted", `Welcome back, ${session.name}!`, "success");
    await checkAuth();
  } catch (err) {
    showToast("Access Denied", err.message, "danger");
  }
});

// Submit Password Recovery
el.formRecover.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('recover-email').value;
  const empId = document.getElementById('recover-id').value;
  const newPwd = document.getElementById('recover-new-pwd').value;
  
  try {
    await DB.resetPasswordWithSecurityCheck(email, empId, newPwd);
    showToast("Security Complete", "Your password has been reset. Please sign in.", "success");
    el.formRecover.reset();
    switchAuthForm('login');
  } catch (err) {
    showToast("Verification Failed", err.message, "danger");
  }
});

// Logout
el.btnLogout.addEventListener('click', async () => {
  await DB.logout();
  await checkAuth();
  showToast("Session Ended", "You have been logged out securely.", "info");
});

// Role Switcher buttons
el.btnGoAdmin.addEventListener('click', async () => {
  el.btnGoAdmin.classList.add('hidden');
  el.btnGoWorker.classList.remove('hidden');
  await switchView('admin');
});
el.btnGoWorker.addEventListener('click', async () => {
  el.btnGoAdmin.classList.remove('hidden');
  el.btnGoWorker.classList.add('hidden');
  await switchView('worker');
});

// Toggle Dark Mode button click
el.btnToggleTheme.addEventListener('click', toggleTheme);

// ==========================================================================
// APP INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedTheme();
  checkAuth();
  
  const deptSelect = document.getElementById('crud-worker-dept');
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      populateRolesDropdown(e.target.value);
    });
  }
});
