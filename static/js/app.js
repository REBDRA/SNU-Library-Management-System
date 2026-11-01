/* ==========================================================================
   SNU LIBRARY - MANAGEMENT SYSTEM
   Frontend Application Logic & State Controller
   ========================================================================== */

// ==========================================================================
// GITHUB PAGES / CLIENT-SIDE STORAGE ADAPTER
// Seamlessly runs 100% interactively on GitHub Pages without requiring a backend!
// ==========================================================================
(function() {
    const isGitHubPages = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';

    const defaultDepts = [
        { id: 1, name: "Computer Science & Engineering", code: "CSE", icon: "bi-laptop", description: "Computer Science, AI, Cyber Security, Software Engineering" },
        { id: 2, name: "Mechanical Engineering", code: "MECH", icon: "bi-gear-wide-connected", description: "Thermodynamics, Robotics, Fluid Mechanics, Automobile" },
        { id: 3, name: "Medical & Health Sciences", code: "MED", icon: "bi-heart-pulse", description: "Human Anatomy, Physiology, Pathology, Pharmacology, Surgery" },
        { id: 4, name: "Electrical & Electronics", code: "EEE", icon: "bi-lightning-charge", description: "Circuits, Power Systems, Microprocessors, Control Systems" },
        { id: 5, name: "Civil Engineering", code: "CIVIL", icon: "bi-buildings", description: "Structural Analysis, Geotechnical, Surveying, Construction" },
        { id: 6, name: "Basic Sciences & Humanities", code: "BSH", icon: "bi-journal-bookmark", description: "Applied Mathematics, Engineering Physics, Chemistry" }
    ];

    const defaultBooks = [
        { id: 1, isbn: "978-0262033848", title: "Introduction to Algorithms (CLRS)", author: "Thomas H. Cormen et al.", department_id: 1, edition: "4th Ed.", total_copies: 5, available_copies: 4, shelf_location: "Shelf CS-01" },
        { id: 2, isbn: "978-1118063330", title: "Operating System Concepts", author: "Abraham Silberschatz, Peter Galvin", department_id: 1, edition: "10th Ed.", total_copies: 4, available_copies: 3, shelf_location: "Shelf CS-02" },
        { id: 3, isbn: "978-0073523323", title: "Database System Concepts", author: "Abraham Silberschatz, Henry Korth", department_id: 1, edition: "7th Ed.", total_copies: 6, available_copies: 5, shelf_location: "Shelf CS-03" },
        { id: 4, isbn: "978-0133594140", title: "Computer Networking: A Top-Down Approach", author: "James Kurose, Keith Ross", department_id: 1, edition: "8th Ed.", total_copies: 4, available_copies: 4, shelf_location: "Shelf CS-04" },
        { id: 5, isbn: "978-0132350884", title: "Clean Code: A Handbook of Agile Software", author: "Robert C. Martin", department_id: 1, edition: "1st Ed.", total_copies: 3, available_copies: 2, shelf_location: "Shelf CS-05" },

        { id: 6, isbn: "978-9352606429", title: "Engineering Thermodynamics", author: "P.K. Nag", department_id: 2, edition: "6th Ed.", total_copies: 6, available_copies: 5, shelf_location: "Shelf ME-01" },
        { id: 7, isbn: "978-0195371239", title: "Theory of Machines and Mechanisms", author: "Joseph E. Shigley, John J. Uicker", department_id: 2, edition: "5th Ed.", total_copies: 4, available_copies: 4, shelf_location: "Shelf ME-02" },
        { id: 8, isbn: "978-0073380322", title: "Fluid Mechanics: Fundamentals & Applications", author: "Yunus A. Cengel, John M. Cimbala", department_id: 2, edition: "4th Ed.", total_copies: 5, available_copies: 4, shelf_location: "Shelf ME-03" },
        { id: 9, isbn: "978-0132272711", title: "Manufacturing Processes for Engineering Materials", author: "Serope Kalpakjian, Steven Schmid", department_id: 2, edition: "6th Ed.", total_copies: 3, available_copies: 3, shelf_location: "Shelf ME-04" },
        { id: 10, isbn: "978-8187433545", title: "Strength of Materials", author: "S. Ramamrutham", department_id: 2, edition: "16th Ed.", total_copies: 7, available_copies: 6, shelf_location: "Shelf ME-05" },

        { id: 11, isbn: "978-0323393041", title: "Gray's Anatomy for Students", author: "Richard Drake, A. Wayne Vogl", department_id: 3, edition: "4th Ed.", total_copies: 5, available_copies: 4, shelf_location: "Shelf MD-01" },
        { id: 12, isbn: "978-1455770052", title: "Guyton and Hall Textbook of Medical Physiology", author: "John E. Hall, Michael E. Hall", department_id: 3, edition: "14th Ed.", total_copies: 5, available_copies: 5, shelf_location: "Shelf MD-02" },
        { id: 13, isbn: "978-1455726134", title: "Robbins and Cotran Pathologic Basis of Disease", author: "Vinay Kumar, Abul K. Abbas", department_id: 3, edition: "10th Ed.", total_copies: 4, available_copies: 3, shelf_location: "Shelf MD-03" },
        { id: 14, isbn: "978-1259644030", title: "Harrison's Principles of Internal Medicine", author: "J. Larry Jameson, Anthony Fauci", department_id: 3, edition: "21st Ed.", total_copies: 3, available_copies: 2, shelf_location: "Shelf MD-04" },
        { id: 15, isbn: "978-9350259375", title: "Essentials of Medical Pharmacology", author: "K.D. Tripathi", department_id: 3, edition: "8th Ed.", total_copies: 6, available_copies: 6, shelf_location: "Shelf MD-05" },

        { id: 16, isbn: "978-0199339136", title: "Microelectronic Circuits", author: "Adel S. Sedra, Kenneth C. Smith", department_id: 4, edition: "8th Ed.", total_copies: 5, available_copies: 4, shelf_location: "Shelf EE-01" },
        { id: 17, isbn: "978-0073529547", title: "Electric Machinery Fundamentals", author: "Stephen J. Chapman", department_id: 4, edition: "5th Ed.", total_copies: 4, available_copies: 4, shelf_location: "Shelf EE-02" },
        { id: 18, isbn: "978-0138147570", title: "Signals and Systems", author: "Alan V. Oppenheim, Alan S. Willsky", department_id: 4, edition: "2nd Ed.", total_copies: 5, available_copies: 5, shelf_location: "Shelf EE-03" },
        { id: 19, isbn: "978-1118170519", title: "Control Systems Engineering", author: "Norman S. Nise", department_id: 4, edition: "7th Ed.", total_copies: 4, available_copies: 3, shelf_location: "Shelf EE-04" },

        { id: 20, isbn: "978-8170088530", title: "Surveying (Vol I & II)", author: "B.C. Punmia, Ashok Kumar Jain", department_id: 5, edition: "16th Ed.", total_copies: 5, available_copies: 5, shelf_location: "Shelf CE-01" },
        { id: 21, isbn: "978-0470556849", title: "Soil Mechanics and Foundations", author: "Muni Budhu", department_id: 5, edition: "3rd Ed.", total_copies: 4, available_copies: 4, shelf_location: "Shelf CE-02" },
        { id: 22, isbn: "978-8187433231", title: "Design of Reinforced Concrete Structures", author: "S. Ramamrutham", department_id: 5, edition: "17th Ed.", total_copies: 6, available_copies: 5, shelf_location: "Shelf CE-03" },

        { id: 23, isbn: "978-8193328491", title: "Higher Engineering Mathematics", author: "B.S. Grewal", department_id: 6, edition: "44th Ed.", total_copies: 8, available_copies: 7, shelf_location: "Shelf BSH-01" },
        { id: 24, isbn: "978-0133978049", title: "University Physics with Modern Physics", author: "Hugh D. Young, Roger A. Freedman", department_id: 6, edition: "15th Ed.", total_copies: 5, available_copies: 5, shelf_location: "Shelf BSH-02" }
    ];

    const fmt = d => d.toISOString().split('T')[0];
    const subDays = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
    const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };

    const defaultIssues = [
        { id: 1, book_id: 1, student_name: "Arpan Sharma", roll_no: "CS23B104", student_dept: "Computer Science", issue_date: subDays(5), due_date: addDays(9), return_date: null, status: "ISSUED", fine_amount: 0, notes: "Semester research" },
        { id: 2, book_id: 2, student_name: "Rohan Mehta", roll_no: "CS23B082", student_dept: "Computer Science", issue_date: subDays(17), due_date: subDays(3), return_date: null, status: "ISSUED", fine_amount: 15, notes: "Overdue loan" },
        { id: 3, book_id: 6, student_name: "Ananya Verma", roll_no: "ME22B045", student_dept: "Mechanical Engineering", issue_date: subDays(20), due_date: subDays(6), return_date: subDays(7), status: "RETURNED", fine_amount: 0, notes: "Returned in mint condition" },
        { id: 4, book_id: 11, student_name: "Priya Nair", roll_no: "MD24M019", student_dept: "Medical Sciences", issue_date: subDays(3), due_date: addDays(11), return_date: null, status: "ISSUED", fine_amount: 0, notes: "Lab reference" }
    ];

    function initClientStore() {
        if (!localStorage.getItem('snu_depts')) {
            localStorage.setItem('snu_depts', JSON.stringify(defaultDepts));
        }
        if (!localStorage.getItem('snu_books')) {
            localStorage.setItem('snu_books', JSON.stringify(defaultBooks));
        }
        if (!localStorage.getItem('snu_issues')) {
            localStorage.setItem('snu_issues', JSON.stringify(defaultIssues));
        }
    }

    function calculateClientFine(dueStr) {
        try {
            const due = new Date(dueStr);
            const now = new Date();
            const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
            if (diffDays > 0) return { fine: diffDays * 5, days: diffDays };
            return { fine: 0, days: 0 };
        } catch (e) {
            return { fine: 0, days: 0 };
        }
    }

    async function mockApiHandler(url, options = {}) {
        initClientStore();
        const method = (options.method || 'GET').toUpperCase();
        const body = options.body ? JSON.parse(options.body) : {};

        const resObj = (data, status = 200) => ({
            ok: status >= 200 && status < 300,
            status: status,
            json: async () => data
        });

        const parsed = new URL(url, window.location.origin || 'http://localhost');
        const path = parsed.pathname;
        const q = parsed.searchParams;

        const depts = JSON.parse(localStorage.getItem('snu_depts') || '[]');
        const books = JSON.parse(localStorage.getItem('snu_books') || '[]');
        const issues = JSON.parse(localStorage.getItem('snu_issues') || '[]');

        if (path.endsWith('/api/departments') && method === 'GET') {
            const list = depts.map(d => {
                const bList = books.filter(b => b.department_id === d.id);
                const total = bList.reduce((acc, b) => acc + (b.total_copies || 0), 0);
                const avail = bList.reduce((acc, b) => acc + (b.available_copies || 0), 0);
                return { ...d, book_count: bList.length, total_copies: total, available_copies: avail };
            });
            return resObj(list);
        }

        if (path.endsWith('/api/stats') && method === 'GET') {
            const totalTitles = books.length;
            const totalCopies = books.reduce((acc, b) => acc + (b.total_copies || 0), 0);
            const availCopies = books.reduce((acc, b) => acc + (b.available_copies || 0), 0);
            const issuedCopies = totalCopies - availCopies;
            const activeBorrowers = new Set(issues.filter(i => i.status === 'ISSUED').map(i => i.roll_no)).size;

            let overdueCount = 0;
            const todayStr = fmt(new Date());
            issues.forEach(i => {
                if (i.status === 'ISSUED' && i.due_date < todayStr) overdueCount++;
            });

            const deptStats = depts.map(d => {
                const bList = books.filter(b => b.department_id === d.id);
                const tot = bList.reduce((acc, b) => acc + (b.total_copies || 0), 0);
                const av = bList.reduce((acc, b) => acc + (b.available_copies || 0), 0);
                return {
                    id: d.id, name: d.name, code: d.code, icon: d.icon, description: d.description,
                    title_count: bList.length, total_copies: tot, available_copies: av
                };
            });

            return resObj({
                total_titles: totalTitles,
                total_copies: totalCopies,
                available_copies: availCopies,
                issued_copies: issuedCopies,
                active_borrowers: activeBorrowers,
                overdue_count: overdueCount,
                departments_stats: deptStats
            });
        }

        if (path.endsWith('/api/books') && method === 'GET') {
            const deptId = q.get('department_id') ? parseInt(q.get('department_id')) : null;
            const search = (q.get('search') || '').toLowerCase().trim();
            const status = q.get('status') || 'all';

            let list = books.map(b => {
                const d = depts.find(d => d.id === b.department_id) || {};
                return { ...b, department_name: d.name || '', department_code: d.code || '' };
            });

            if (deptId) list = list.filter(b => b.department_id === deptId);
            if (status === 'available') list = list.filter(b => b.available_copies > 0);
            if (status === 'out_of_stock') list = list.filter(b => b.available_copies <= 0);
            if (search) {
                list = list.filter(b => 
                    b.title.toLowerCase().includes(search) ||
                    b.author.toLowerCase().includes(search) ||
                    b.isbn.toLowerCase().includes(search) ||
                    (b.shelf_location || '').toLowerCase().includes(search)
                );
            }
            return resObj(list);
        }

        if (path.includes('/api/books/') && method === 'GET') {
            const id = parseInt(path.split('/').pop());
            const book = books.find(b => b.id === id);
            if (!book) return resObj({ error: 'Book not found' }, 404);
            const d = depts.find(d => d.id === book.department_id) || {};
            return resObj({ ...book, department_name: d.name, department_code: d.code });
        }

        if (path.endsWith('/api/books') && method === 'POST') {
            const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
            const newBook = {
                id: newId,
                isbn: body.isbn,
                title: body.title,
                author: body.author,
                department_id: body.department_id,
                edition: body.edition || '1st Ed.',
                total_copies: body.total_copies,
                available_copies: body.total_copies,
                shelf_location: body.shelf_location || ''
            };
            books.push(newBook);
            localStorage.setItem('snu_books', JSON.stringify(books));
            return resObj({ message: 'Book added successfully', id: newId }, 201);
        }

        if (path.includes('/api/books/') && method === 'PUT') {
            const id = parseInt(path.split('/').pop());
            const idx = books.findIndex(b => b.id === id);
            if (idx === -1) return resObj({ error: 'Book not found' }, 404);
            const book = books[idx];
            const issued = book.total_copies - book.available_copies;
            const newTotal = body.total_copies;
            if (newTotal < issued) return resObj({ error: `Cannot set total to ${newTotal}. ${issued} copies currently issued.` }, 400);

            books[idx] = {
                ...book,
                isbn: body.isbn,
                title: body.title,
                author: body.author,
                department_id: body.department_id,
                edition: body.edition,
                total_copies: newTotal,
                available_copies: newTotal - issued,
                shelf_location: body.shelf_location
            };
            localStorage.setItem('snu_books', JSON.stringify(books));
            return resObj({ message: 'Book updated successfully' });
        }

        if (path.includes('/api/books/') && method === 'DELETE') {
            const id = parseInt(path.split('/').pop());
            const activeLoan = issues.some(i => i.book_id === id && i.status === 'ISSUED');
            if (activeLoan) return resObj({ error: 'Cannot delete book while copies are actively issued.' }, 400);

            const filtered = books.filter(b => b.id !== id);
            localStorage.setItem('snu_books', JSON.stringify(filtered));
            return resObj({ message: 'Book deleted successfully' });
        }

        if (path.endsWith('/api/issues') && method === 'GET') {
            const status = q.get('status') || 'all';
            const search = (q.get('search') || '').toLowerCase().trim();

            let list = issues.map(item => {
                const book = books.find(b => b.id === item.book_id) || {};
                const d = depts.find(d => d.id === book.department_id) || {};
                const calc = calculateClientFine(item.due_date);
                const isOverdue = item.status === 'ISSUED' && calc.days > 0;

                return {
                    ...item,
                    book_title: book.title || 'Unknown Title',
                    book_isbn: book.isbn || '',
                    department_name: d.name || '',
                    department_code: d.code || '',
                    calculated_fine: item.status === 'ISSUED' ? calc.fine : (item.fine_amount || 0),
                    overdue_days: item.status === 'ISSUED' ? calc.days : 0,
                    is_overdue: isOverdue
                };
            });

            if (status === 'ISSUED') list = list.filter(i => i.status === 'ISSUED');
            if (status === 'RETURNED') list = list.filter(i => i.status === 'RETURNED');
            if (status === 'OVERDUE') list = list.filter(i => i.is_overdue);

            if (search) {
                list = list.filter(i =>
                    i.student_name.toLowerCase().includes(search) ||
                    i.roll_no.toLowerCase().includes(search) ||
                    i.book_title.toLowerCase().includes(search)
                );
            }
            return resObj(list);
        }

        if (path.endsWith('/api/issues') && method === 'POST') {
            const bookIdx = books.findIndex(b => b.id === body.book_id);
            if (bookIdx === -1) return resObj({ error: 'Book not found' }, 404);
            if (books[bookIdx].available_copies <= 0) return resObj({ error: 'No copies available' }, 400);

            books[bookIdx].available_copies -= 1;
            const newIssueId = issues.length > 0 ? Math.max(...issues.map(i => i.id)) + 1 : 1;
            const due = addDays(body.days || 14);

            const newIssue = {
                id: newIssueId,
                book_id: body.book_id,
                student_name: body.student_name,
                roll_no: body.roll_no,
                student_dept: body.student_dept,
                issue_date: fmt(new Date()),
                due_date: due,
                return_date: null,
                status: 'ISSUED',
                fine_amount: 0,
                notes: body.notes || ''
            };
            issues.push(newIssue);

            localStorage.setItem('snu_books', JSON.stringify(books));
            localStorage.setItem('snu_issues', JSON.stringify(issues));

            return resObj({ message: 'Book issued successfully', due_date: due }, 201);
        }

        if (path.includes('/return') && method === 'POST') {
            const parts = path.split('/');
            const id = parseInt(parts[parts.indexOf('issues') + 1]);
            const issueIdx = issues.findIndex(i => i.id === id);
            if (issueIdx === -1) return resObj({ error: 'Issue record not found' }, 404);

            const issue = issues[issueIdx];
            if (issue.status === 'RETURNED') return resObj({ error: 'Already returned' }, 400);

            const calc = calculateClientFine(issue.due_date);
            issue.status = 'RETURNED';
            issue.return_date = fmt(new Date());
            issue.fine_amount = calc.fine;

            const bookIdx = books.findIndex(b => b.id === issue.book_id);
            if (bookIdx !== -1) {
                books[bookIdx].available_copies += 1;
                localStorage.setItem('snu_books', JSON.stringify(books));
            }
            localStorage.setItem('snu_issues', JSON.stringify(issues));

            return resObj({ message: 'Book returned successfully', return_date: issue.return_date, fine_amount: calc.fine });
        }

        return resObj({ error: 'Endpoint not found' }, 404);
    }

    const realFetch = window.fetch;
    window.fetch = async function(resource, init) {
        const urlStr = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');
        if (urlStr.includes('/api/')) {
            if (isGitHubPages) {
                return mockApiHandler(urlStr, init);
            }
            try {
                const res = await realFetch(resource, init);
                if (res.status === 404) {
                    return mockApiHandler(urlStr, init);
                }
                return res;
            } catch (err) {
                return mockApiHandler(urlStr, init);
            }
        }
        return realFetch(resource, init);
    };
})();

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
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = val.trim().length > 0 ? 'flex' : 'none';
    }

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

