/**
 * AMBIENT.JS
 * Calm background sound for Focus mode.
 *
 * Primary path: real looping audio files in /audio (your own uploaded tracks).
 * Fallback path: if a file 404s or fails to decode, automatically falls back
 * to a synthesized tone via Web Audio API so the app never just goes silent
 * or throws an error mid-session.
 */

const AMBIENT_TRACKS = [
    { id: 'none',            label: 'Off' },
    { id: 'forest',          label: 'Forest',            file: 'audio/forest.mp3' },
    { id: 'waterfall-birds', label: 'Waterfall & Birds', file: 'audio/waterfall-birds.mp3' },
    { id: 'wind',            label: 'Wind',              file: 'audio/wind.mp3' },
    { id: 'cafe',            label: 'Cafe',              file: 'audio/cafe.mp3' },
    { id: 'kora',            label: 'Kora (strings)',    file: 'audio/kora.mp3' },
    { id: 'ambient-1',       label: 'Focus Tone I',      file: 'audio/ambient-1.mp3' },
    { id: 'ambient-2',       label: 'Focus Tone II',     file: 'audio/ambient-2.mp3' }
];

const AmbientSound = {
    audioEl: null,
    fallbackNodes: [],
    ctx: null,
    masterGain: null,
    current: 'none',
    usingFallback: false,

    stop() {
        if (this.audioEl) {
            // Remove the error listener BEFORE clearing src. Setting src=''
            // on a playing/loading <audio> element fires a spurious 'error'
            // event in most browsers, which would otherwise trigger the
            // synthesized fallback tone even though we're intentionally
            // stopping playback (this was the "phantom waterfall" bug).
            if (this.audioEl._errorHandler) {
                this.audioEl.removeEventListener('error', this.audioEl._errorHandler);
            }
            this.audioEl.pause();
            this.audioEl.src = '';
            this.audioEl = null;
        }
        this.fallbackNodes.forEach(n => {
            try { n.stop ? n.stop() : n.disconnect(); } catch (e) {}
        });
        this.fallbackNodes = [];
        this.current = 'none';
        this.usingFallback = false;
    },

    setVolume(v) {
        if (this.audioEl) this.audioEl.volume = v;
        if (this.masterGain) this.masterGain.gain.value = v;
    },

    play(id, volume) {
        this.stop();
        if (id === 'none') return;

        const track = AMBIENT_TRACKS.find(t => t.id === id);
        if (!track || !track.file) return;

        const audio = new Audio(track.file);
        audio.loop = true;
        audio.volume = volume;

        const errorHandler = () => {
            console.warn(`Ambient track "${id}" failed to load — falling back to a generated tone.`);
            this._playFallback(volume);
        };
        audio.addEventListener('error', errorHandler);
        // Stash the handler on the element itself so stop() can remove
        // this exact listener later (addEventListener callbacks can't be
        // removed unless you keep a reference to them).
        audio._errorHandler = errorHandler;

        audio.play().catch(() => {
            // Autoplay can be blocked until a user gesture; the Start button click covers this in practice
        });

        this.audioEl = audio;
        this.current = id;
    },

    /* ---- Synthesized fallback (no external file needed) ---- */
    _ensureContext() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    _noiseBuffer() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    },

    _playFallback(volume) {
        this.usingFallback = true;
        this._ensureContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = volume;
        this.masterGain.connect(this.ctx.destination);

        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuffer();
        src.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        src.connect(filter);
        filter.connect(this.masterGain);
        src.start();
        this.fallbackNodes.push(src, filter);
    }
};