// Database Manager Class
class LibraryDatabase {
    constructor() {
        this.dbName = 'LibraryManagementSystem';
        this.version = 1;
        this.db = null;
        this.useIndexedDB = false; // Using localStorage for simplicity
    }

    // Initialize database
    async init() {
        if (this.useIndexedDB && 'indexedDB' in window) {
            return await this.initIndexedDB();
        } else {
            return this.initLocalStorage();
        }
    }

    // Initialize localStorage
    initLocalStorage() {
        console.log('Using localStorage for database');
        this.initializeDefaultData();
        return true;
    }

    // Initialize default data (empty system)
    initializeDefaultData() {
        // Initialize empty books data
        if (!localStorage.getItem('books')) {
            localStorage.setItem('books', JSON.stringify([]));
        }

        // Initialize empty students data
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([]));
        }

        // Initialize empty transactions data
        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }

        // Sample courses data (keeping courses as they're needed for the system)
        if (!localStorage.getItem('courses')) {
            const defaultCourses = [
                { code: 'BCA', name: 'Bachelor of Computer Applications', duration: 3, credits: 120 },
                { code: 'BBA', name: 'Bachelor of Business Administration', duration: 3, credits: 120 },
                { code: 'BALLB', name: 'Bachelor of Arts and Bachelor of Legislative Law', duration: 5, credits: 200 },
                { code: 'MBA', name: 'Master of Business Administration', duration: 2, credits: 60 },
                { code: 'BSc CSIT', name: 'Bachelor of Science in Computer Science and Information Technology', duration: 4, credits: 160 },
                { code: 'BDBM', name: 'Bachelor of Digital Business Management', duration: 3, credits: 120 }
            ];
            localStorage.setItem('courses', JSON.stringify(defaultCourses));
        }

        // Sample users data - Only admin user
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    fullName: 'System Administrator',
                    role: 'admin',
                    email: 'admin@rju.edu.np',
                    lastLogin: null,
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // System logs
        if (!localStorage.getItem('systemLogs')) {
            localStorage.setItem('systemLogs', JSON.stringify([]));
        }

        // System settings
        if (!localStorage.getItem('systemSettings')) {
            const settings = {
                libraryName: 'Rajarshi Janak University Library',
                maxBooksPerStudent: 3,
                maintenanceMode: false,
                autoBackup: true
            };
            localStorage.setItem('systemSettings', JSON.stringify(settings));
        }
    }

    // Generic database operations
    addLocalStorage(storeName, data) {
        const items = this.getAllLocalStorage(storeName);
        const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
        data.id = newId;
        items.push(data);
        localStorage.setItem(storeName, JSON.stringify(items));
        return newId;
    }

    getLocalStorage(storeName, key) {
        const items = this.getAllLocalStorage(storeName);
        return items.find(item => item.id == key || item.code == key);
    }

    getAllLocalStorage(storeName) {
        const data = localStorage.getItem(storeName);
        return data ? JSON.parse(data) : [];
    }

    updateLocalStorage(storeName, key, data) {
        const items = this.getAllLocalStorage(storeName);
        const index = items.findIndex(item => item.id == key || item.code == key);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(storeName, JSON.stringify(items));
            return true;
        }
        return false;
    }

    deleteLocalStorage(storeName, key) {
        const items = this.getAllLocalStorage(storeName);
        const filteredItems = items.filter(item => item.id != key && item.code != key);
        localStorage.setItem(storeName, JSON.stringify(filteredItems));
        return true;
    }

    // Books specific methods
    async addBook(bookData) {
        return await this.addLocalStorage('books', bookData);
    }

    async getBook(bookId) {
        return await this.getLocalStorage('books', bookId);
    }

    async getAllBooks() {
        return await this.getAllLocalStorage('books');
    }

    async updateBook(bookId, bookData) {
        return await this.updateLocalStorage('books', bookId, bookData);
    }

    async deleteBook(bookId) {
        return await this.deleteLocalStorage('books', bookId);
    }

    async searchBooks(query) {
        const allBooks = await this.getAllBooks();
        return allBooks.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.isbn.includes(query) ||
            book.course.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Students specific methods
    async addStudent(studentData) {
        return await this.addLocalStorage('students', studentData);
    }

    async getStudent(studentId) {
        return await this.getLocalStorage('students', studentId);
    }

    async getAllStudents() {
        return await this.getAllLocalStorage('students');
    }

    async updateStudent(studentId, studentData) {
        return await this.updateLocalStorage('students', studentId, studentData);
    }

    async deleteStudent(studentId) {
        return await this.deleteLocalStorage('students', studentId);
    }

    async searchStudents(query) {
        const allStudents = await this.getAllStudents();
        return allStudents.filter(student => 
            student.id.toLowerCase().includes(query.toLowerCase()) ||
            student.fullName.toLowerCase().includes(query.toLowerCase()) ||
            student.contactNo.includes(query) ||
            student.course.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Transactions specific methods
    async addTransaction(transactionData) {
        return await this.addLocalStorage('transactions', transactionData);
    }

    async getTransaction(transactionId) {
        return await this.getLocalStorage('transactions', transactionId);
    }

    async getAllTransactions() {
        return await this.getAllLocalStorage('transactions');
    }

    async updateTransaction(transactionId, transactionData) {
        return await this.updateLocalStorage('transactions', transactionId, transactionData);
    }

    async getCheckedOutBooks() {
        const allTransactions = await this.getAllTransactions();
        return allTransactions.filter(t => t.status === 'checked-out');
    }

    // Courses specific methods
    async addCourse(courseData) {
        return await this.addLocalStorage('courses', courseData);
    }

    async getCourse(courseCode) {
        return await this.getLocalStorage('courses', courseCode);
    }

    async getAllCourses() {
        return await this.getAllLocalStorage('courses');
    }

    async updateCourse(courseCode, courseData) {
        return await this.updateLocalStorage('courses', courseCode, courseData);
    }

    async deleteCourse(courseCode) {
        return await this.deleteLocalStorage('courses', courseCode);
    }

    // Users specific methods
    async getUserByUsername(username) {
        const allUsers = await this.getAllLocalStorage('users');
        return allUsers.find(user => user.username === username);
    }

    async getAllUsers() {
        return await this.getAllLocalStorage('users');
    }

    async updateUser(userId, userData) {
        return await this.updateLocalStorage('users', userId, userData);
    }

    async authenticateUser(username, password) {
        const user = await this.getUserByUsername(username);
        if (user && user.password === password && user.isActive) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            await this.updateUser(user.id, user);
            return user;
        }
        return null;
    }

    // System logs
    async addLog(logData) {
        const log = {
            ...logData,
            timestamp: new Date().toISOString(),
            id: null // Will be auto-generated
        };
        return await this.addLocalStorage('systemLogs', log);
    }

    async getAllLogs() {
        return await this.getAllLocalStorage('systemLogs');
    }

    // Statistics and reports
    async getLibraryStats() {
        const books = await this.getAllBooks();
        const students = await this.getAllStudents();
        const transactions = await this.getAllTransactions();
        
        const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0);
        const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0);
        const checkedOutTransactions = transactions.filter(t => t.status === 'checked-out');
        
        return {
            totalBooks: books.length,
            totalCopies: totalCopies,
            availableCopies: availableCopies,
            checkedOutBooks: checkedOutTransactions.length,
            totalStudents: students.length,
            totalTransactions: transactions.length
        };
    }

    async getCourseStats() {
        const books = await this.getAllBooks();
        const courses = await this.getAllCourses();
        const students = await this.getAllStudents();
        
        return courses.map(course => {
            const courseBooks = books.filter(book => book.course === course.code);
            const courseStudents = students.filter(student => student.course === course.code);
            const totalCopies = courseBooks.reduce((sum, book) => sum + book.totalCopies, 0);
            const availableCopies = courseBooks.reduce((sum, book) => sum + book.availableCopies, 0);
            
            return {
                courseCode: course.code,
                courseName: course.name,
                totalBooks: courseBooks.length,
                totalCopies: totalCopies,
                availableCopies: availableCopies,
                totalStudents: courseStudents.length
            };
        });
    }

    // Utility methods
    async generateStudentId(course, enrolledYear) {
        const students = await this.getAllStudents();
        const existingStudents = students.filter(student => 
            student.id.startsWith(course + enrolledYear)
        );
        
        const nextSequence = existingStudents.length + 1;
        const sequenceStr = nextSequence.toString().padStart(3, '0');
        return `${course}${enrolledYear}${sequenceStr}`;
    }
}

// Create global database instance
const LibraryDB = new LibraryDatabase();