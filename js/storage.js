/**
 * STORAGE.JS
 * Manages all localStorage operations for the Task Manager
 * Implements CRUD operations with error handling and data validation
 */

// Storage Keys Configuration
const STORAGE_KEYS = {
    TASKS: 'taskflow_tasks',
    CATEGORIES: 'taskflow_categories',
    SETTINGS: 'taskflow_settings',
    FOCUS_SETTINGS: 'taskflow_focus_settings',
    FOCUS_SESSIONS: 'taskflow_focus_sessions',
    NOTES: 'taskflow_notes',
    PREMIUM: 'taskflow_premium'
};

// Default Focus/Pomodoro Settings
const DEFAULT_FOCUS_SETTINGS = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    ambientSound: 'none',   // 'none' | 'rain' | 'hum' | 'waves'
    ambientVolume: 0.25,
    autoStartBreaks: false,
    autoStartFocus: false
};

// Default Categories
const DEFAULT_CATEGORIES = [
    { id: 'cat_1', name: 'Work', color: '#3b82f6' },
    { id: 'cat_2', name: 'Personal', color: '#8b5cf6' },
    { id: 'cat_3', name: 'Shopping', color: '#ec4899' },
    { id: 'cat_4', name: 'Health', color: '#10b981' }
];

// Default Settings
const DEFAULT_SETTINGS = {
    theme: 'light',
    sortBy: 'date',
    filterCategory: 'all',
    filterStatus: 'all'
};

/**
 * Storage Manager Object
 * Encapsulates all localStorage operations
 */
