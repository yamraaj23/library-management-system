// Library Management System Main Application
const LMS = {
    currentUser: null,
    isMobile: false,
    
    init: async function() {
        await LibraryDB.init();
        this.detectMobile();
        this.setupEventListeners();
        this.setupMobileEventListeners();
        this.setupAdminEventListeners();
        this.setupFreeSearch();
        await this.checkLoginStatus();
    },
    
    detectMobile: function() {
        this.isMobile = window.innerWidth <= 768;
        // Add touch detection
        this.isMobile = this.isMobile || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    },
    
    setupEventListeners: function() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage(link.dataset.page);
            });
        });
        
        // Forms
        document.getElementById('add-book-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });
        
        document.getElementById('add-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStudent();
        });
        
        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkoutBook();
        });
        
        document.getElementById('checkin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkinBook();
        });
        
        // Student form - show generated ID when course or year changes
        document.getElementById('student-course').addEventListener('change', () => {
            this.previewStudentId();
        });
        
        document.getElementById('student-enrolled-year').addEventListener('input', () => {
            this.previewStudentId();
        });
        
        // Search and Filters
        document.getElementById('book-search').addEventListener('input', (e) => {
            this.searchBooks(e.target.value);
        });
        
        document.getElementById('course-filter').addEventListener('change', (e) => {
            this.filterBooksByCourse(e.target.value);
        });
        
        document.getElementById('student-search').addEventListener('input', (e) => {
            this.searchStudents(e.target.value);
        });
        
        document.getElementById('student-course-filter').addEventListener('change', (e) => {
            this.filterStudentsByCourse(e.target.value);
        });
        
        document.getElementById('record-search').addEventListener('input', (e) => {
            this.searchRecords(e.target.value);
        });
        
        document.getElementById('record-course-filter').addEventListener('change', (e) => {
            this.filterRecordsByCourse(e.target.value);
        });
        
        document.getElementById('checked-out-search').addEventListener('input', (e) => {
            this.searchCheckedOutBooks(e.target.value);
        });
        
        document.getElementById('log-search').addEventListener('input', (e) => {
            this.searchLogs(e.target.value);
        });
        
        // Print and Export buttons
        document.getElementById('print-records-btn').addEventListener('click', () => {
            this.printRecords();
        });
        
        document.getElementById('export-excel-btn').addEventListener('click', () => {
            this.exportToExcel();
        });
        
        // Window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.detectMobile();
        });
    },
    
    setupMobileEventListeners: function() {
        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
            document.getElementById('mobile-nav').classList.add('active');
        });
        
        // Mobile menu close
        document.getElementById('mobile-nav-close').addEventListener('click', () => {
            document.getElementById('mobile-nav').classList.remove('active');
        });
        
        // Mobile navigation links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                document.getElementById('mobile-nav').classList.remove('active');
            });
        });
        
        // Mobile logout
        document.getElementById('mobile-logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
            document.getElementById('mobile-nav').classList.remove('active');
        });
        
        // Close mobile menu when clicking outside
        document.getElementById('mobile-nav').addEventListener('click', (e) => {
            if (e.target.id === 'mobile-nav') {
                document.getElementById('mobile-nav').classList.remove('active');
            }
        });
    },
    
    setupAdminEventListeners: function() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // User menu toggle
        document.getElementById('user-info').addEventListener('click', () => {
            document.getElementById('user-menu').classList.toggle('show');
        });
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Admin buttons
        document.getElementById('change-password-btn').addEventListener('click', () => {
            this.changePassword();
        });
        
        document.getElementById('backup-btn').addEventListener('click', () => {
            this.backupDatabase();
        });
        
        document.getElementById('maintenance-btn').addEventListener('click', () => {
            this.toggleMaintenanceMode();
        });
        
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.clearCache();
        });
        
        document.getElementById('add-course-btn').addEventListener('click', () => {
            this.addNewCourse();
        });
        
        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-info')) {
                document.getElementById('user-menu').classList.remove('show');
            }
        });
    },
    
    setupFreeSearch: function() {
        // Search functionality for checkout books
        document.getElementById('checkout-book-search').addEventListener('input', (e) => {
            this.searchBooksForCheckout(e.target.value);
        });
        
        // Search functionality for checkout students
        document.getElementById('checkout-student-search').addEventListener('input', (e) => {
            this.searchStudentsForCheckout(e.target.value);
        });
        
        // Search functionality for checkin books
        document.getElementById('checkin-book-search').addEventListener('input', (e) => {
            this.searchBooksForCheckin(e.target.value);
        });
        
        // Remove selection functionality
        document.querySelectorAll('.remove-selection').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                this.clearSelection(target);
            });
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.closeAllSearchResults();
            }
        });
    },
    
    searchBooksForCheckout: async function(query) {
        if (!query) {
            this.closeSearchResults('checkout-book-results');
            return;
        }
        
        const books = await LibraryDB.getAllBooks();
        const availableBooks = books.filter(book => book.availableCopies > 0);
        
        const filteredBooks = availableBooks.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.isbn.includes(query)
        );
        
        this.displaySearchResults('checkout-book-results', filteredBooks, 'book');
    },
    
    searchStudentsForCheckout: async function(query) {
        if (!query) {
            this.closeSearchResults('checkout-student-results');
            return;
        }
        
        const students = await LibraryDB.getAllStudents();
        
        const filteredStudents = students.filter(student => 
            student.fullName.toLowerCase().includes(query.toLowerCase()) ||
            student.id.toLowerCase().includes(query.toLowerCase()) ||
            student.contactNo.includes(query)
        );
        
        this.displaySearchResults('checkout-student-results', filteredStudents, 'student');
    },
    
    searchBooksForCheckin: async function(query) {
        if (!query) {
            this.closeSearchResults('checkin-book-results');
            return;
        }
        
        const transactions = await LibraryDB.getCheckedOutBooks();
        
        const filteredTransactions = transactions.filter(transaction => 
            transaction.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
            transaction.studentName.toLowerCase().includes(query.toLowerCase()) ||
            transaction.studentId.toLowerCase().includes(query)
        );
        
        this.displaySearchResults('checkin-book-results', filteredTransactions, 'transaction');
    },
    
    displaySearchResults: function(resultsContainerId, items, type) {
        const resultsContainer = document.getElementById(resultsContainerId);
        resultsContainer.innerHTML = '';
        
        if (items.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item">No results found</div>';
            resultsContainer.style.display = 'block';
            return;
        }
        
        items.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            if (type === 'book') {
                resultItem.innerHTML = `
                    <div class="search-result-title">${item.title}</div>
                    <div class="search-result-details">${item.author} | ${item.isbn} | ${item.course}</div>
                `;
                resultItem.dataset.id = item.id;
                resultItem.dataset.type = 'book';
            } else if (type === 'student') {
                resultItem.innerHTML = `
                    <div class="search-result-title">${item.fullName}</div>
                    <div class="search-result-details">${item.id} | ${item.course} | ${item.contactNo}</div>
                `;
                resultItem.dataset.id = item.id;
                resultItem.dataset.type = 'student';
            } else if (type === 'transaction') {
                resultItem.innerHTML = `
                    <div class="search-result-title">${item.bookTitle}</div>
                    <div class="search-result-details">${item.studentName} (${item.studentId}) | ${item.studentCourse}</div>
                `;
                resultItem.dataset.id = item.id;
                resultItem.dataset.type = 'transaction';
            }
            
            resultItem.addEventListener('click', () => {
                this.selectSearchItem(resultItem, resultsContainerId);
            });
            
            resultsContainer.appendChild(resultItem);
        });
        
        resultsContainer.style.display = 'block';
    },
    
    selectSearchItem: function(item, resultsContainerId) {
        const id = item.dataset.id;
        const type = item.dataset.type;
        
        // Close all search results
        this.closeAllSearchResults();
        
        // Set the selected item
        if (resultsContainerId === 'checkout-book-results') {
            this.setSelectedBookForCheckout(id);
        } else if (resultsContainerId === 'checkout-student-results') {
            this.setSelectedStudentForCheckout(id);
        } else if (resultsContainerId === 'checkin-book-results') {
            this.setSelectedTransactionForCheckin(id);
        }
    },
    
    setSelectedBookForCheckout: async function(bookId) {
        const book = await LibraryDB.getBook(bookId);
        if (book) {
            const selectedContainer = document.getElementById('checkout-book-selected');
            const selectedText = document.querySelector('#checkout-book-selected .selected-text');
            
            selectedText.textContent = `${book.title} by ${book.author} (${book.isbn})`;
            selectedContainer.style.display = 'block';
            
            // Store the selected book ID for form submission
            selectedContainer.dataset.selectedId = bookId;
            
            // Clear the search input
            document.getElementById('checkout-book-search').value = '';
        }
    },
    
    setSelectedStudentForCheckout: async function(studentId) {
        const student = await LibraryDB.getStudent(studentId);
        if (student) {
            const selectedContainer = document.getElementById('checkout-student-selected');
            const selectedText = document.querySelector('#checkout-student-selected .selected-text');
            
            selectedText.textContent = `${student.fullName} (${student.id}) - ${student.course}`;
            selectedContainer.style.display = 'block';
            
            // Store the selected student ID for form submission
            selectedContainer.dataset.selectedId = studentId;
            
            // Clear the search input
            document.getElementById('checkout-student-search').value = '';
        }
    },
    
    setSelectedTransactionForCheckin: async function(transactionId) {
        const transaction = await LibraryDB.getTransaction(transactionId);
        if (transaction) {
            const selectedContainer = document.getElementById('checkin-book-selected');
            const selectedText = document.querySelector('#checkin-book-selected .selected-text');
            
            selectedText.textContent = `${transaction.bookTitle} - ${transaction.studentName} (${transaction.studentId})`;
            selectedContainer.style.display = 'block';
            
            // Store the selected transaction ID for form submission
            selectedContainer.dataset.selectedId = transactionId;
            
            // Clear the search input
            document.getElementById('checkin-book-search').value = '';
        }
    },
    
    clearSelection: function(target) {
        const selectedContainer = document.getElementById(`${target}-selected`);
        if (selectedContainer) {
            selectedContainer.style.display = 'none';
            selectedContainer.dataset.selectedId = '';
            
            // Clear the search input
            const searchInput = document.getElementById(`${target}-search`);
            if (searchInput) {
                searchInput.value = '';
            }
        }
    },
    
    closeAllSearchResults: function() {
        document.querySelectorAll('.search-results').forEach(container => {
            container.style.display = 'none';
        });
    },
    
    closeSearchResults: function(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    },
    
    checkLoginStatus: async function() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showAdminInterface();
            await this.loadDashboard();
            await this.loadBooks();
            await this.loadStudents();
            await this.loadCheckinOptions();
            await this.loadRecords();
            await this.loadCourses();
        } else {
            this.showLoginPage();
        }
    },
    
    showLoginPage: function() {
        document.body.classList.add('not-logged-in');
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('login').classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
    },
    
    showAdminInterface: function() {
        document.body.classList.remove('not-logged-in');
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('dashboard').classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('[data-page="dashboard"]').classList.add('active');
        
        // Update user info
        document.getElementById('user-name-display').textContent = this.currentUser.fullName;
        
        // Load admin data if on admin page
        if (document.getElementById('admin').classList.contains('active')) {
            this.loadAdminPage();
        }
    },
    
    login: async function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = await LibraryDB.authenticateUser(username, password);
        
        if (user) {
            // Set current user
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Add system log
            await LibraryDB.addLog({
                user: user.username,
                action: 'Login',
                details: 'Admin logged into the system'
            });
            
            // Show admin interface
            this.showAdminInterface();
            
            // Load data
            await this.loadDashboard();
            await this.loadBooks();
            await this.loadStudents();
            await this.loadCheckinOptions();
            await this.loadRecords();
            await this.loadCourses();
            
            // Show success message
            LMSUtils.showAlert(`Welcome back, ${user.fullName}!`, 'success');
        } else {
            // Show error
            document.getElementById('login-error').style.display = 'block';
        }
    },
    
    logout: async function() {
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Logout',
            details: 'Admin logged out of the system'
        });
        
        // Clear current user
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Show login page
        this.showLoginPage();
        
        // Show message
        LMSUtils.showAlert('You have been logged out successfully.', 'success');
    },
    
    loadAdminPage: async function() {
        if (!this.currentUser) return;
        
        // Update admin info
        document.getElementById('admin-name').textContent = this.currentUser.fullName;
        document.getElementById('admin-avatar').textContent = this.currentUser.fullName.charAt(0);
        
        // Load system logs
        await this.loadSystemLogs();
        
        // Load courses table
        await this.loadCoursesTable();
    },
    
    loadSystemLogs: async function() {
        const logs = await LibraryDB.getAllLogs();
        const logsTable = document.getElementById('system-logs');
        logsTable.innerHTML = '';
        
        // Show latest logs first
        const recentLogs = logs.slice(-20).reverse();
        
        if (recentLogs.length === 0) {
            logsTable.innerHTML = '<tr><td colspan="4" class="empty-state">No system logs found</td></tr>';
            return;
        }
        
        recentLogs.forEach(log => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.user}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
            
            logsTable.appendChild(row);
        });
    },
    
    searchLogs: async function(query) {
        const logs = await LibraryDB.getAllLogs();
        const filteredLogs = logs.filter(log => 
            log.user.toLowerCase().includes(query.toLowerCase()) ||
            log.action.toLowerCase().includes(query.toLowerCase()) ||
            log.details.toLowerCase().includes(query.toLowerCase())
        ).slice(-20).reverse();
        
        const logsTable = document.getElementById('system-logs');
        logsTable.innerHTML = '';
        
        if (filteredLogs.length === 0) {
            logsTable.innerHTML = '<tr><td colspan="4" class="empty-state">No matching logs found</td></tr>';
            return;
        }
        
        filteredLogs.forEach(log => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.user}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
            
            logsTable.appendChild(row);
        });
    },
    
    changePassword: async function() {
        const newPassword = prompt('Enter new password:');
        if (newPassword) {
            const users = await LibraryDB.getAllUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                // Add system log
                await LibraryDB.addLog({
                    user: this.currentUser.username,
                    action: 'Password Change',
                    details: 'Admin changed their password'
                });
                
                LMSUtils.showAlert('Password changed successfully!', 'success');
            }
        }
    },
    
    backupDatabase: async function() {
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Database Backup',
            details: 'Admin initiated a database backup'
        });
        
        // Update last backup time
        document.getElementById('admin-last-backup').textContent = new Date().toLocaleDateString();
        
        LMSUtils.showAlert('Database backup completed successfully!', 'success');
    },
    
    toggleMaintenanceMode: async function() {
        const isMaintenance = document.body.classList.toggle('maintenance-mode');
        
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Maintenance Mode',
            details: `Maintenance mode ${isMaintenance ? 'enabled' : 'disabled'}`
        });
        
        LMSUtils.showAlert(`Maintenance mode ${isMaintenance ? 'enabled' : 'disabled'}!`, 'success');
    },
    
    clearCache: async function() {
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Clear Cache',
            details: 'Admin cleared system cache'
        });
        
        LMSUtils.showAlert('System cache cleared successfully!', 'success');
    },
    
    loadCourses: async function() {
        const courses = await LibraryDB.getAllCourses();
        this.populateCourseSelects(courses);
    },
    
    loadCoursesTable: async function() {
        const courses = await LibraryDB.getAllCourses();
        this.renderCoursesTable(courses);
    },
    
    populateCourseSelects: function(courses) {
        const courseSelects = [
            'book-course',
            'student-course',
            'course-filter',
            'student-course-filter',
            'record-course-filter'
        ];
        
        courseSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options except the first one
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                // Add course options
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.code;
                    option.textContent = `${course.code} - ${course.name}`;
                    select.appendChild(option);
                });
            }
        });
    },
    
    renderCoursesTable: function(courses) {
        const coursesTable = document.getElementById('courses-table');
        if (!coursesTable) return;
        
        coursesTable.innerHTML = '';
        
        if (courses.length === 0) {
            coursesTable.innerHTML = '<tr><td colspan="5" class="empty-state">No courses found</td></tr>';
            return;
        }
        
        courses.forEach(course => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${course.code}</td>
                <td>${course.name}</td>
                <td>${course.duration} years</td>
                <td>${course.credits}</td>
                <td>
                    <button class="warning" onclick="LMS.editCourse('${course.code}')">Edit</button>
                    <button class="danger" onclick="LMS.deleteCourse('${course.code}')">Delete</button>
                </td>
            `;
            
            coursesTable.appendChild(row);
        });
    },
    
    addNewCourse: async function() {
        const code = prompt('Enter course code (e.g., BCA):');
        if (!code) return;
        
        const name = prompt('Enter course name:');
        if (!name) return;
        
        const duration = prompt('Enter course duration (years):', '3');
        if (!duration) return;
        
        const credits = prompt('Enter total credits:', '120');
        if (!credits) return;
        
        const courses = await LibraryDB.getAllCourses();
        
        // Check if course code already exists
        if (courses.find(c => c.code === code)) {
            LMSUtils.showAlert('Course code already exists!', 'danger');
            return;
        }
        
        const newCourse = {
            code: code,
            name: name,
            duration: parseInt(duration),
            credits: parseInt(credits)
        };
        
        await LibraryDB.addCourse(newCourse);
        
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Course Creation',
            details: `Created new course: ${code} - ${name}`
        });
        
        await this.loadCourses();
        await this.loadCoursesTable();
        LMSUtils.showAlert('Course created successfully!', 'success');
    },
    
    editCourse: async function(courseCode) {
        const course = await LibraryDB.getCourse(courseCode);
        
        if (course) {
            const newName = prompt('Enter new course name:', course.name);
            if (newName) {
                course.name = newName;
                await LibraryDB.updateCourse(courseCode, course);
                
                // Add system log
                await LibraryDB.addLog({
                    user: this.currentUser.username,
                    action: 'Course Edit',
                    details: `Updated course: ${courseCode} to ${newName}`
                });
                
                await this.loadCourses();
                await this.loadCoursesTable();
                LMSUtils.showAlert('Course updated successfully!', 'success');
            }
        }
    },
    
    deleteCourse: async function(courseCode) {
        if (confirm('Are you sure you want to delete this course?')) {
            // Check if any books or students are using this course
            const books = await LibraryDB.getAllBooks();
            const students = await LibraryDB.getAllStudents();
            
            const booksUsingCourse = books.filter(b => b.course === courseCode);
            const studentsUsingCourse = students.filter(s => s.course === courseCode);
            
            if (booksUsingCourse.length > 0 || studentsUsingCourse.length > 0) {
                LMSUtils.showAlert(`Cannot delete course. It is being used by ${booksUsingCourse.length} book(s) and ${studentsUsingCourse.length} student(s).`, 'danger');
                return;
            }
            
            const course = await LibraryDB.getCourse(courseCode);
            await LibraryDB.deleteCourse(courseCode);
            
            // Add system log
            await LibraryDB.addLog({
                user: this.currentUser.username,
                action: 'Course Deletion',
                details: `Deleted course: ${courseCode} - ${course.name}`
            });
            
            await this.loadCourses();
            await this.loadCoursesTable();
            LMSUtils.showAlert('Course deleted successfully!', 'success');
        }
    },
    
    showPage: async function(pageId) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
        
        // Show active page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        
        // Refresh page-specific data
        if (pageId === 'dashboard') await this.loadDashboard();
        if (pageId === 'books') {
            await this.loadBooks();
            await this.loadCourses();
        }
        if (pageId === 'students') {
            await this.loadStudents();
            // Reset student form when showing students page
            document.getElementById('add-student-form').reset();
            document.getElementById('generated-student-id').style.display = 'none';
        }
        if (pageId === 'check_out') {
            // Reset checkout form
            document.getElementById('checkout-form').reset();
            this.clearSelection('checkout-book');
            this.clearSelection('checkout-student');
        }
        if (pageId === 'check_in') {
            // Reset checkin form
            document.getElementById('checkin-form').reset();
            this.clearSelection('checkin-book');
            await this.loadCheckedOutBooks();
        }
        if (pageId === 'records') await this.loadRecords();
        if (pageId === 'admin') await this.loadAdminPage();
    },
    
    loadDashboard: async function() {
        const stats = await LibraryDB.getLibraryStats();
        const courseStats = await LibraryDB.getCourseStats();
        const transactions = await LibraryDB.getAllTransactions();
        
        // Update stats
        document.getElementById('total-books').textContent = stats.totalBooks;
        document.getElementById('available-books').textContent = stats.availableCopies;
        document.getElementById('checked-out-books').textContent = stats.checkedOutBooks;
        document.getElementById('unique-titles').textContent = stats.totalBooks;
        document.getElementById('total-copies').textContent = stats.totalCopies;
        document.getElementById('total-students').textContent = stats.totalStudents;
        
        // Course statistics
        await this.loadCourseStats(courseStats);
        
        // Recent activity
        await this.loadRecentActivity(transactions);
    },
    
    loadCourseStats: function(courseStats) {
        const courseStatsContainer = document.getElementById('course-stats');
        courseStatsContainer.innerHTML = '';
        
        courseStats.forEach(course => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <h4>${course.courseCode}</h4>
                <p>${course.totalBooks}</p>
                <small>${course.availableCopies}/${course.totalCopies} available</small>
            `;
            
            courseStatsContainer.appendChild(statItem);
        });
    },
    
    loadRecentActivity: function(transactions) {
        const recentActivity = document.getElementById('recent-activity');
        recentActivity.innerHTML = '';
        
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.checkoutDate) - new Date(a.checkoutDate))
            .slice(0, 5);
        
        if (recentTransactions.length === 0) {
            recentActivity.innerHTML = '<tr><td colspan="4" class="empty-state">No recent activity</td></tr>';
            return;
        }
        
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const action = transaction.status === 'checked-out' ? 'Checked Out' : 'Returned';
            
            row.innerHTML = `
                <td>${transaction.checkoutDate}</td>
                <td>${transaction.bookTitle}</td>
                <td>${transaction.studentName}</td>
                <td>${action}</td>
            `;
            
            recentActivity.appendChild(row);
        });
    },
    
    loadBooks: async function() {
        const books = await LibraryDB.getAllBooks();
        this.renderBooksTable(books);
    },
    
    renderBooksTable: function(books) {
        const booksTable = document.getElementById('books-table');
        booksTable.innerHTML = '';
        
        if (books.length === 0) {
            booksTable.innerHTML = '<tr><td colspan="10" class="empty-state">No books found. Add your first book to get started.</td></tr>';
            return;
        }
        
        books.forEach(book => {
            const row = document.createElement('tr');
            const statusClass = book.availableCopies > 0 ? 'status-available' : 'status-checked-out';
            const statusText = book.availableCopies > 0 ? 'Available' : 'All Checked Out';
            const courseClass = LMSUtils.getCourseBadgeClass(book.course);
            
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.edition || 'N/A'}</td>
                <td>${book.isbn}</td>
                <td><span class="${courseClass}">${book.course}</span></td>
                <td>${book.totalCopies}</td>
                <td>${book.availableCopies}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <div class="action-buttons">
                        <button class="success" onclick="LMS.increaseCopies(${book.id})">+</button>
                        <button class="danger" onclick="LMS.decreaseCopies(${book.id})">-</button>
                        <button class="danger" onclick="LMS.deleteBook(${book.id})">Delete</button>
                    </div>
                </td>
            `;
            
            booksTable.appendChild(row);
        });
    },
    
    searchBooks: async function(query) {
        const filteredBooks = await LibraryDB.searchBooks(query);
        this.renderBooksTable(filteredBooks);
    },
    
    filterBooksByCourse: async function(course) {
        const allBooks = await LibraryDB.getAllBooks();
        const searchQuery = document.getElementById('book-search').value;
        
        let filteredBooks = allBooks;
        
        if (course) {
            filteredBooks = filteredBooks.filter(book => book.course === course);
        }
        
        if (searchQuery) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.isbn.includes(searchQuery) ||
                book.course.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        this.renderBooksTable(filteredBooks);
    },
    
    addBook: async function() {
        const title = document.getElementById('book-title').value;
        const author = document.getElementById('book-author').value;
        const isbn = document.getElementById('book-isbn').value;
        const edition = document.getElementById('book-edition').value;
        const course = document.getElementById('book-course').value;
        const copies = parseInt(document.getElementById('book-copies').value);
        
        const bookData = {
            title,
            author,
            isbn,
            edition,
            course,
            totalCopies: copies,
            availableCopies: copies
        };
        
        await LibraryDB.addBook(bookData);
        
        // Reset form
        document.getElementById('add-book-form').reset();
        
        // Show success message
        LMSUtils.showAlert('Book added successfully!', 'success');
        
        // Refresh books list
        await this.loadBooks();
        await this.loadDashboard();
        
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Book Added',
            details: `Added book: ${title} by ${author}`
        });
    },
    
    increaseCopies: async function(bookId) {
        const book = await LibraryDB.getBook(bookId);
        
        if (book) {
            book.totalCopies += 1;
            book.availableCopies += 1;
            await LibraryDB.updateBook(bookId, book);
            
            await this.loadBooks();
            await this.loadDashboard();
            
            LMSUtils.showAlert('Book copy added successfully!', 'success');
        }
    },
    
    decreaseCopies: async function(bookId) {
        const book = await LibraryDB.getBook(bookId);
        
        if (book) {
            if (book.totalCopies > 1) {
                book.totalCopies -= 1;
                
                // Make sure we don't have negative available copies
                if (book.availableCopies > 0) {
                    book.availableCopies -= 1;
                }
                
                await LibraryDB.updateBook(bookId, book);
                
                await this.loadBooks();
                await this.loadDashboard();
                
                LMSUtils.showAlert('Book copy removed successfully!', 'success');
            } else {
                LMSUtils.showAlert('Cannot remove the last copy of a book. Delete the book instead.', 'danger');
            }
        }
    },
    
    deleteBook: async function(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            const book = await LibraryDB.getBook(bookId);
            
            // Check if any copies are currently checked out
            const transactions = await LibraryDB.getAllTransactions();
            const checkedOutCopies = transactions.filter(t => 
                t.bookId === bookId && t.status === 'checked-out'
            ).length;
            
            if (checkedOutCopies > 0) {
                LMSUtils.showAlert(`Cannot delete book. ${checkedOutCopies} copy/copies are currently checked out.`, 'danger');
                return;
            }
            
            await LibraryDB.deleteBook(bookId);
            
            // Refresh books list
            await this.loadBooks();
            await this.loadDashboard();
            
            LMSUtils.showAlert('Book deleted successfully!', 'success');
            
            // Add system log
            await LibraryDB.addLog({
                user: this.currentUser.username,
                action: 'Book Deleted',
                details: `Deleted book: ${book.title} by ${book.author}`
            });
        }
    },
    
    loadStudents: async function() {
        const students = await LibraryDB.getAllStudents();
        this.renderStudentsTable(students);
    },
    
    renderStudentsTable: function(students) {
        const studentsTable = document.getElementById('students-table');
        studentsTable.innerHTML = '';
        
        if (students.length === 0) {
            studentsTable.innerHTML = '<tr><td colspan="6" class="empty-state">No students found. Add your first student to get started.</td></tr>';
            return;
        }
        
        students.forEach(student => {
            const row = document.createElement('tr');
            const courseClass = LMSUtils.getCourseBadgeClass(student.course);
            
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.fullName}</td>
                <td>${student.contactNo}</td>
                <td><span class="${courseClass}">${student.course}</span></td>
                <td>${student.enrolledYear}</td>
                <td>
                    <button class="warning" onclick="LMS.viewStudentProfile('${student.id}')">View</button>
                    <button class="danger" onclick="LMS.deleteStudent('${student.id}')">Delete</button>
                </td>
            `;
            
            studentsTable.appendChild(row);
        });
    },
    
    searchStudents: async function(query) {
        const filteredStudents = await LibraryDB.searchStudents(query);
        this.renderStudentsTable(filteredStudents);
    },
    
    filterStudentsByCourse: async function(course) {
        const allStudents = await LibraryDB.getAllStudents();
        const searchQuery = document.getElementById('student-search').value;
        
        let filteredStudents = allStudents;
        
        if (course) {
            filteredStudents = filteredStudents.filter(student => student.course === course);
        }
        
        if (searchQuery) {
            filteredStudents = filteredStudents.filter(student => 
                student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.contactNo.includes(searchQuery)
            );
        }
        
        this.renderStudentsTable(filteredStudents);
    },
    
    previewStudentId: async function() {
        const course = document.getElementById('student-course').value;
        const enrolledYear = document.getElementById('student-enrolled-year').value;
        
        if (course && enrolledYear) {
            const generatedId = await LibraryDB.generateStudentId(course, enrolledYear);
            document.getElementById('student-id-preview').textContent = generatedId;
            document.getElementById('generated-student-id').style.display = 'block';
        } else {
            document.getElementById('generated-student-id').style.display = 'none';
        }
    },
    
    addStudent: async function() {
        const fullName = document.getElementById('student-fullname').value;
        const contactNo = document.getElementById('student-contact').value;
        const course = document.getElementById('student-course').value;
        const enrolledYear = parseInt(document.getElementById('student-enrolled-year').value);
        
        if (!course) {
            LMSUtils.showAlert('Please select a course!', 'danger');
            return;
        }
        
        // Generate student ID
        const studentId = await LibraryDB.generateStudentId(course, enrolledYear);
        
        const studentData = {
            id: studentId,
            fullName,
            contactNo,
            course,
            enrolledYear
        };
        
        await LibraryDB.addStudent(studentData);
        
        // Show success message with generated ID
        LMSUtils.showAlert(`Student added successfully! Student ID: ${studentId}`, 'success');
        
        // Reset form
        document.getElementById('add-student-form').reset();
        document.getElementById('generated-student-id').style.display = 'none';
        
        // Refresh students list
        await this.loadStudents();
        await this.loadDashboard();
        
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Student Added',
            details: `Added student: ${fullName} (${studentId})`
        });
    },
    
    viewStudentProfile: async function(studentId) {
        const student = await LibraryDB.getStudent(studentId);
        
        if (student) {
            alert(`Student Profile:\n\nID: ${student.id}\nName: ${student.fullName}\nContact: ${student.contactNo}\nCourse: ${student.course}\nEnrolled Year: ${student.enrolledYear}`);
        }
    },
    
    deleteStudent: async function(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            const transactions = await LibraryDB.getAllTransactions();
            
            // Check if student has any books checked out
            const checkedOutBooks = transactions.filter(t => 
                t.studentId === studentId && t.status === 'checked-out'
            ).length;
            
            if (checkedOutBooks > 0) {
                LMSUtils.showAlert(`Cannot delete student. ${checkedOutBooks} book(s) are currently checked out.`, 'danger');
                return;
            }
            
            const student = await LibraryDB.getStudent(studentId);
            await LibraryDB.deleteStudent(studentId);
            
            // Refresh students list
            await this.loadStudents();
            await this.loadDashboard();
            
            LMSUtils.showAlert('Student deleted successfully!', 'success');
            
            // Add system log
            await LibraryDB.addLog({
                user: this.currentUser.username,
                action: 'Student Deleted',
                details: `Deleted student: ${student.fullName} (${studentId})`
            });
        }
    },
    
    loadCheckinOptions: async function() {
        // This function is no longer needed as we're using free search only
    },
    
    checkoutBook: async function() {
        let bookId, studentId;
        
        // Using free search
        const bookSelected = document.getElementById('checkout-book-selected');
        const studentSelected = document.getElementById('checkout-student-selected');
        
        if (!bookSelected.dataset.selectedId || !studentSelected.dataset.selectedId) {
            LMSUtils.showAlert('Please select both a book and a student!', 'danger');
            return;
        }
        
        bookId = parseInt(bookSelected.dataset.selectedId);
        studentId = studentSelected.dataset.selectedId;
        
        if (!bookId || !studentId) {
            LMSUtils.showAlert('Please fill in all fields!', 'danger');
            return;
        }
        
        // Get student details
        const student = await LibraryDB.getStudent(studentId);
        
        if (!student) {
            LMSUtils.showAlert('Student not found!', 'danger');
            return;
        }
        
        // Update book available copies
        const book = await LibraryDB.getBook(bookId);
        if (book.availableCopies > 0) {
            book.availableCopies -= 1;
            await LibraryDB.updateBook(bookId, book);
        } else {
            LMSUtils.showAlert('No copies available for checkout!', 'danger');
            return;
        }
        
        // Create transaction
        const today = new Date();
        
        const transactionData = {
            bookId: bookId,
            bookTitle: book.title,
            studentId: studentId,
            studentName: student.fullName,
            studentCourse: student.course,
            checkoutDate: today.toISOString().split('T')[0],
            checkinDate: null,
            status: 'checked-out'
        };
        
        await LibraryDB.addTransaction(transactionData);
        
        // Reset form
        document.getElementById('checkout-form').reset();
        
        // Clear free search selections
        this.clearSelection('checkout-book');
        this.clearSelection('checkout-student');
        
        // Show success message
        LMSUtils.showAlert('Book checked out successfully!', 'success');
        
        // Refresh data
        await this.loadDashboard();
        await this.loadBooks();
        
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Book Checkout',
            details: `Checked out: ${book.title} to ${student.fullName}`
        });
    },
    
    loadCheckedOutBooks: async function() {
        const transactions = await LibraryDB.getCheckedOutBooks();
        this.renderCheckedOutTable(transactions);
    },
    
    renderCheckedOutTable: function(transactions) {
        const checkedOutTable = document.getElementById('checked-out-table');
        checkedOutTable.innerHTML = '';
        
        if (transactions.length === 0) {
            checkedOutTable.innerHTML = '<tr><td colspan="7" class="empty-state">No books currently checked out</td></tr>';
            return;
        }
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const statusClass = 'status-checked-out';
            const statusText = 'Checked Out';
            const courseClass = LMSUtils.getCourseBadgeClass(transaction.studentCourse);
            
            row.innerHTML = `
                <td>${transaction.bookId}</td>
                <td>${transaction.bookTitle}</td>
                <td>${transaction.studentName}</td>
                <td>${transaction.studentId}</td>
                <td><span class="${courseClass}">${transaction.studentCourse}</span></td>
                <td>${transaction.checkoutDate}</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            
            checkedOutTable.appendChild(row);
        });
    },
    
    searchCheckedOutBooks: async function(query) {
        const transactions = await LibraryDB.getCheckedOutBooks();
        
        let filteredTransactions = transactions.filter(transaction => 
            transaction.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
            transaction.studentName.toLowerCase().includes(query.toLowerCase()) ||
            transaction.studentId.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderCheckedOutTable(filteredTransactions);
    },
    
    checkinBook: async function() {
        let transactionId;
        
        // Using free search
        const transactionSelected = document.getElementById('checkin-book-selected');
        
        if (!transactionSelected.dataset.selectedId) {
            LMSUtils.showAlert('Please select a book to check in!', 'danger');
            return;
        }
        
        transactionId = parseInt(transactionSelected.dataset.selectedId);
        
        if (!transactionId) {
            LMSUtils.showAlert('Please select a book to check in!', 'danger');
            return;
        }
        
        const transaction = await LibraryDB.getTransaction(transactionId);
        
        if (transaction) {
            // Update transaction
            transaction.status = 'returned';
            transaction.checkinDate = new Date().toISOString().split('T')[0];
            
            // Update book available copies
            const book = await LibraryDB.getBook(transaction.bookId);
            if (book) {
                book.availableCopies += 1;
                await LibraryDB.updateBook(transaction.bookId, book);
            }
            
            await LibraryDB.updateTransaction(transactionId, transaction);
            
            // Reset form
            document.getElementById('checkin-form').reset();
            
            // Clear free search selection
            this.clearSelection('checkin-book');
            
            // Show success message
            LMSUtils.showAlert('Book checked in successfully!', 'success');
            
            // Refresh data
            await this.loadDashboard();
            await this.loadBooks();
            await this.loadCheckedOutBooks();
            await this.loadRecords();
            
            // Add system log
            await LibraryDB.addLog({
                user: this.currentUser.username,
                action: 'Book Checkin',
                details: `Checked in: ${transaction.bookTitle} from ${transaction.studentName}`
            });
        }
    },
    
    loadRecords: async function() {
        const transactions = await LibraryDB.getAllTransactions();
        this.renderRecordsTable(transactions);
    },
    
    renderRecordsTable: function(transactions) {
        const recordsTable = document.getElementById('records-table');
        recordsTable.innerHTML = '';
        
        if (transactions.length === 0) {
            recordsTable.innerHTML = '<tr><td colspan="8" class="empty-state">No transaction records found</td></tr>';
            return;
        }
        
        // Sort by checkout date (newest first)
        const sortedTransactions = transactions.sort((a, b) => 
            new Date(b.checkoutDate) - new Date(a.checkoutDate)
        );
        
        sortedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            const statusClass = transaction.status === 'checked-out' ? 'status-checked-out' : 'status-available';
            const statusText = transaction.status === 'checked-out' ? 'Checked Out' : 'Returned';
            const courseClass = LMSUtils.getCourseBadgeClass(transaction.studentCourse);
            
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.bookTitle}</td>
                <td>${transaction.studentName}</td>
                <td>${transaction.studentId}</td>
                <td><span class="${courseClass}">${transaction.studentCourse}</span></td>
                <td>${transaction.checkoutDate}</td>
                <td>${transaction.checkinDate || 'N/A'}</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            
            recordsTable.appendChild(row);
        });
    },
    
    searchRecords: async function(query) {
        const transactions = await LibraryDB.getAllTransactions();
        const courseFilter = document.getElementById('record-course-filter').value;
        
        let filteredTransactions = transactions.filter(transaction => 
            transaction.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
            transaction.studentName.toLowerCase().includes(query.toLowerCase()) ||
            transaction.studentId.toLowerCase().includes(query.toLowerCase())
        );
        
        if (courseFilter) {
            filteredTransactions = filteredTransactions.filter(transaction => 
                transaction.studentCourse === courseFilter
            );
        }
        
        this.renderRecordsTable(filteredTransactions);
    },
    
    filterRecordsByCourse: async function(course) {
        const transactions = await LibraryDB.getAllTransactions();
        const searchQuery = document.getElementById('record-search').value;
        
        let filteredTransactions = transactions;
        
        if (course) {
            filteredTransactions = filteredTransactions.filter(transaction => 
                transaction.studentCourse === course
            );
        }
        
        if (searchQuery) {
            filteredTransactions = filteredTransactions.filter(transaction => 
                transaction.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.studentId.toLowerCase().includes(searchQuery)
            );
        }
        
        this.renderRecordsTable(filteredTransactions);
    },
    
    printRecords: function() {
        // Ensure we're on the records page
        this.showPage('records');
        
        // Wait a moment for the page to render, then print
        setTimeout(() => {
            window.print();
        }, 500);
    },
    
    exportToExcel: async function() {
        const transactions = await LibraryDB.getAllTransactions();
        
        if (transactions.length === 0) {
            LMSUtils.showAlert('No records to export!', 'danger');
            return;
        }
        
        // Create CSV content
        const headers = ['Transaction ID', 'Book Title', 'Student Name', 'Student ID', 'Course', 'Check Out Date', 'Check In Date', 'Status'];
        const csvData = transactions.map(t => ({
            'Transaction ID': t.id,
            'Book Title': t.bookTitle,
            'Student Name': t.studentName,
            'Student ID': t.studentId,
            'Course': t.studentCourse,
            'Check Out Date': t.checkoutDate,
            'Check In Date': t.checkinDate || 'N/A',
            'Status': t.status === 'checked-out' ? 'Checked Out' : 'Returned'
        }));
        
        const csvContent = LMSUtils.generateCSV(csvData, headers);
        
        // Download the file
        const filename = `library_records_${new Date().toISOString().split('T')[0]}.csv`;
        LMSUtils.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
        
        // Add system log
        await LibraryDB.addLog({
            user: this.currentUser.username,
            action: 'Export Records',
            details: 'Exported transaction records to Excel/CSV'
        });
        
        LMSUtils.showAlert('Records exported successfully!', 'success');
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    LMS.init();
});