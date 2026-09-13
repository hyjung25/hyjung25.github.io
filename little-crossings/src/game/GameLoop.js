export class GameLoop {
    constructor() {
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.fixedTimestep = 1000 / 60; // 60 FPS
        this.systems = [];
        this.renderCallback = null;
        this.gameState = null;
        this.running = false;
        this.frameRequest = null;
        this.boundLoop = this.loop.bind(this);
        this.maxFrameTime = 100; // Bound catch-up work after a stall or hidden tab.
    }

    setSystems(systems) {
        this.systems = systems;
    }

    setRenderCallback(callback) {
        this.renderCallback = callback;
    }

    setGameState(gameState) {
        this.gameState = gameState;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.accumulatedTime = 0;
        this.lastFrameTime = performance.now();
        this.frameRequest = requestAnimationFrame(this.boundLoop);
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.frameRequest);
        this.frameRequest = null;
    }

    loop(currentTime) {
        if (!this.running) return;

        const deltaTime = Math.min(this.maxFrameTime, Math.max(0, currentTime - this.lastFrameTime));
        this.lastFrameTime = currentTime;
        this.accumulatedTime += deltaTime;

        // Fixed timestep updates for game logic
        while (this.accumulatedTime >= this.fixedTimestep) {
            this.update(this.fixedTimestep);
            this.accumulatedTime -= this.fixedTimestep;
        }

        // Render at display refresh rate
        this.render();

        if (this.running) this.frameRequest = requestAnimationFrame(this.boundLoop);
    }

    update(deltaTime) {
        if (this.gameState && (this.gameState.isPaused || this.gameState.state !== 'playing')) return;

        // Update all systems
        for (const system of this.systems) {
            if (this.gameState && this.gameState.state !== 'playing') break;
            if (system && system.update) {
                system.update(deltaTime);
            }
        }
    }

    render() {
        if (this.renderCallback) {
            this.renderCallback();
        }
    }
}
