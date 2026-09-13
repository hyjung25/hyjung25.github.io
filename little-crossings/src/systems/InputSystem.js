import { WORLD } from '../game/config.js';

const PHYSICAL_KEYS = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyM: 'm', KeyR: 'r', Space: ' ', Enter: 'enter', Escape: 'escape', ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright' };
const inputKey = event => PHYSICAL_KEYS[event.code] || (event.key || '').toLowerCase();

const DIRECTIONS = {
    w: [0, 1], arrowup: [0, 1], s: [0, -1], arrowdown: [0, -1],
    // From this camera, positive world X projects toward screen-left.
    a: [1, 0], arrowleft: [1, 0], d: [-1, 0], arrowright: [-1, 0]
};
export class InputSystem {
    constructor(entityManager, gameState, worldManager = null) {
        Object.assign(this, { entityManager, gameState });
        this.worldManager = worldManager;
        this.player = null;
        this.keyStates = new Map();
        this.inputQueue = [];
        this.cooldown = 0;
        this.moveDelay = WORLD.moveDelay;
    }
    setPlayer(player) { this.player = player; }
    reset() {
        this.keyStates.clear();
        this.inputQueue.length = 0;
        this.cooldown = 0;
        if (this.player) this.player.getComponent('transform').hopRemaining = 0;
    }
    initialize() {
        window.addEventListener('keydown', event => this.handleKeyDown(event));
        window.addEventListener('keyup', event => this.keyStates.delete(inputKey(event)));
        window.addEventListener('blur', () => {
            this.reset();
            if (this.gameState.state === 'playing') this.gameState.pauseGame();
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.reset();
                if (this.gameState.state === 'playing') this.gameState.pauseGame();
            }
        });
        this.gameState.on('onStateChange', () => this.reset());
    }
    handleKeyDown(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const key = inputKey(event);
        if (DIRECTIONS[key] || [' ', 'r', 'm', 'enter'].includes(key)) event.preventDefault();
        if (event.repeat || this.keyStates.has(key)) return;
        if (key === 'r') { this.gameState.restartGame(); return; }
        if (key === 'm') { this.gameState.toggleMute(); return; }
        if (this.gameState.state === 'start') {
            this.gameState.startGame();
            if (!DIRECTIONS[key]) return;
        }
        if (key === ' ' || key === 'escape') { this.gameState.pauseGame(); return; }
        if (this.gameState.state !== 'playing' || !DIRECTIONS[key]) return;
        this.keyStates.set(key, true);
        this.queueMovement(key);
    }
    queueMovement(key) {
        if (DIRECTIONS[key] && this.inputQueue.length < 2) this.inputQueue.push(DIRECTIONS[key]);
    }
    update(deltaTime) {
        if (!this.player) return;
        const transform = this.player.getComponent('transform');
        transform.hopRemaining = Math.max(0, (transform.hopRemaining || 0) - deltaTime);
        this.cooldown = Math.max(0, this.cooldown - deltaTime);
        if (this.cooldown > 0) return;
        const held = Array.from(this.keyStates.keys()).pop();
        const direction = this.inputQueue.shift() || DIRECTIONS[held];
        if (direction) {
            this.executeMove(direction);
            this.cooldown = this.moveDelay;
        }
    }
    executeMove([dx, dz]) {
        const transform = this.player.getComponent('transform');
        const x = transform.position.x + dx;
        const z = transform.gridPosition.y + dz;
        if (Math.abs(x) > WORLD.playerLimit || z < Math.max(-3, this.gameState.maxForwardPosition - WORLD.behind + 1)) return;
        if (this.worldManager?.isTreeBlocked(x, z)) return;
        transform.position.set(x, WORLD.playerY, z);
        transform.gridPosition.set(x, z);
        transform.rotation.y = Math.atan2(dx, dz);
        transform.hopRemaining = this.moveDelay;
        if (dz > 0) this.gameState.updateScore(z);
    }
}
