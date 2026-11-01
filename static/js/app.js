/* ==========================================================================
   SNU LIBRARY - MANAGEMENT SYSTEM
   Frontend Application Logic & State Controller
   ========================================================================== */

let state = {
    activeTab: 'dashboard',
    currentDeptFilter: '',
    catalogStatusFilter: 'all',
    issuesStatusFilter: 'all',
    searchQuery: '',
    departments: [],
    books: [],
    issues: []
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initDateDisplay();
    setupTabNavigation();
    loadDepartments();
    loadDashboard();
});

// Setup current date in header
function initDateDisplay() {
    const dateElem = document.getElementById('current-date-display');
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dateElem.textContent = new Date().toLocaleDateString('en-US', options);
}

// Navigation & Tab Switching
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    state.activeTab = tabName;

    // Update nav active classes
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab pane active classes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const activePane = document.getElementById(`tab-${tabName}`);
    if (activePane) {
        activePane.classList.add('active');
    }

    // Update Header Titles
    const titleElem = document.getElementById('page-title');
    const subElem = document.getElementById('page-subtitle');

    switch (tabName) {
        case 'dashboard':
            titleElem.textContent = 'Library Overview & Analytics';
            subElem.textContent = 'Track college books, department allocations, student issues and returns';
            loadDashboard();
            break;
        case 'catalog':
            titleElem.textContent = 'College Book Catalog';
            subElem.textContent = 'Browse, filter by department, add and manage academic book inventory';
            loadCatalogBooks();
            break;
        case 'departments':
            titleElem.textContent = 'Academic Department Sections';
            subElem.textContent = 'Explore Engineering, Medical, Basic Sciences and Humanities collections';
            renderFullDepartmentsGrid();
            break;
        case 'issues':
            titleElem.textContent = 'Issued Books & Student Loans';
            subElem.textContent = 'Monitor active loans, due dates, overdue returns and fine settlements';
            loadIssues();
            break;
    }
}

// Global search bar handling
let searchTimeout = null;
function handleGlobalSearch(val) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        state.searchQuery = val.trim();
        if (state.activeTab === 'catalog') {
            loadCatalogBooks();
        } else if (state.activeTab === 'issues') {
            loadIssues();
        } else {
            // Switch to catalog to show search results
            switchTab('catalog');
            loadCatalogBooks();
        }
    }, 250);
}

// ----------------- API LOADERS -----------------

// Load Departments & Populate Selectors
async function loadDepartments() {
    try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        state.departments = data;

        populateDepartmentSelect();
        renderCatalogDeptChips();
    } catch (err) {
        console.error('Failed to load departments', err);
    }
}

function populateDepartmentSelect() {
    const bookDeptSelect = document.getElementById('book-department');
    if (!bookDeptSelect) return;

    bookDeptSelect.innerHTML = '<option value="">Select Department...</option>' +
        state.departments.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('');
}

function renderCatalogDeptChips() {
    const container = document.getElementById('catalog-dept-chips');
    if (!container) return;

    let html = `<button class="chip ${state.currentDeptFilter === '' ? 'active' : ''}" onclick="filterCatalogDept(this, '')">All Departments</button>`;
    state.departments.forEach(dept => {
        html += `<button class="chip ${state.currentDeptFilter === dept.id ? 'active' : ''}" onclick="filterCatalogDept(this, ${dept.id})">${dept.name}</button>`;
    });
    container.innerHTML = html;
}

// Load Dashboard & Metrics
async function loadDashboard() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();

        // Update Stats Numbers
        document.getElementById('stat-titles').textContent = stats.total_titles;
        document.getElementById('stat-copies').textContent = `${stats.total_copies} total copies`;
        document.getElementById('stat-available').textContent = stats.available_copies;
        document.getElementById('stat-issued').textContent = stats.issued_copies;
        document.getElementById('stat-borrowers').textContent = `${stats.active_borrowers} active students`;
        
        const overdueElem = document.getElementById('stat-overdue');
        overdueElem.textContent = stats.overdue_count;
        const overdueCard = overdueElem.closest('.stat-card');
        if (overdueCard) {
            if (stats.overdue_count > 0) {
                overdueCard.classList.add('has-overdue-alert');
            } else {
                overdueCard.classList.remove('has-overdue-alert');
            }
        }

        // Active Loans Badge on sidebar
        const badge = document.getElementById('active-loans-badge');
        if (badge) badge.textContent = stats.issued_copies;

        // Render mini department cards on dashboard
        renderDashboardDeptCards(stats.departments_stats);

        // Fetch recent loans for quick view
        loadDashboardRecentLoans();
    } catch (err) {
        console.error('Failed to load dashboard stats', err);
    }
}

