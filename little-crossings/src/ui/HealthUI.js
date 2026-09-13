export class HealthUI {
    constructor(gameState = null) {
        this.gameState = gameState;
        this.player = null;
        this.element = null;
        this.lastState = null;
    }
    setPlayer(player) { this.player = player; }
    initialize() {
        this.element = document.createElement('aside');
        this.element.className = 'health-card';
        this.element.innerHTML = `
            <svg class="health-portrait" viewBox="0 0 120 120" role="img" aria-label="Happy chicken">
                <circle cx="60" cy="60" r="51" fill="#fff9e9" stroke="#e3e6d3" stroke-width="9"/>
                <circle class="health-ring" cx="60" cy="60" r="51" fill="none" stroke="#79af65" stroke-width="9" pathLength="100" stroke-dasharray="100 100" stroke-linecap="round" transform="rotate(-90 60 60)"/>
                <g class="chicken-face" stroke="#685346" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M43 39 Q35 27 43 25 Q49 24 51 31 Q47 15 56 17 Q62 17 62 29 Q66 20 73 24 Q80 31 70 39" fill="#ef7771"/>
                    <path d="M37 65 Q20 57 23 73 Q26 84 40 80 M83 65 Q100 57 97 73 Q94 84 80 80" fill="#f5e6c9"/>
                    <path d="M60 32 C82 32 89 52 87 72 Q85 95 60 95 Q35 95 33 72 C31 52 38 32 60 32Z" fill="#fffdf1"/>
                    <path class="chicken-wattle" d="M53 81 Q60 101 67 81" fill="#ef7771"/>
                    <ellipse cx="42" cy="73" rx="7" ry="4" fill="#f4b3a6" stroke="none"/>
                    <ellipse cx="78" cy="73" rx="7" ry="4" fill="#f4b3a6" stroke="none"/>
                    <g class="happy-eyes" fill="none"><path d="M41 61 Q46 52 51 61 M69 61 Q74 52 79 61"/><path d="M54 71 Q60 81 66 71" fill="#f5b844"/></g>
                    <g class="sad-eyes" fill="none"><path d="M40 60 Q46 60 50 55 M70 55 Q74 60 80 60"/><path d="M42 65 L50 67 M70 67 L78 65"/><path d="M54 83 Q60 77 66 83"/></g>
                    <path d="M52 68 Q60 63 68 68 L60 76Z" fill="#f5b844"/>
                    <g class="happy-sparkles" stroke="#e2b04d"><path d="M24 42 v8 M20 46 h8 M94 36 v8 M90 40 h8"/></g>
                </g>
                <g class="skull-face" stroke="#786b79" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M37 83 L82 94 M38 94 L83 83" stroke="#fffdf4" stroke-width="8"/>
                    <path d="M34 59 C34 24 86 24 86 59 Q88 77 73 79 L73 87 Q60 95 47 87 L47 79 Q32 77 34 59Z" fill="#fffdf4"/>
                    <ellipse cx="47" cy="60" rx="9" ry="10" fill="#786b79" stroke="none"/>
                    <ellipse cx="73" cy="60" rx="9" ry="10" fill="#786b79" stroke="none"/>
                    <circle cx="45" cy="57" r="3" fill="#fff" stroke="none"/><circle cx="71" cy="57" r="3" fill="#fff" stroke="none"/>
                    <path d="M56 73 Q54 67 60 70 Q66 67 64 73 L60 76Z" fill="#d39cae" stroke="none"/>
                    <path d="M54 83 v5 M66 83 v5"/>
                    <ellipse cx="38" cy="74" rx="5" ry="3" fill="#efbdc9" stroke="none"/><ellipse cx="82" cy="74" rx="5" ry="3" fill="#efbdc9" stroke="none"/>
                    <path d="M47 30 Q60 23 73 30" stroke="#e3ba64" fill="none" stroke-width="4"/>
                </g>
            </svg>
            <div class="health-details"><span class="health-label">ENERGY</span><span class="health-drain">−5/s</span>
                <div class="health-value"><strong>100</strong><span>/ 100</span></div>
                <div class="health-track" role="progressbar" aria-label="Energy" aria-valuemin="0" aria-valuemax="100"><div class="health-fill"></div></div>
                <span class="health-mood">Feeling egg-cellent!</span>
            </div>`;
        document.body.appendChild(this.element);
        this.portrait = this.element.querySelector('svg');
        this.ring = this.element.querySelector('.health-ring');
        this.value = this.element.querySelector('.health-value strong');
        this.track = this.element.querySelector('.health-track');
        this.fill = this.element.querySelector('.health-fill');
        this.mood = this.element.querySelector('.health-mood');
        this.drain = this.element.querySelector('.health-drain');
        this.render();
    }
    render() {
        const health = this.player?.getComponent('health');
        if (!this.element || !health) return;
        const dead = this.gameState?.state === 'gameover' || health.current <= 0;
        const ratio = Math.max(0, Math.min(1, health.current / health.maximum));
        const percent = dead ? 0 : Math.ceil(ratio * 100);
        const mood = dead ? 'dead' : ratio <= 0.5 ? 'sad' : 'happy';
        const rate = dead ? 0 : (health.drainRate || 5);
        const key = `${percent}:${mood}:${rate}`;
        if (key === this.lastState) return;
        this.lastState = key;
        this.drain.textContent = `−${rate}/s`;
        this.element.dataset.mood = mood;
        this.value.textContent = String(percent);
        this.track.setAttribute('aria-valuenow', String(percent));
        this.fill.style.width = `${percent}%`;
        this.ring.style.strokeDasharray = `${percent} 100`;
        this.mood.textContent = dead ? 'Rest in peeps ♡' : mood === 'sad' ? 'A little pick-me-up?' : 'Feeling egg-cellent!';
        this.portrait.setAttribute('aria-label', dead ? 'Cute chicken skull' : mood === 'sad' ? 'Droopy chicken' : 'Happy chicken');
    }
    resize() { this.lastState = null; }
}
