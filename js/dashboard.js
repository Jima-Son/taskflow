/**
 * DASHBOARD.JS
 * Home page — read-only snapshot pulled from the same StorageManager data
 * used by the Tasks, Focus, and Notes pages. Task checkboxes here are the
 * one interactive piece (toggle complete); everything else links out to
 * the full page for details.
 */

const DashboardController = {
    init() {
        UIManager.applyTheme(StorageManager.getSettings().theme);
        this.renderGreeting();
        this.renderTodayTasks();
        this.renderFocusSummary();
        this.renderLatestNote();
        this.bindEvents();
    },

    escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    },

    renderGreeting() {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        document.getElementById('dashGreeting').textContent = `${greeting} — here's where things stand`;
    },

    /**
     * Today's tasks = anything due today, plus anything overdue, that
     * isn't completed yet. Overdue items are shown first so nothing
     * slips through unnoticed.
     */
    renderTodayTasks() {
        const tasks = StorageManager.getTasks();
        const now = new Date();
        const todayStr = now.toDateString();

        const dueToday = tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === todayStr);
        const overdue = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date(todayStr));

        const combined = [...overdue, ...dueToday];
        const list = document.getElementById('dashTasksList');

        if (combined.length === 0) {
            list.innerHTML = `<div class="dash-empty"><i class="fas fa-circle-check"></i> Nothing due today. You're clear.</div>`;
            return;
        }

        const MAX_SHOWN = 6;
        const shown = combined.slice(0, MAX_SHOWN);
        const remaining = combined.length - shown.length;

        list.innerHTML = shown.map(task => {
            const isOverdue = !task.completed && new Date(task.dueDate) < new Date(todayStr);
            return `
            <div class="dash-task-item">
                <div class="task-checkbox">
                    <input type="checkbox" data-task-id="${task.id}">
                    <span class="checkmark"></span>
                </div>
                <span class="dash-task-title">${this.escapeHtml(task.title)}</span>
                ${isOverdue ? '<span class="dash-overdue-tag">Overdue</span>' : ''}
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>`;
        }).join('') + (remaining > 0 ? `<div class="dash-more">+${remaining} more on Tasks page</div>` : '');

        list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                StorageManager.toggleTaskComplete(taskId);
                this.renderTodayTasks();
            });
        });
    },

    renderFocusSummary() {
        const sessions = StorageManager.getFocusSessions();
        const todayStr = new Date().toDateString();
        const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === todayStr);
        const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);

        document.getElementById('dashFocusMinutes').textContent = `${todayMinutes}m`;
        document.getElementById('dashFocusSessions').textContent = todaySessions.length;
    },

    renderLatestNote() {
        const notes = StorageManager.getNotes(); // already newest-first
        const container = document.getElementById('dashLatestNote');

        if (notes.length === 0) {
            container.innerHTML = `<div class="dash-empty"><i class="fas fa-microphone"></i> No notes yet.</div>`;
            return;
        }

        const latest = notes[0];
        const date = new Date(latest.createdAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });

        container.innerHTML = `
            <div class="dash-note-meta">${date}${latest.taskTitle ? ` · ${this.escapeHtml(latest.taskTitle)}` : ''}</div>
            <p class="dash-note-text">${this.escapeHtml(latest.text)}</p>
        `;
    },

    bindEvents() {
        document.getElementById('themeToggle').addEventListener('click', () => {
            const settings = StorageManager.getSettings();
            settings.theme = UIManager.nextTheme(settings.theme);
            StorageManager.saveSettings(settings);
            UIManager.applyTheme(settings.theme);
        });
        // Note: the mobile nav-toggle button doesn't need a handler here —
        // ui.js registers one shared listener for it on every page.
    }
};

document.addEventListener('DOMContentLoaded', () => DashboardController.init());