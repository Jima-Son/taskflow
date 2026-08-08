/**
 * NOTES.JS
 * Text + voice notes, optionally attached to a task.
 * Dictation: Web Speech API (SpeechRecognition) — free, browser-native.
 * Read-aloud: Web Speech API (SpeechSynthesis) — free, browser-native.
 * Neither needs a Google Cloud key or costs anything to run.
 *
 * FREE_NOTE_LIMIT and read-aloud are gated behind a *local-only* premium flag
 * for now — no real payment is wired up. This is a placeholder for a future
 * real paywall (Stripe + accounts) if that's ever worth building.
 */

const FREE_NOTE_LIMIT = 10;

const NotesController = {
    recognition: null,
    listening: false,

    init() {
        UIManager.applyTheme(StorageManager.getSettings().theme);
        this.populateTaskSelect();
        this.setupSpeechRecognition();
        this.renderNotes();
        this.renderPremiumCard();
        this.bindEvents();
    },

    populateTaskSelect() {
        const select = document.getElementById('noteTaskSelect');
        const tasks = StorageManager.getTasks();
        select.innerHTML = '<option value="">No task</option>' +
            tasks.map(t => `<option value="${t.id}">${this.escapeHtml(t.title)}</option>`).join('');
    },

    escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    },

    setupSpeechRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            document.getElementById('speechUnsupported').style.display = 'block';
            document.getElementById('micBtn').disabled = true;
            return;
        }
        this.recognition = new SR();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        const textarea = document.getElementById('noteText');
        let finalTranscript = '';

        this.recognition.onstart = () => {
            finalTranscript = textarea.value ? textarea.value + ' ' : '';
            document.getElementById('micStatus').textContent = 'Listening...';
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            textarea.value = (finalTranscript + interim).trim();
        };

        this.recognition.onerror = (event) => {
            document.getElementById('micStatus').textContent =
                event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Dictation error — try again.';
            this.stopListening();
        };

        this.recognition.onend = () => {
            if (this.listening) this.stopListening();
        };
    },

    toggleListening() {
        if (!this.recognition) return;
        this.listening ? this.stopListening() : this.startListening();
    },

    startListening() {
        this.listening = true;
        document.getElementById('micBtn').classList.add('listening');
        document.getElementById('micBtn').innerHTML = '<i class="fas fa-stop"></i> Stop';
        this.recognition.start();
    },

    stopListening() {
        this.listening = false;
        document.getElementById('micBtn').classList.remove('listening');
        document.getElementById('micBtn').innerHTML = '<i class="fas fa-microphone"></i> Dictate';
        document.getElementById('micStatus').textContent = '';
        try { this.recognition.stop(); } catch (e) {}
    },

    saveNote() {
        const text = document.getElementById('noteText').value.trim();
        if (!text) return;

        const premium = StorageManager.isPremium();
        const existing = StorageManager.getNotes();
        if (!premium && existing.length >= FREE_NOTE_LIMIT) {
            document.getElementById('micStatus').textContent =
                `Free tier holds ${FREE_NOTE_LIMIT} notes — unlock below for unlimited.`;
            return;
        }

        const taskSelect = document.getElementById('noteTaskSelect');
        const selected = taskSelect.options[taskSelect.selectedIndex];

        StorageManager.addNote({
            text,
            taskId: taskSelect.value || null,
            taskTitle: taskSelect.value ? selected.textContent : null
        });

        document.getElementById('noteText').value = '';
        this.renderNotes();
    },

    deleteNote(id) {
        StorageManager.deleteNote(id);
        this.renderNotes();
    },

    speakNote(text) {
        if (!StorageManager.isPremium()) return;
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        window.speechSynthesis.speak(utter);
    },

    renderNotes() {
        const notes = StorageManager.getNotes();
        const list = document.getElementById('notesList');
        const empty = document.getElementById('notesEmpty');
        const premium = StorageManager.isPremium();

        document.getElementById('noteCount').textContent =
            premium ? `${notes.length} notes` : `${notes.length} / ${FREE_NOTE_LIMIT} (free tier)`;

        if (notes.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
            return;
        }
        empty.style.display = 'none';

        list.innerHTML = notes.map(n => {
            const date = new Date(n.createdAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });
            return `
            <div class="note-card" data-id="${n.id}">
                <div class="note-card-top">
                    <div>
                        <div class="note-meta">${date}</div>
                        ${n.taskId ? `<span class="note-tag">${this.escapeHtml(n.taskTitle || 'Task')}</span>` : ''}
                    </div>
                    <div class="note-actions">
                        <button class="speak-btn ${premium ? '' : 'locked'}" data-id="${n.id}" title="${premium ? 'Read aloud' : 'Unlock to enable'}">
                            <i class="fas fa-volume-high"></i>
                        </button>
                        <button class="delete-note-btn" data-id="${n.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-text">${this.escapeHtml(n.text)}</div>
            </div>`;
        }).join('');

        list.querySelectorAll('.speak-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const note = notes.find(n => n.id === btn.dataset.id);
                if (note) this.speakNote(note.text);
            });
        });
        list.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteNote(btn.dataset.id));
        });
    },

    renderPremiumCard() {
        const card = document.getElementById('premiumCard');
        const unlocked = StorageManager.isPremium();
        card.classList.toggle('hidden', unlocked);
    },

    bindEvents() {
        document.getElementById('micBtn').addEventListener('click', () => this.toggleListening());
        document.getElementById('saveNoteBtn').addEventListener('click', () => this.saveNote());
        document.getElementById('unlockBtn').addEventListener('click', () => {
            StorageManager.setPremium(true);
            this.renderPremiumCard();
            this.renderNotes();
        });
        document.getElementById('themeToggle').addEventListener('click', () => {
            const settings = StorageManager.getSettings();
            settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
            StorageManager.saveSettings(settings);
            UIManager.applyTheme(settings.theme);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => NotesController.init());
