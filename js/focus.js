/**
 * FOCUS.JS
 * Pomodoro-style timer controller for the Focus page.
 * Reuses StorageManager (tasks + focus settings + session log) so this stays
 * one connected app rather than a separate tool bolted on.
 */

const FocusController = {
    settings: {},
    mode: 'focus',            // 'focus' | 'short' | 'long'
    secondsLeft: 25 * 60,
    totalSeconds: 25 * 60,
    running: false,
    intervalId: null,
    completedFocusSessions: 0, // toward long break threshold
    RING_CIRCUMFERENCE: 2 * Math.PI * 130,

    init() {
        this.settings = StorageManager.getFocusSettings();
        this.applySettingsToInputs();
        this.populateTaskSelect();
        this.setMode('focus', false);
        this.renderReport();
        this.bindEvents();
        UIManager.applyTheme(StorageManager.getSettings().theme);
    },

    applySettingsToInputs() {
        document.getElementById('focusMinutes').value = this.settings.focusMinutes;
        document.getElementById('shortBreakMinutes').value = this.settings.shortBreakMinutes;
        document.getElementById('longBreakMinutes').value = this.settings.longBreakMinutes;
        document.getElementById('sessionsBeforeLongBreak').value = this.settings.sessionsBeforeLongBreak;
        document.getElementById('ambientVolume').value = this.settings.ambientVolume;

        const select = document.getElementById('ambientSelect');
        select.innerHTML = AMBIENT_TRACKS.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
        select.value = this.settings.ambientSound;
    },

    populateTaskSelect() {
        const select = document.getElementById('focusTaskSelect');
        const tasks = StorageManager.getTasks().filter(t => !t.completed);
        select.innerHTML = '<option value="">No specific task</option>' +
            tasks.map(t => `<option value="${t.id}">${this.escapeHtml(t.title)}</option>`).join('');
    },

    escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    },

    minutesForMode(mode) {
        if (mode === 'focus') return Number(this.settings.focusMinutes);
        if (mode === 'short') return Number(this.settings.shortBreakMinutes);
        return Number(this.settings.longBreakMinutes);
    },

    setMode(mode, autoStart) {
        this.pause();
        this.mode = mode;
        document.body.classList.remove('mode-focus', 'mode-short', 'mode-long');
        document.body.classList.add(`mode-${mode}`);
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

        this.totalSeconds = this.minutesForMode(mode) * 60;
        this.secondsLeft = this.totalSeconds;
        this.updateDisplay();

        const label = document.getElementById('timerTaskLabel');
        const taskSelect = document.getElementById('focusTaskSelect');
        if (mode === 'focus') {
            const selected = taskSelect.options[taskSelect.selectedIndex];
            label.textContent = selected && selected.value ? selected.textContent : 'No task selected';
        } else {
            label.textContent = mode === 'short' ? 'Short break' : 'Long break';
        }

        if (autoStart) this.start();
    },

    start() {
        if (this.running) return;
        this.running = true;
        document.getElementById('startPauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';
        AmbientSound.play(this.settings.ambientSound, this.settings.ambientVolume);

        this.intervalId = setInterval(() => {
            this.secondsLeft--;
            this.updateDisplay();
            if (this.secondsLeft <= 0) this.completeSession();
        }, 1000);
    },

    pause() {
        this.running = false;
        clearInterval(this.intervalId);
        document.getElementById('startPauseBtn').innerHTML = '<i class="fas fa-play"></i> Start';
        AmbientSound.stop();
    },

    reset() {
        this.pause();
        this.secondsLeft = this.totalSeconds;
        this.updateDisplay();
    },

    skip() {
        this.completeSession(true);
    },

    completeSession(skipped) {
        this.pause();

        if (this.mode === 'focus' && !skipped) {
            const taskSelect = document.getElementById('focusTaskSelect');
            const selected = taskSelect.options[taskSelect.selectedIndex];
            StorageManager.logFocusSession({
                taskId: taskSelect.value || null,
                taskTitle: selected && selected.value ? selected.textContent : 'Unassigned',
                minutes: this.minutesForMode('focus')
            });
            this.completedFocusSessions++;
            this.renderReport();
        }

        if (!skipped) {
            this.playAlarm();
            this.showToast(this.completionMessage());
        }

        this.updateSessionDots();

        if (this.mode === 'focus') {
            const threshold = Number(this.settings.sessionsBeforeLongBreak);
            const nextMode = (this.completedFocusSessions % threshold === 0) ? 'long' : 'short';
            this.setMode(nextMode, this.settings.autoStartBreaks);
        } else {
            this.setMode('focus', this.settings.autoStartFocus);
        }
    },

    completionMessage() {
        if (this.mode === 'focus') return 'Nice work — focus session complete. Time for a break.';
        return this.mode === 'short' ? 'Short break over — back to it.' : 'Long break over — back to it.';
    },

    showToast(message) {
        const toast = document.getElementById('sessionToast');
        if (!toast) return;
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => toast.classList.remove('show'), 6000);
    },

    playAlarm() {
        const audioEl = document.getElementById('alarmSound');
        audioEl.currentTime = 0;
        audioEl.volume = 0.6;
        const playPromise = audioEl.play();
        if (playPromise) {
            playPromise.catch(() => this._playAlarmFallback());
        }
        audioEl.onerror = () => this._playAlarmFallback();
    },

    _playAlarmFallback() {
        // Simple two-tone chime via Web Audio API — used only if the real alarm file fails to load
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        [880, 1108].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.value = 0.0001;
            osc.connect(gain);
            gain.connect(ctx.destination);
            const t = ctx.currentTime + i * 0.22;
            gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.start(t);
            osc.stop(t + 0.55);
        });
    },

    updateSessionDots() {
        const wrap = document.getElementById('sessionDots');
        const threshold = Number(this.settings.sessionsBeforeLongBreak);
        const doneInCycle = this.completedFocusSessions % threshold;
        const dots = [];
        for (let i = 0; i < threshold; i++) {
            dots.push(`<span class="session-dot ${i < doneInCycle || (doneInCycle === 0 && this.completedFocusSessions > 0 && i < threshold) ? '' : ''}${i < (doneInCycle === 0 ? 0 : doneInCycle) ? ' done' : ''}"></span>`);
        }
        wrap.innerHTML = dots.join('');
    },

    updateDisplay() {
        const m = Math.floor(this.secondsLeft / 60).toString().padStart(2, '0');
        const s = (this.secondsLeft % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${m}:${s}`;
        document.title = `${m}:${s} — TaskFlow Focus`;

        const progress = 1 - (this.secondsLeft / this.totalSeconds);
        const offset = this.RING_CIRCUMFERENCE * (1 - progress);
        document.getElementById('ringProgress').style.strokeDashoffset = offset;
    },

    renderReport() {
        const sessions = StorageManager.getFocusSessions();
        const now = new Date();
        const todayStr = now.toDateString();

        const todayMinutes = sessions
            .filter(s => new Date(s.completedAt).toDateString() === todayStr)
            .reduce((sum, s) => sum + s.minutes, 0);

        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        const weekSessions = sessions.filter(s => new Date(s.completedAt) >= new Date(weekAgo.toDateString()));
        const weekMinutes = weekSessions.reduce((sum, s) => sum + s.minutes, 0);

        document.getElementById('todayMinutes').textContent = `${todayMinutes}m`;
        document.getElementById('weekMinutes').textContent = `${weekMinutes}m`;

        // Last 7 days bar chart
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            days.push(d);
        }
        const maxMinutes = Math.max(1, ...days.map(d =>
            sessions.filter(s => new Date(s.completedAt).toDateString() === d.toDateString())
                    .reduce((sum, s) => sum + s.minutes, 0)
        ));

        const barsHtml = days.map(d => {
            const mins = sessions
                .filter(s => new Date(s.completedAt).toDateString() === d.toDateString())
                .reduce((sum, s) => sum + s.minutes, 0);
            const height = Math.round((mins / maxMinutes) * 100);
            const label = d.toLocaleDateString('en-US', { weekday: 'narrow' });
            return `<div class="week-bar-col">
                <div class="week-bar" style="height:${height}%" title="${mins} min"></div>
                <div class="week-bar-day">${label}</div>
            </div>`;
        }).join('');
        document.getElementById('weekBars').innerHTML = barsHtml;
    },

    saveSettingsFromInputs() {
        this.settings.focusMinutes = Number(document.getElementById('focusMinutes').value) || 25;
        this.settings.shortBreakMinutes = Number(document.getElementById('shortBreakMinutes').value) || 5;
        this.settings.longBreakMinutes = Number(document.getElementById('longBreakMinutes').value) || 15;
        this.settings.sessionsBeforeLongBreak = Number(document.getElementById('sessionsBeforeLongBreak').value) || 4;
        StorageManager.saveFocusSettings(this.settings);
        if (!this.running) this.setMode(this.mode, false);
    },

    bindEvents() {
        document.getElementById('startPauseBtn').addEventListener('click', () => {
            this.running ? this.pause() : this.start();
        });
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('skipBtn').addEventListener('click', () => this.skip());

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode, false));
        });

        document.getElementById('focusTaskSelect').addEventListener('change', (e) => {
            if (this.mode === 'focus') {
                const label = document.getElementById('timerTaskLabel');
                const selected = e.target.options[e.target.selectedIndex];
                label.textContent = selected.value ? selected.textContent : 'No task selected';
            }
        });

        ['focusMinutes', 'shortBreakMinutes', 'longBreakMinutes', 'sessionsBeforeLongBreak'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.saveSettingsFromInputs());
        });

        document.getElementById('ambientSelect').addEventListener('change', (e) => {
            this.settings.ambientSound = e.target.value;
            StorageManager.updateFocusSetting('ambientSound', e.target.value);
            if (this.running) AmbientSound.play(e.target.value, this.settings.ambientVolume);
        });

        document.getElementById('ambientVolume').addEventListener('input', (e) => {
            const v = Number(e.target.value);
            this.settings.ambientVolume = v;
            AmbientSound.setVolume(v);
            StorageManager.updateFocusSetting('ambientVolume', v);
        });

        document.getElementById('toastClose').addEventListener('click', () => {
            document.getElementById('sessionToast').classList.remove('show');
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            const settings = StorageManager.getSettings();
            settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
            StorageManager.saveSettings(settings);
            UIManager.applyTheme(settings.theme);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => FocusController.init());