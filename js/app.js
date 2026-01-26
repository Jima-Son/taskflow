/**
 * APP.JS
 * Main application controller
 * Coordinates between StorageManager and UIManager
 * Handles all event listeners and application logic
 */

const AppController = {
    
    // Application state
    state: {
        currentTasks: [],
        currentCategories: [],
        settings: {},
        editingTaskId: null
    },

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing TaskFlow...');

        // Load data from storage
        this.loadData();

        // Initialize UI
        this.initializeUI();

        // Set up event listeners
        this.setupEventListeners();

        // Apply saved theme
        UIManager.applyTheme(this.state.settings.theme);

        // Initialize particles background
        UIManager.initParticles();

        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 600,
                once: true,
                offset: 50
            });
        }

        console.log('TaskFlow initialized successfully');
    },

    /**
     * Load all data from storage
     */
    loadData() {
        this.state.currentTasks = StorageManager.getTasks();
        this.state.currentCategories = StorageManager.getCategories();
        this.state.settings = StorageManager.getSettings();
    },

    /**
     * Initialize UI with loaded data
     */
    initializeUI() {
        // Populate categories
        UIManager.populateCategories(this.state.currentCategories);

        // Apply filters and render tasks
        this.applyFiltersAndSort();

        // Update stats
        UIManager.updateStats(this.state.currentTasks);

        // Set filter values from settings
        document.getElementById('categoryFilter').value = this.state.settings.filterCategory || 'all';
        document.getElementById('statusFilter').value = this.state.settings.filterStatus || 'all';
        document.getElementById('sortSelect').value = this.state.settings.sortBy || 'date';
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Add Task Button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            UIManager.showTaskModal();
        });

        // Task Form Submit
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Cancel Task Button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            UIManager.hideTaskModal();
        });

        // Close Modal Buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            UIManager.hideTaskModal();
        });

        // Add Category Button
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            UIManager.showCategoryModal();
        });

        // Category Form Submit
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        // Cancel Category Button
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
            UIManager.hideCategoryModal();
        });

        // Close Category Modal
        document.getElementById('closeCategoryModal').addEventListener('click', () => {
            UIManager.hideCategoryModal();
        });

        // Confirm Modal Cancel
        document.getElementById('confirmCancel').addEventListener('click', () => {
            UIManager.hideConfirmModal();
        });

        // Clear Completed Tasks
        document.getElementById('clearCompletedBtn').addEventListener('click', () => {
            this.clearCompletedTasks();
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Search Input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.applyFiltersAndSort();
        });

        // Category Filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            StorageManager.updateSetting('filterCategory', e.target.value);
            this.applyFiltersAndSort();
        });

        // Status Filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            StorageManager.updateSetting('filterStatus', e.target.value);
            this.applyFiltersAndSort();
        });

        // Sort Select
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            StorageManager.updateSetting('sortBy', e.target.value);
            this.applyFiltersAndSort();
        });

        // Export Button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Import Button
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importInput').click();
        });

        // Import Input Change
        document.getElementById('importInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Color Picker Update
        document.getElementById('categoryColor').addEventListener('input', (e) => {
            document.querySelector('.color-value').textContent = e.target.value;
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
            
            // Ctrl/Cmd + K to open add task modal
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                UIManager.showTaskModal();
            }
        });
    },

    /**
     * Handle task form submission (add or edit)
     */
    handleTaskSubmit() {
        const form = document.getElementById('taskForm');
        const taskId = form.dataset.taskId;

        // Get form data
        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value
        };

        // Validate
        if (!taskData.title || !taskData.category || !taskData.dueDate) {
            UIManager.showNotification('Please fill in all required fields', 'error');
            return;
        }

        let success = false;

        if (taskId) {
            // Update existing task
            success = StorageManager.updateTask(taskId, taskData);
            if (success) {
                UIManager.showNotification('Task updated successfully', 'success');
            }
        } else {
            // Add new task
            success = StorageManager.addTask(taskData);
            if (success) {
                UIManager.showNotification('Task added successfully', 'success');
            }
        }

        if (success) {
            // Refresh data and UI
            this.loadData();
            this.applyFiltersAndSort();
            UIManager.updateStats(this.state.currentTasks);
            UIManager.hideTaskModal();
        } else {
            UIManager.showNotification('Error saving task', 'error');
        }
    },

    /**
     * Handle category form submission
     */
    handleCategorySubmit() {
        const categoryData = {
            name: document.getElementById('categoryName').value.trim(),
            color: document.getElementById('categoryColor').value
        };

        if (!categoryData.name) {
            UIManager.showNotification('Please enter a category name', 'error');
            return;
        }

        const success = StorageManager.addCategory(categoryData);

        if (success) {
            UIManager.showNotification('Category added successfully', 'success');
            
            // Refresh categories
            this.state.currentCategories = StorageManager.getCategories();
            UIManager.populateCategories(this.state.currentCategories);
            UIManager.hideCategoryModal();
        } else {
            UIManager.showNotification('Category already exists or error occurred', 'error');
        }
    },

    /**
     * Edit a task
     * @param {string} taskId - ID of task to edit
     */
    editTask(taskId) {
        const task = StorageManager.getTaskById(taskId);
        if (task) {
            UIManager.showTaskModal(task);
        }
    },

    /**
     * Delete a task with confirmation
     * @param {string} taskId - ID of task to delete
     */
    deleteTask(taskId) {
        const task = StorageManager.getTaskById(taskId);
        if (!task) return;

        UIManager.showConfirmModal(
            'Delete Task',
            `Are you sure you want to delete "${task.title}"?`,
            () => {
                const success = StorageManager.deleteTask(taskId);
                
                if (success) {
                    UIManager.showNotification('Task deleted successfully', 'success');
                    UIManager.removeTaskCard(taskId);
                    
                    // Refresh data and stats
                    this.loadData();
                    UIManager.updateStats(this.state.currentTasks);
                    
                    // Re-render if no tasks left
                    if (this.state.currentTasks.length === 0) {
                        UIManager.renderTasks([]);
                    }
                } else {
                    UIManager.showNotification('Error deleting task', 'error');
                }
            }
        );
    },

    /**
     * Toggle task completion status
     * @param {string} taskId - ID of task to toggle
     */
    toggleComplete(taskId) {
        const success = StorageManager.toggleTaskComplete(taskId);
        
        if (success) {
            // Refresh data and re-render
            this.loadData();
            this.applyFiltersAndSort();
            UIManager.updateStats(this.state.currentTasks);
        }
    },

    /**
     * Clear all completed tasks
     */
    clearCompletedTasks() {
        const completedCount = this.state.currentTasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            UIManager.showNotification('No completed tasks to clear', 'info');
            return;
        }

        UIManager.showConfirmModal(
            'Clear Completed Tasks',
            `Are you sure you want to delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`,
            () => {
                const success = StorageManager.clearCompletedTasks();
                
                if (success) {
                    UIManager.showNotification('Completed tasks cleared', 'success');
                    
                    // Refresh data and UI
                    this.loadData();
                    this.applyFiltersAndSort();
                    UIManager.updateStats(this.state.currentTasks);
                } else {
                    UIManager.showNotification('Error clearing tasks', 'error');
                }
            }
        );
    },

    /**
     * Apply filters and sorting, then render tasks
     */
    applyFiltersAndSort() {
        let filteredTasks = [...this.state.currentTasks];

        // Apply search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );
        }

        // Apply category filter
        const categoryFilter = document.getElementById('categoryFilter').value;
        if (categoryFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
        }

        // Apply status filter
        const statusFilter = document.getElementById('statusFilter').value;
        if (statusFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (statusFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Apply sorting
        const sortBy = document.getElementById('sortSelect').value;
        filteredTasks = this.sortTasks(filteredTasks, sortBy);

        // Render
        UIManager.renderTasks(filteredTasks);
    },

    /**
     * Sort tasks based on criteria
     * @param {Array} tasks - Tasks to sort
     * @param {string} sortBy - Sort criteria
     * @returns {Array} - Sorted tasks
     */
    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];

        // Always show incomplete tasks first
        sorted.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // Then apply secondary sorting
            switch (sortBy) {
                case 'date':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                
                default:
                    return 0;
            }
        });

        return sorted;
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = this.state.settings.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        StorageManager.updateSetting('theme', newTheme);
        this.state.settings.theme = newTheme;
        UIManager.applyTheme(newTheme);
        
        UIManager.showNotification(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme activated`, 'success');
    },

    /**
     * Export data to JSON file
     */
    exportData() {
        const jsonData = StorageManager.exportData();
        
        if (!jsonData) {
            UIManager.showNotification('Error exporting data', 'error');
            return;
        }

        // Create blob and download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIManager.showNotification('Data exported successfully', 'success');
    },

    /**
     * Import data from JSON file
     * @param {File} file - File to import
     */
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const success = StorageManager.importData(e.target.result);
            
            if (success) {
                UIManager.showNotification('Data imported successfully', 'success');
                
                // Reload entire app
                this.loadData();
                this.initializeUI();
            }
        };

        reader.onerror = () => {
            UIManager.showNotification('Error reading file', 'error');
        };

        reader.readAsText(file);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});

// Expose AppController methods globally for inline onclick handlers
window.AppController = AppController;