const StorageManager = {
    
    /**
     * Check if localStorage is available and working
     * @returns {boolean} - True if localStorage is available
     */
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage is not available:', e);
            return false;
        }
    },

    /**
     * Initialize storage with default data if empty
     */
    initialize() {
        if (!this.isLocalStorageAvailable()) {
            console.warn('localStorage not available. Data will not persist.');
            return;
        }

        try {
            // Initialize tasks if not exist
            if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
                this.saveTasks([]);
            }

            // Initialize categories if not exist
            if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
                this.saveCategories(DEFAULT_CATEGORIES);
            }

            // Initialize settings if not exist
            if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                this.saveSettings(DEFAULT_SETTINGS);
            }

            // Initialize focus settings if not exist
            if (!localStorage.getItem(STORAGE_KEYS.FOCUS_SETTINGS)) {
                this.saveFocusSettings(DEFAULT_FOCUS_SETTINGS);
            }

            // Initialize focus session log if not exist
            if (!localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS)) {
                this.saveFocusSessions([]);
            }

            console.log('Storage initialized successfully');
        } catch (error) {
            console.error('Error initializing storage:', error);
        }
    },

    /**
     * TASKS - CRUD Operations
     */

    /**
     * Get all tasks from localStorage
     * @returns {Array} - Array of task objects
     */
    getTasks() {
        try {
            const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error reading tasks from localStorage:', error);
            return [];
        }
    },

    /**
     * Save all tasks to localStorage
     * @param {Array} tasks - Array of task objects
     * @returns {boolean} - Success status
     */
    saveTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some tasks.');
            }
            return false;
        }
    },

    /**
     * Add a new task
     * @param {Object} task - Task object to add
     * @returns {boolean} - Success status
     */
    addTask(task) {
        try {
            const tasks = this.getTasks();
            
            // Generate unique ID
            task.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            task.createdAt = new Date().toISOString();
            task.completed = false;
            task.completedAt = null;

            tasks.push(task);
            return this.saveTasks(tasks);
        } catch (error) {
            console.error('Error adding task:', error);
            return false;
        }
    },

    /**
     * Update an existing task
     * @param {string} taskId - ID of task to update
     * @param {Object} updates - Object containing fields to update
     * @returns {boolean} - Success status
     */
    updateTask(taskId, updates) {
        try {
            const tasks = this.getTasks();
            const taskIndex = tasks.findIndex(t => t.id === taskId);

            if (taskIndex === -1) {
                console.error('Task not found:', taskId);
                return false;
            }

            // Merge updates with existing task
            tasks[taskIndex] = { ...tasks[taskIndex], ...updates };

            return this.saveTasks(tasks);
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    },

    /**
     * Delete a task
     * @param {string} taskId - ID of task to delete
     * @returns {boolean} - Success status
     */
    deleteTask(taskId) {
        try {
            const tasks = this.getTasks();
            const filteredTasks = tasks.filter(t => t.id !== taskId);

            if (filteredTasks.length === tasks.length) {
                console.error('Task not found:', taskId);
                return false;
            }

            return this.saveTasks(filteredTasks);
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    },

    /**
     * Toggle task completion status
     * @param {string} taskId - ID of task to toggle
     * @returns {boolean} - Success status
     */
    toggleTaskComplete(taskId) {
        try {
            const tasks = this.getTasks();
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                console.error('Task not found:', taskId);
                return false;
            }

            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;

            return this.saveTasks(tasks);
        } catch (error) {
            console.error('Error toggling task:', error);
            return false;
        }
    },

    /**
     * Delete all completed tasks
     * @returns {boolean} - Success status
     */
    clearCompletedTasks() {
        try {
            const tasks = this.getTasks();
            const activeTasks = tasks.filter(t => !t.completed);
            return this.saveTasks(activeTasks);
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            return false;
        }
    },

    /**
     * Get a single task by ID
     * @param {string} taskId - ID of task to retrieve
     * @returns {Object|null} - Task object or null if not found
     */
    getTaskById(taskId) {
        try {
            const tasks = this.getTasks();
            return tasks.find(t => t.id === taskId) || null;
        } catch (error) {
            console.error('Error getting task by ID:', error);
            return null;
        }
    },

    /**
     * CATEGORIES - CRUD Operations
     */

    /**
     * Get all categories
     * @returns {Array} - Array of category objects
     */
    getCategories() {
        try {
            const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            return categories ? JSON.parse(categories) : DEFAULT_CATEGORIES;
        } catch (error) {
            console.error('Error reading categories:', error);
            return DEFAULT_CATEGORIES;
        }
    },

    /**
     * Save all categories
     * @param {Array} categories - Array of category objects
     * @returns {boolean} - Success status
     */
    saveCategories(categories) {
        try {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
            return true;
        } catch (error) {
            console.error('Error saving categories:', error);
            return false;
        }
    },

    /**
     * Add a new category
     * @param {Object} category - Category object to add
     * @returns {boolean} - Success status
     */
    addCategory(category) {
        try {
            const categories = this.getCategories();
            
            // Check for duplicate category names
            if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
                console.warn('Category already exists:', category.name);
                return false;
            }

            category.id = `cat_${Date.now()}`;
            categories.push(category);
            return this.saveCategories(categories);
        } catch (error) {
            console.error('Error adding category:', error);
            return false;
        }
    },

    /**
     * Get category by ID
     * @param {string} categoryId - ID of category to retrieve
     * @returns {Object|null} - Category object or null
     */
    getCategoryById(categoryId) {
        try {
            const categories = this.getCategories();
            return categories.find(c => c.id === categoryId) || null;
        } catch (error) {
            console.error('Error getting category:', error);
            return null;
        }
    },

    /**
     * SETTINGS - CRUD Operations
     */

    /**
     * Get all settings
     * @returns {Object} - Settings object
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
        } catch (error) {
            console.error('Error reading settings:', error);
            return DEFAULT_SETTINGS;
        }
    },

    /**
     * Save all settings
     * @param {Object} settings - Settings object
     * @returns {boolean} - Success status
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    /**
     * Update a specific setting
     * @param {string} key - Setting key to update
     * @param {*} value - New value
     * @returns {boolean} - Success status
     */
    updateSetting(key, value) {
        try {
            const settings = this.getSettings();
            settings[key] = value;
            return this.saveSettings(settings);
        } catch (error) {
            console.error('Error updating setting:', error);
            return false;
        }
    },

    /**
     * FOCUS / POMODORO - Settings & Session Log
     */

    /**
     * Get focus (pomodoro) settings
     * @returns {Object} - Focus settings object
     */
    getFocusSettings() {
        try {
            const settings = localStorage.getItem(STORAGE_KEYS.FOCUS_SETTINGS);
            return settings ? { ...DEFAULT_FOCUS_SETTINGS, ...JSON.parse(settings) } : DEFAULT_FOCUS_SETTINGS;
        } catch (error) {
            console.error('Error reading focus settings:', error);
            return DEFAULT_FOCUS_SETTINGS;
        }
    },

    /**
     * Save focus (pomodoro) settings
     * @param {Object} settings
     * @returns {boolean}
     */
    saveFocusSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.FOCUS_SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving focus settings:', error);
            return false;
        }
    },

    /**
     * Update one focus setting
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    updateFocusSetting(key, value) {
        const settings = this.getFocusSettings();
        settings[key] = value;
        return this.saveFocusSettings(settings);
    },

    /**
     * Get all logged focus sessions
     * @returns {Array}
     */
    getFocusSessions() {
        try {
            const sessions = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
            return sessions ? JSON.parse(sessions) : [];
        } catch (error) {
            console.error('Error reading focus sessions:', error);
            return [];
        }
    },

    /**
     * Save all focus sessions
     * @param {Array} sessions
     * @returns {boolean}
     */
    saveFocusSessions(sessions) {
        try {
            localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
            return true;
        } catch (error) {
            console.error('Error saving focus sessions:', error);
            return false;
        }
    },

    /**
     * Log a completed focus session (only completed FOCUS blocks count toward reports,
     * breaks are not logged as focus time)
     * @param {Object} session - { taskId, taskTitle, minutes, completedAt }
     * @returns {boolean}
     */
    logFocusSession(session) {
        try {
            const sessions = this.getFocusSessions();
            sessions.push({
                id: `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                taskId: session.taskId || null,
                taskTitle: session.taskTitle || 'Unassigned',
                minutes: session.minutes,
                completedAt: session.completedAt || new Date().toISOString()
            });
            return this.saveFocusSessions(sessions);
        } catch (error) {
            console.error('Error logging focus session:', error);
            return false;
        }
    },

    /**
     * NOTES - CRUD Operations
     */
    getNotes() {
        try {
            const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
            return notes ? JSON.parse(notes) : [];
        } catch (error) {
            console.error('Error reading notes:', error);
            return [];
        }
    },

    saveNotes(notes) {
        try {
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
            return true;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    },

    addNote(note) {
        try {
            const notes = this.getNotes();
            notes.unshift({
                id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                text: note.text,
                taskId: note.taskId || null,
                createdAt: new Date().toISOString()
            });
            return this.saveNotes(notes);
        } catch (error) {
            console.error('Error adding note:', error);
            return false;
        }
    },

    deleteNote(noteId) {
        try {
            const notes = this.getNotes().filter(n => n.id !== noteId);
            return this.saveNotes(notes);
        } catch (error) {
            console.error('Error deleting note:', error);
            return false;
        }
    },

    /**
     * PREMIUM - local-only feature gate (no real payment wired up yet)
     */
    isPremium() {
        try {
            return localStorage.getItem(STORAGE_KEYS.PREMIUM) === 'true';
        } catch (error) {
            return false;
        }
    },

    setPremium(value) {
        try {
            localStorage.setItem(STORAGE_KEYS.PREMIUM, value ? 'true' : 'false');
            return true;
        } catch (error) {
            console.error('Error setting premium flag:', error);
            return false;
        }
    },

    /**
     * IMPORT/EXPORT Operations
     */

    /**
     * Export all data as JSON
     * @returns {string} - JSON string of all data
     */
    exportData() {
        try {
            const data = {
                tasks: this.getTasks(),
                categories: this.getCategories(),
                settings: this.getSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    },

    /**
     * Import data from JSON
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} - Success status
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            // Validate data structure
            if (!data.tasks || !data.categories) {
                throw new Error('Invalid data format');
            }

            // Save imported data
            this.saveTasks(data.tasks);
            this.saveCategories(data.categories);
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Invalid file format. Please select a valid TaskFlow export file.');
            return false;
        }
    },

    /**
     * Clear all data (reset to defaults)
     * @returns {boolean} - Success status
     */
    clearAllData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.TASKS);
            localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            this.initialize();
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
};

// Initialize storage on script load
StorageManager.initialize();
