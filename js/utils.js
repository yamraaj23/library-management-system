// Utility functions for the Library Management System
const LMSUtils = {
    // Show alert message
    showAlert: function(message, type) {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // Insert at the top of the main content
        const main = document.querySelector('main .container');
        main.insertBefore(alert, main.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            alert.remove();
        }, 3000);
    },

    // Format date for display
    formatDate: function(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    // Generate CSV content from data
    generateCSV: function(data, headers) {
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
            const csvRow = headers.map(header => {
                let value = row[header] || '';
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csvContent += csvRow.join(',') + '\n';
        });
        
        return csvContent;
    },

    // Download file
    downloadFile: function(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    },

    // Validate email format
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone number (basic validation)
    validatePhone: function(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    // Debounce function for search inputs
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get course badge class
    getCourseBadgeClass: function(courseCode) {
        return `course-badge course-${courseCode.toLowerCase().replace(' ', '-')}`;
    },

    // Check if device is mobile
    isMobileDevice: function() {
        return window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    },

    // Generate random color for avatars
    generateAvatarColor: function(name) {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12', 
            '#1abc9c', '#34495e', '#d35400', '#c0392b', '#8e44ad'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    },

    // Format file size
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};