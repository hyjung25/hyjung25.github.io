export class SoundSystem {
    constructor(gameState) {
        this.context = null;
        this.master = null;
        this.gameState = gameState;
        this.voices = new Set();
        // Capture runs before keyboard shortcuts, including Korean IME keys.
        window.addEventListener('pointerdown', () => this.unlock(), { capture: true });
        window.addEventListener('keydown', () => this.unlock(), { capture: true });
        gameState.on('onScoreChange', score => { if (score > 0) this.play(520, 0.07); });
        gameState.on('onGameOver', () => this.playDeath());
        gameState.on('onRestart', () => this.stop());
        gameState.on('onMuteChange', muted => {
            if (this.master) this.master.gain.setValueAtTime(muted ? 0 : 1, this.context.currentTime);
            if (muted) this.stop();
            else this.unlock().then(() => this.play(660, 0.1));
        });
    }
    async unlock() {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        try {
            if (!this.context) {
                this.context = new Audio();
                this.master = this.context.createGain();
                this.master.gain.value = this.gameState.isMuted ? 0 : 1;
                this.master.connect(this.context.destination);
            }
            if (this.context.state === 'suspended') await this.context.resume();
        } catch { /* The game still works if audio is unavailable. */ }
    }
    play(frequency, duration) { this.note(frequency, frequency * 0.8, 0, duration, 0.05); }
    playDeath() {
        // Two short "꼬꼬" clucks followed by a longer, descending "닭~".
        this.note(640, 320, 0, 0.13, 0.16);
        this.note(760, 350, 0.17, 0.14, 0.16);
        this.note(900, 180, 0.36, 0.65, 0.18, true);
    }
    note(startFrequency, endFrequency, delay, duration, volume, wobble = false) {
        if (!this.context || !this.master || this.gameState.isMuted || this.context.state !== 'running') return;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const start = this.context.currentTime + delay;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(startFrequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        oscillator.connect(gain).connect(this.master);
        let vibrato, depth;
        if (wobble) {
            vibrato = this.context.createOscillator(); depth = this.context.createGain();
            vibrato.frequency.value = 19; depth.gain.value = 45;
            vibrato.connect(depth).connect(oscillator.frequency);
            vibrato.start(start); vibrato.stop(start + duration);
        }
        const voice = { oscillator, vibrato };
        this.voices.add(voice);
        oscillator.onended = () => {
            oscillator.disconnect(); gain.disconnect(); vibrato?.disconnect(); depth?.disconnect();
            this.voices.delete(voice);
        };
        oscillator.start(start); oscillator.stop(start + duration);
    }
    stop() {
        for (const voice of this.voices) {
            voice.oscillator.stop();
            voice.vibrato?.stop();
        }
        this.voices.clear();
    }
}