function clearGlobalSearch() {
    const input = document.getElementById('global-search');
    if (input) {
        input.value = '';
        input.focus();
    }
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    state.searchQuery = '';
    if (state.activeTab === 'catalog') {
        loadCatalogBooks();
    } else if (state.activeTab === 'issues') {
        loadIssues();
    }
}

// Quick Refresh of all system data
async function refreshCurrentData() {
    const refreshBtn = document.getElementById('btn-header-refresh');
    if (refreshBtn) refreshBtn.classList.add('rotating');

    try {
        await loadDepartments();
        if (state.activeTab === 'dashboard') await loadDashboard();
        if (state.activeTab === 'catalog') await loadCatalogBooks();
        if (state.activeTab === 'departments') renderFullDepartmentsGrid();
        if (state.activeTab === 'issues') await loadIssues();
        showToast('Library data refreshed', 'success');
    } catch (e) {
        showToast('Refreshed', 'info');
    } finally {
        setTimeout(() => {
            if (refreshBtn) refreshBtn.classList.remove('rotating');
        }, 400);
    }
}

// Stat Card Quick Navigation Handlers
function filterCatalogByStock(stockFilter) {
    switchTab('catalog');
    const select = document.getElementById('catalog-status-filter');
    if (select) {
        select.value = stockFilter;
        loadCatalogBooks();
    }
}