function renderDashboardDeptCards(deptStats) {
    const container = document.getElementById('dashboard-dept-cards');
    if (!container || !deptStats) return;

    container.innerHTML = deptStats.map(dept => {
        const pct = dept.total_copies > 0 ? Math.round((dept.available_copies / dept.total_copies) * 100) : 0;
        return `
            <div class="dept-card" onclick="viewDepartmentBooks(${dept.id})">
                <div class="dept-card-top">
                    <div class="dept-icon-box dept-color-${dept.code.toLowerCase()}">
                        <i class="bi ${dept.icon || 'bi-book'}"></i>
                    </div>
                    <span class="dept-badge">${dept.code}</span>
                </div>
                <h4>${dept.name}</h4>
                <p>${dept.description || 'College department academic collection'}</p>
                <div class="dept-card-stats">
                    <span><strong>${dept.title_count}</strong> Titles</span>
                    <span class="avail-ratio-pill"><strong>${dept.available_copies}</strong> / ${dept.total_copies} Avail</span>
                </div>
                <div class="dept-progress-bar">
                    <div class="dept-progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadDashboardRecentLoans() {
    const container = document.getElementById('dashboard-recent-loans');
    if (!container) return;

    try {
        const res = await fetch('/api/issues?status=ISSUED');
        const issues = await res.json();

        if (issues.length === 0) {
            container.innerHTML = `
                <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    <i class="bi bi-check-circle" style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem; color: var(--text-muted);"></i>
                    No active student loans at the moment.
                </div>
            `;
            return;
        }

        container.innerHTML = issues.slice(0, 5).map(issue => `
            <div class="loan-item">
                <div class="loan-info">
                    <span class="loan-book" title="${escapeHtml(issue.book_title)}">${escapeHtml(issue.book_title)}</span>
                    <span class="loan-student"><strong class="roll-pill">${escapeHtml(issue.roll_no)}</strong> &bull; ${escapeHtml(issue.student_name)} &bull; ${escapeHtml(issue.student_dept)}</span>
                </div>
                <div class="loan-status-box">
                    ${issue.is_overdue 
                        ? `<span class="badge badge-status-overdue"><i class="bi bi-clock-history"></i> Overdue (${issue.overdue_days}d)</span>` 
                        : `<span class="badge badge-status-active"><i class="bi bi-calendar-check"></i> Due ${issue.due_date}</span>`}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load recent loans', err);
    }
}

// ----------------- CATALOG TAB -----------------

function filterCatalogDept(btn, deptId) {
    state.currentDeptFilter = deptId;
    document.querySelectorAll('#catalog-dept-chips .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    loadCatalogBooks();
}

function viewDepartmentBooks(deptId) {
    state.currentDeptFilter = deptId;
    switchTab('catalog');
    renderCatalogDeptChips();
    loadCatalogBooks();
}

async function loadCatalogBooks() {
    const statusSelect = document.getElementById('catalog-status-filter');
    const status = statusSelect ? statusSelect.value : 'all';

    let url = `/api/books?status=${status}`;
    if (state.currentDeptFilter) {
        url += `&department_id=${state.currentDeptFilter}`;
    }
    if (state.searchQuery) {
        url += `&search=${encodeURIComponent(state.searchQuery)}`;
    }

    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading books...</td></tr>`;

    try {
        const res = await fetch(url);
        const books = await res.json();
        state.books = books;

        if (books.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="bi bi-inbox" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                        No books found matching the current department and filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = books.map(book => {
            const isAvail = book.available_copies > 0;
            return `
                <tr>
                    <td>
                        <div class="book-title-cell">
                            <strong class="highlight-title">${escapeHtml(book.title)}</strong>
                            <small class="book-meta">
                                <span class="author-label">${escapeHtml(book.author)}</span>
                                <span class="meta-dot">&bull;</span>
                                <span class="edition-label">${escapeHtml(book.edition || '1st Ed.')}</span>
                                <span class="meta-dot">&bull;</span>
                                <span class="isbn-tag"><i class="bi bi-upc"></i> ${escapeHtml(book.isbn)}</span>
                            </small>
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-dept badge-dept-${book.department_code.toLowerCase()}"><i class="bi bi-building"></i> ${escapeHtml(book.department_name)}</span>
                    </td>
                    <td>
                        <span class="shelf-tag">
                            <i class="bi bi-geo-alt-fill"></i> ${escapeHtml(book.shelf_location || 'General Stacks')}
                        </span>
                    </td>
                    <td>
                        <div class="copies-badge ${isAvail ? 'copies-available' : 'copies-empty'}">
                            <strong class="copies-num">${book.available_copies}</strong>
                            <span class="copies-total">/ ${book.total_copies}</span>
                        </div>
                    </td>
                    <td>
                        ${isAvail 
                            ? `<span class="badge badge-status-avail"><span class="dot dot-avail"></span> In Stock</span>`
                            : `<span class="badge badge-status-out"><span class="dot dot-out"></span> Out of Stock</span>`}
                    </td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button class="btn-icon btn-issue" title="Issue this book" onclick="openIssueModal(${book.id})" ${!isAvail ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}>
                                <i class="bi bi-box-arrow-up-right"></i>
                            </button>
                            <button class="btn-icon" title="Edit book details" onclick="openEditBookModal(${book.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn-icon btn-delete" title="Delete book" onclick="deleteBook(${book.id}, '${escapeHtml(book.title)}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load books', err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--rose);">Error loading books data.</td></tr>`;
    }
}

// ----------------- FULL DEPARTMENTS TAB -----------------

function renderFullDepartmentsGrid() {
    const container = document.getElementById('departments-full-grid');
    if (!container) return;

    fetch('/api/departments')
        .then(res => res.json())
        .then(departments => {
            container.innerHTML = departments.map(d => {
                const pct = d.total_copies > 0 ? Math.round((d.available_copies / d.total_copies) * 100) : 0;
                return `
                <div class="dept-full-card">
                    <div class="dept-full-top">
                        <div class="dept-full-icon dept-color-${d.code.toLowerCase()}">
                            <i class="bi ${d.icon || 'bi-journal-bookmark'}"></i>
                        </div>
                        <div class="dept-full-title">
                            <h3>${escapeHtml(d.name)}</h3>
                            <span class="dept-code-tag">${escapeHtml(d.code)}</span>
                        </div>
                    </div>
                    <p class="dept-full-desc">${escapeHtml(d.description || 'Academic department resource section.')}</p>
                    <div class="dept-full-stats">
                        <div class="dept-stat-box">
                            <small>Book Titles</small>
                            <strong>${d.book_count}</strong>
                        </div>
                        <div class="dept-stat-box">
                            <small>Total Copies</small>
                            <strong>${d.total_copies}</strong>
                        </div>
                        <div class="dept-stat-box highlight-avail">
                            <small>Available</small>
                            <strong class="avail-num">${d.available_copies}</strong>
                        </div>
                    </div>
                    <div class="dept-progress-container">
                        <div class="progress-labels">
                            <span>Availability</span>
                            <strong>${pct}% (${d.available_copies}/${d.total_copies})</strong>
                        </div>
                        <div class="dept-progress-bar">
                            <div class="dept-progress-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-secondary btn-block" onclick="viewDepartmentBooks(${d.id})">
                            <i class="bi bi-bookshelf"></i> View Catalog
                        </button>
                        <button class="btn btn-primary" title="Add book to department" onclick="openAddBookModal(${d.id})">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        });
}

