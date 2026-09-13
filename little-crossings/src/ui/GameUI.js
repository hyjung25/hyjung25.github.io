export class GameUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.panel = document.getElementById('panel');
        this.title = document.getElementById('panel-title');
        this.description = document.getElementById('panel-description');
        this.action = document.getElementById('play-button');
        this.score = document.getElementById('score');
        this.pause = document.getElementById('pause-button');
        this.mute = document.getElementById('mute-button');
        this.impactTimer = null;
        gameState.on('onImpact', () => {
            // Give the impact a moment on screen before the game-over panel.
            clearTimeout(this.impactTimer);
            this.impactTimer = setTimeout(() => {
                this.impactTimer = null;
                if (gameState.state === 'gameover') this.showState('gameover');
            }, 450);
        });
        this.action.addEventListener('click', () => {
            if (gameState.state === 'gameover') gameState.restartGame();
            else if (gameState.state === 'paused') gameState.pauseGame();
            else gameState.startGame();
            this.action.blur();
        });
        this.pause.addEventListener('click', () => { gameState.pauseGame(); this.pause.blur(); });
        document.getElementById('restart-button').addEventListener('click', event => { gameState.restartGame(); event.currentTarget.blur(); });
        this.mute.addEventListener('click', () => { gameState.toggleMute(); this.mute.blur(); });
        gameState.on('onStateChange', state => this.showState(state));
        gameState.on('onScoreChange', score => { this.score.textContent = String(score).padStart(3, '0'); });
        gameState.on('onMuteChange', muted => {
            this.mute.textContent = muted ? 'Sound off' : 'Sound on';
            this.mute.setAttribute('aria-pressed', String(muted));
        });
        this.showState(gameState.state);
    }
    showState(state) {
        if (state !== 'gameover') {
            clearTimeout(this.impactTimer);
            this.impactTimer = null;
        }
        this.panel.hidden = state === 'playing' || (state === 'gameover' && this.impactTimer !== null);
        this.pause.disabled = !['playing', 'paused'].includes(state);
        this.pause.textContent = state === 'paused' ? 'Resume' : 'Pause';
        if (state === 'start') {
            this.title.textContent = 'One more crossing.';
            this.description.textContent = 'Dodge the traffic. Ride the logs. See how far your little chicken can go.';
            this.action.textContent = 'Let’s cross →';
        } else if (state === 'paused') {
            this.title.textContent = 'Take a breather.';
            this.description.textContent = 'Your crossing is right where you left it.';
            this.action.textContent = 'Keep going →';
        } else if (state === 'gameover') {
            this.title.textContent = `${this.gameState.score} crossings. Nice run.`;
            this.description.textContent = this.gameState.reason;
            this.action.textContent = 'Try again →';
        }
    }
}
