/**
 * UI.JS
 * Handles all UI rendering and DOM manipulation
 * Separates presentation logic from business logic
 */

const UIManager = {
    
    /**
     * Render all tasks to the DOM
     * @param {Array} tasks - Array of task objects to render
     */
    renderTasks(tasks) {
        const container = document.getElementById('tasksContainer');
        
        // Show empty state if no tasks
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks yet</h3>
                    <p>Create your first task to get started</p>
                </div>
            `;
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Render each task
        tasks.forEach((task, index) => {
            const taskCard = this.createTaskCard(task);
            container.appendChild(taskCard);
        });
    },

    /**
     * Create a task card element
     * @param {Object} task - Task object
     * @returns {HTMLElement} - Task card element
     */
    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.setAttribute('data-task-id', task.id);
        card.setAttribute('data-aos', 'fade-up');
        
        // Set priority color as CSS variable
        const priorityColors = {
            high: '#dc2626',
            medium: '#f59e0b',
            low: '#10b981'
        };
        card.style.setProperty('--priority-color', priorityColors[task.priority]);

        // Get category
        const category = StorageManager.getCategoryById(task.category);
        const categoryColor = category ? category.color : '#6b7280';
        
        // Format date
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });

        // Check if overdue
        const isOverdue = !task.completed && dueDate < new Date();

        card.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="AppController.toggleComplete('${task.id}')">
                <span class="checkmark"></span>
            </div>

            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="task-category" style="--category-color: ${categoryColor}">
                        ${category ? category.name : 'Uncategorized'}
                    </span>
                    <span class="task-priority ${task.priority}">
                        ${task.priority}
                    </span>
                </div>
                
                ${task.description ? `
                    <p class="task-description">${this.escapeHtml(task.description)}</p>
                ` : ''}
                
                <div class="task-meta">
                    <span ${isOverdue ? 'style="color: var(--color-priority-high);"' : ''}>
                        <i class="fas fa-calendar"></i>
                        ${formattedDate}
                        ${isOverdue ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                    </span>
                    <span>
                        <i class="fas fa-clock"></i>
                        Created ${this.getRelativeTime(task.createdAt)}
                    </span>
                </div>
            </div>

            <div class="task-actions">
                <button class="icon-btn" onclick="AppController.editTask('${task.id}')" 
                        title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="AppController.deleteTask('${task.id}')" 
                        title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return card;
    },

    /**
     * Update task statistics display
     * @param {Array} tasks - Array of all tasks
     */
    updateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        // Update with animation
        this.animateNumber('totalTasks', total);
        this.animateNumber('completedTasks', completed);
        this.animateNumber('pendingTasks', pending);
    },

    /**
     * Animate number change
     * @param {string} elementId - ID of element to update
     * @param {number} newValue - New value to display
     */
    animateNumber(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue === newValue) return;

        element.classList.add('updating');
        element.textContent = newValue;
        
        setTimeout(() => {
            element.classList.remove('updating');
        }, 500);
    },

    /**
     * Populate category dropdowns
     * @param {Array} categories - Array of category objects
     */
    populateCategories(categories) {
        const taskCategorySelect = document.getElementById('taskCategory');
        const categoryFilter = document.getElementById('categoryFilter');

        // Clear existing options (except default)
        taskCategorySelect.innerHTML = '<option value="">Select category</option>';
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        // Add category options
        categories.forEach(category => {
            // For task form
            const option1 = document.createElement('option');
            option1.value = category.id;
            option1.textContent = category.name;
            taskCategorySelect.appendChild(option1);

            // For filter
            const option2 = document.createElement('option');
            option2.value = category.id;
            option2.textContent = category.name;
            categoryFilter.appendChild(option2);
        });
    },

    /**
     * Show task modal for adding/editing
     * @param {Object|null} task - Task object to edit, or null for new task
     */
    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');

        // Reset form
        form.reset();

        if (task) {
            // Edit mode
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate;
            form.dataset.taskId = task.id;
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            delete form.dataset.taskId;
            
            // Set default due date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('taskDueDate').value = today;
        }

        modal.classList.add('active');
        
        // Initialize AOS for modal content
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    },

    /**
     * Hide task modal
     */
    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
    },

    /**
     * Show category modal
     */
    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        form.reset();
        
        // Set default color
        document.getElementById('categoryColor').value = '#3b82f6';
        document.querySelector('.color-value').textContent = '#3b82f6';
        
        modal.classList.add('active');
        
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    },

    /**
     * Hide category modal
     */
    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('active');
    },

    /**
     * Show confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback function on confirmation
     */
    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;

        // Set up confirm button
        const confirmBtn = document.getElementById('confirmAction');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.onclick = () => {
            onConfirm();
            this.hideConfirmModal();
        };

        modal.classList.add('active');
        
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    },

    /**
     * Hide confirmation modal
     */
    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('active');
    },

    /**
     * Apply theme
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('#themeToggle i').className = 'fas fa-sun';
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelector('#themeToggle i').className = 'fas fa-moon';
        }
    },

    /**
     * Show notification/toast message
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', or 'info'
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              'info-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-bg-secondary);
            color: var(--color-text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            border: 2px solid ${type === 'success' ? 'var(--color-accent-secondary)' : 
                                type === 'error' ? 'var(--color-accent-tertiary)' : 
                                'var(--color-accent-primary)'};
            box-shadow: 0 4px 12px var(--color-shadow);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Helper: Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Helper: Get relative time string
     * @param {string} dateString - ISO date string
     * @returns {string} - Relative time string
     */
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },

    /**
     * Remove task card with animation
     * @param {string} taskId - ID of task to remove
     */
    removeTaskCard(taskId) {
        const card = document.querySelector(`[data-task-id="${taskId}"]`);
        if (card) {
            card.classList.add('removing');
            setTimeout(() => {
                card.remove();
                // Check if container is empty
                const container = document.getElementById('tasksContainer');
                if (container.children.length === 0) {
                    this.renderTasks([]);
                }
            }, 400);
        }
    },

    /**
     * Initialize particles.js background
     */
    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 50,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: '#d97706'
                    },
                    shape: {
                        type: 'circle'
                    },
                    opacity: {
                        value: 0.3,
                        random: true
                    },
                    size: {
                        value: 3,
                        random: true
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#d97706',
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out',
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: {
                            enable: true,
                            mode: 'grab'
                        },
                        onclick: {
                            enable: true,
                            mode: 'push'
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 140,
                            line_linked: {
                                opacity: 0.5
                            }
                        },
                        push: {
                            particles_nb: 4
                        }
                    }
                },
                retina_detect: true
            });
        }
    }
};