// ----------------- ISSUES TAB -----------------

function filterLoanStatus(btn, status) {
    state.issuesStatusFilter = status;
    document.querySelectorAll('.loan-filter-chips .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    loadIssues();
}

async function loadIssues() {
    let url = `/api/issues?status=${state.issuesStatusFilter}`;
    if (state.searchQuery) {
        url += `&search=${encodeURIComponent(state.searchQuery)}`;
    }

    const tbody = document.getElementById('issues-table-body');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading loan records...</td></tr>`;

    try {
        const res = await fetch(url);
        const issues = await res.json();
        state.issues = issues;

        if (issues.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="bi bi-clipboard2-check" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                        No issue or loan records found for this filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = issues.map(item => {
            const isIssued = item.status === 'ISSUED';
            const isOverdue = item.is_overdue;

            return `
                <tr>
                    <td>
                        <div class="book-title-cell">
                            <strong class="highlight-title">${escapeHtml(item.book_title)}</strong>
                            <small class="book-meta">
                                <span class="dept-code-tag">${escapeHtml(item.department_code)}</span>
                                <span class="isbn-tag">ISBN: ${escapeHtml(item.book_isbn)}</span>
                            </small>
                        </div>
                    </td>
                    <td>
                        <div class="book-title-cell">
                            <strong class="student-name">${escapeHtml(item.student_name)}</strong>
                            <div class="student-meta">
                                <span class="roll-pill"><i class="bi bi-person-vcard-fill"></i> ${escapeHtml(item.roll_no)}</span>
                                <span class="student-dept-tag">${escapeHtml(item.student_dept)}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="date-text"><i class="bi bi-calendar-event"></i> ${item.issue_date}</span>
                    </td>
                    <td>
                        ${isOverdue 
                            ? `<div class="due-box overdue"><i class="bi bi-exclamation-triangle-fill"></i> <strong>${item.due_date}</strong><small>${item.overdue_days}d overdue</small></div>`
                            : `<div class="due-box normal"><i class="bi bi-calendar-check"></i> <strong>${item.due_date}</strong><small>Due Date</small></div>`}
                    </td>
                    <td>
                        ${isIssued
                            ? (isOverdue 
                                ? `<span class="badge badge-status-overdue"><i class="bi bi-clock-history"></i> Overdue</span>` 
                                : `<span class="badge badge-status-active"><i class="bi bi-hourglass-split"></i> Active Loan</span>`)
                            : `<span class="badge badge-status-returned"><i class="bi bi-check2-circle"></i> Returned (${item.return_date})</span>`}
                    </td>
                    <td>
                        ${item.calculated_fine > 0 
                            ? `<span class="fine-pill alert"><i class="bi bi-currency-rupee"></i>${item.calculated_fine.toFixed(2)}</span>` 
                            : `<span class="fine-pill zero">₹0.00</span>`}
                    </td>
                    <td class="text-right">
                        ${isIssued 
                            ? `<button class="btn btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;" onclick="openReturnModal(${item.id})">
                                 <i class="bi bi-arrow-return-left"></i> Return Book
                               </button>`
                            : `<span class="completed-text"><i class="bi bi-check-all"></i> Closed</span>`}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load issues', err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--rose);">Error loading loan records.</td></tr>`;
    }
}