function filterLoansTab(status) {
    switchTab('issues');
    state.issuesStatusFilter = status;
    document.querySelectorAll('.loan-filter-chips .chip').forEach(c => {
        const onclickAttr = c.getAttribute('onclick') || '';
        c.classList.toggle('active', onclickAttr.includes(`'${status}'`));
    });
    loadIssues();
}

// Reset Catalog Filters
function resetCatalogFilters() {
    state.currentDeptFilter = '';
    state.searchQuery = '';
    const searchInput = document.getElementById('global-search');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    const statusSelect = document.getElementById('catalog-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    renderCatalogDeptChips();
    loadCatalogBooks();
    showToast('Catalog filters reset to all books', 'info');
}

// Reset Loan Filters
function resetLoanFilters() {
    state.issuesStatusFilter = 'all';
    state.searchQuery = '';
    const searchInput = document.getElementById('global-search');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    const chips = document.querySelectorAll('.loan-filter-chips .chip');
    chips.forEach((c, idx) => c.classList.toggle('active', idx === 0));

    loadIssues();
    showToast('Loan filters reset to all records', 'info');
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
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <div class="loan-status-box">
                        ${issue.is_overdue 
                            ? `<span class="badge badge-status-overdue"><i class="bi bi-clock-history"></i> Overdue (${issue.overdue_days}d)</span>` 
                            : `<span class="badge badge-status-active"><i class="bi bi-calendar-check"></i> Due ${issue.due_date}</span>`}
                    </div>
                    <button class="btn btn-outline-sm btn-quick-return" onclick="event.stopPropagation(); openReturnModal(${issue.id})" title="Process return for this book">
                        <i class="bi bi-arrow-return-left"></i> Return
                    </button>
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
async function openReturnModal(issueId) {
    let issue = state.issues.find(i => i.id === issueId);
    if (!issue) {
        try {
            const res = await fetch('/api/issues');
            state.issues = await res.json();
            issue = state.issues.find(i => i.id === issueId);
        } catch (err) {
            console.error('Error fetching issue details', err);
        }
    }
    if (!issue) {
        showToast('Loan record could not be loaded', 'error');
        return;
    }

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
