/**
 * AMBIENT.JS
 * Generates calm background sound entirely in the browser via Web Audio API.
 * No external audio files — so this never breaks on a static host and there's
 * nothing to license or go missing later.
 */

const AmbientSound = {
    ctx: null,
    nodes: [],
    current: 'none',

    ensureContext() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    stop() {
        this.nodes.forEach(n => {
            try { n.stop ? n.stop() : n.disconnect(); } catch (e) {}
        });
        this.nodes = [];
        this.current = 'none';
    },

    setVolume(v) {
        if (this.masterGain) this.masterGain.gain.value = v;
    },

    _noiseBuffer() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    },

    play(type, volume) {
        this.stop();
        if (type === 'none') return;
        this.ensureContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = volume;
        this.masterGain.connect(this.ctx.destination);

        if (type === 'rain' || type === 'waves') {
            // Filtered white noise, gently modulated for "waves" swell
            const src = this.ctx.createBufferSource();
            src.buffer = this._noiseBuffer();
            src.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = type === 'rain' ? 1800 : 700;

            src.connect(filter);
            filter.connect(this.masterGain);
            src.start();
            this.nodes.push(src, filter);

            if (type === 'waves') {
                const lfo = this.ctx.createOscillator();
                lfo.frequency.value = 0.12;
                const lfoGain = this.ctx.createGain();
                lfoGain.gain.value = 0.12;
                lfo.connect(lfoGain);
                lfoGain.connect(this.masterGain.gain);
                lfo.start();
                this.nodes.push(lfo, lfoGain);
            }
        } else if (type === 'hum') {
            // Two soft detuned low oscillators — a warm, steady drone
            [55, 55.6].forEach(freq => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const gain = this.ctx.createGain();
                gain.gain.value = 0.5;
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start();
                this.nodes.push(osc, gain);
            });
        }

        this.current = type;
    }
};