// ----------------- MODAL CONTROLS -----------------

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
});

// Close modal on click outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});

// ADD / EDIT BOOK
function openAddBookModal(preselectedDeptId = null) {
    document.getElementById('book-modal-title').textContent = 'Add New Book';
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';

    populateDepartmentSelect();
    if (preselectedDeptId) {
        document.getElementById('book-department').value = preselectedDeptId;
    }

    openModal('book-modal');
}

async function openEditBookModal(bookId) {
    try {
        const res = await fetch(`/api/books/${bookId}`);
        const book = await res.json();

        document.getElementById('book-modal-title').textContent = 'Edit Book Details';
        document.getElementById('book-id').value = book.id;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-department').value = book.department_id;
        document.getElementById('book-edition').value = book.edition || '';
        document.getElementById('book-copies').value = book.total_copies;
        document.getElementById('book-shelf').value = book.shelf_location || '';

        openModal('book-modal');
    } catch (err) {
        showToast('Failed to load book details', 'error');
    }
}

async function handleBookSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('book-id').value;

    const payload = {
        isbn: document.getElementById('book-isbn').value,
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        department_id: parseInt(document.getElementById('book-department').value),
        edition: document.getElementById('book-edition').value,
        total_copies: parseInt(document.getElementById('book-copies').value),
        shelf_location: document.getElementById('book-shelf').value
    };

    try {
        const url = id ? `/api/books/${id}` : '/api/books';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'Operation failed', 'error');
            return;
        }

        showToast(id ? 'Book updated successfully' : 'Book added to catalog', 'success');
        closeModal('book-modal');
        loadCatalogBooks();
        loadDashboard();
    } catch (err) {
        showToast('Server communication error', 'error');
    }
}

