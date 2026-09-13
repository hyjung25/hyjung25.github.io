export class GameStateManager {
    constructor() {
        this.state = 'start';
        this.score = 0;
        this.maxForwardPosition = 0;
        this.isPaused = false;
        this.isMuted = false;
        this.reason = '';
        this.callbacks = {};
    }
    setState(state) {
        this.state = state;
        this.isPaused = state === 'paused';
        this.notifyCallbacks('onStateChange', state);
    }
    startGame() { this.setState('playing'); }
    pauseGame() {
        if (this.state === 'playing') this.setState('paused');
        else if (this.state === 'paused') this.setState('playing');
    }
    endGame(reason = 'Out of energy. Pick up pink health packs!') {
        if (this.state !== 'playing') return;
        this.reason = reason;
        this.setState('gameover');
        this.notifyCallbacks('onGameOver', this.score);
    }
    restartGame() {
        this.score = 0;
        this.maxForwardPosition = 0;
        this.reason = '';
        this.notifyCallbacks('onRestart');
        this.notifyCallbacks('onScoreChange', 0);
        this.setState('playing');
    }
    updateScore(z) {
        if (z <= this.maxForwardPosition) return;
        this.maxForwardPosition = z;
        this.score = z;
        this.notifyCallbacks('onScoreChange', this.score);
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.notifyCallbacks('onMuteChange', this.isMuted);
    }
    on(event, callback) { (this.callbacks[event] ||= []).push(callback); }
    notifyCallbacks(event, value) {
        for (const callback of this.callbacks[event] || []) callback(value);
    }
}