async function deleteBook(bookId, title) {
    if (!confirm(`Are you sure you want to delete "${title}" from the library catalog?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || 'Failed to delete book', 'error');
            return;
        }

        showToast('Book removed from library', 'info');
        loadCatalogBooks();
        loadDashboard();
    } catch (err) {
        showToast('Failed to delete book', 'error');
    }
}

// ISSUE BOOK MODAL
async function openIssueModal(preselectedBookId = null) {
    const bookSelect = document.getElementById('issue-book-select');
    bookSelect.innerHTML = '<option value="">Loading books...</option>';

    openModal('issue-modal');

    try {
        const res = await fetch('/api/books');
        const books = await res.json();

        bookSelect.innerHTML = '<option value="">-- Choose a book to issue --</option>' +
            books.map(b => {
                const disabled = b.available_copies <= 0;
                return `<option value="${b.id}" ${b.id === preselectedBookId ? 'selected' : ''} ${disabled ? 'disabled' : ''}>
                    [${b.department_code}] ${b.title} (${b.available_copies} available)
                </option>`;
            }).join('');

        if (preselectedBookId) {
            bookSelect.value = preselectedBookId;
        }
    } catch (err) {
        bookSelect.innerHTML = '<option value="">Error loading books</option>';
    }
}

async function handleIssueSubmit(event) {
    event.preventDefault();

    const payload = {
        book_id: parseInt(document.getElementById('issue-book-select').value),
        student_name: document.getElementById('student-name').value,
        roll_no: document.getElementById('student-roll').value,
        student_dept: document.getElementById('student-dept').value,
        days: parseInt(document.getElementById('issue-duration').value),
        notes: document.getElementById('issue-notes').value
    };

    try {
        const res = await fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'Failed to issue book', 'error');
            return;
        }

        showToast(`Book issued! Due date: ${data.due_date}`, 'success');
        closeModal('issue-modal');
        document.getElementById('issue-form').reset();

        loadDashboard();
        if (state.activeTab === 'catalog') loadCatalogBooks();
        if (state.activeTab === 'issues') loadIssues();
    } catch (err) {
        showToast('Server communication error', 'error');
    }
}

// RETURN BOOK MODAL
function openReturnModal(issueId) {
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;

    document.getElementById('return-issue-id').value = issue.id;
    document.getElementById('return-book-title').textContent = issue.book_title;
    document.getElementById('return-student-name').textContent = `${issue.student_name} (${issue.roll_no})`;
    document.getElementById('return-due-date').textContent = issue.due_date;

    const overdueStatusElem = document.getElementById('return-overdue-status');
    const fineElem = document.getElementById('return-fine-amount');
    const fineContainer = document.getElementById('return-fine-container');

    if (issue.is_overdue) {
        overdueStatusElem.className = 'badge badge-danger';
        overdueStatusElem.textContent = `Overdue by ${issue.overdue_days} day(s)`;
        fineContainer.style.display = 'flex';
        fineElem.textContent = `₹${issue.calculated_fine.toFixed(2)}`;
    } else {
        overdueStatusElem.className = 'badge badge-success';
        overdueStatusElem.textContent = 'Returned on or before due date';
        fineContainer.style.display = 'none';
        fineElem.textContent = '₹0.00';
    }

    openModal('return-modal');
}

async function confirmReturn() {
    const issueId = document.getElementById('return-issue-id').value;
    if (!issueId) return;

    try {
        const res = await fetch(`/api/issues/${issueId}/return`, {
            method: 'POST'
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'Failed to process return', 'error');
            return;
        }

        let msg = 'Book returned successfully';
        if (data.fine_amount > 0) {
            msg += ` (Fine collected: ₹${data.fine_amount.toFixed(2)})`;
        }

        showToast(msg, 'success');
        closeModal('return-modal');

        loadDashboard();
        if (state.activeTab === 'issues') loadIssues();
        if (state.activeTab === 'catalog') loadCatalogBooks();
    } catch (err) {
        showToast('Failed to return book', 'error');
    }
}

// ----------------- TOAST NOTIFICATIONS -----------------

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'bi-info-circle';
    if (type === 'success') icon = 'bi-check-circle-fill';
    if (type === 'error') icon = 'bi-exclamation-triangle-fill';

    toast.innerHTML = `<i class="bi ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Helper to escape HTML and prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
